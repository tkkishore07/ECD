$.sap.require("sap.m.MessageBox");
sap.ui.controller("HR.view.ContractInternExtension", {	
    onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("ContractInternExtension").attachPatternMatched(this._routePatternMatched, this);
    },
    

	setProperties: function(){
	        this.changes= {};
            this.parameters= ""; 
            this.status= "";
            this.WiID= "";
            that=this;
	},
    roleCheck: function(employeeType, employeeID, data){ 
        var role = HR.i18n.User.Roles.find(employeeID);
        if(!HR.util.FormAccess.ContractInternExtension.onlyContractorsInterns(role, employeeType)){
                this._router._myNavBack();
                sap.m.MessageToast.show(HR.i18n.Messages.ContractInternExtension.onlyContractorsInterns, {closeOnBrowserNavigation: false});
        }
        else if(!HR.util.FormAccess.ContractInternExtension.onlyWestValley(role, employeeType, data.d.I0016Kontx)){
                this._router._myNavBack();
                sap.m.MessageToast.show(HR.i18n.Messages.ContractInternExtension.onlyWestValley, {closeOnBrowserNavigation: false});
        }
    },
	hide: function(){
	    HR.util.Control.hide("contractEndDate", this);
	    HR.util.Control.hide("contractEffectiveDate-error", this);
	},
	clearForm:function(){
	    HR.util.Control.clear("contractEffectiveDate", this);
	    HR.util.Control.clear("contractEndDate", this);
        HR.util.Control.clear("comments", this);
	    this.changes={};
	},
	getChanges:function(){
        this.changes={};
        this.changes.contractEffectiveDate = HR.util.Control.getValue("contractEffectiveDate", this);
        this.changes.contractEndDate = HR.util.Control.getValue("contractEndDate", this);
        this.changes.comments= HR.util.Control.getValue("comments", this);
	},
	_routePatternMatched: function(oEvent) {
		this.clearForm();
	    this.hide();
	    this.setProperties();
	    var oModel = new sap.ui.model.json.JSONModel();
	    this.status=oEvent.getParameter("arguments").status;
	    var that=this;
	    var loadForm = function(data, that){
	        oModel.setData(data);
	        that.roleCheck(data.d.I0001Persg, data.d.Pernr, data);
	        that.WiID=data.d.WiID;
            HR.util.Control.setValue("contractEffectiveDate", that, data.d.EffectiveDate);
            
            that.getView().setModel(oModel);
		    sap.ui.getCore().setModel(oModel, "contractInternExtension");
	    };
	    if(this.status === "new"){
	        var employeeID = oEvent.getParameter("arguments").ID;
	        HR.util.Busy.setBusyOn(true); //Showing busy indicator before the form is loaded
		    $.getJSON(HR.i18n.URL.ContractInternExtension.getDetails(employeeID, HR.i18n.User.Roles.find(employeeID)), function (data) {
		        loadForm(data, that);
		        that.getView().byId("contractEffectiveDateOld-table").setVisible(false);
		        HR.util.Busy.setBusyOff(); //Showing busy indicator before the form is loaded
		    }).error(function(err) { 
		         HR.util.Busy.setBusyOff();
		        that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
		    });
	    }
        else if(this.status === "saved"){
            var ecdID = oEvent.getParameter("arguments").ID;
            var wiID = oEvent.getParameter("arguments").workItemId;
            
            HR.util.Busy.setBusyOn(); //Showing busy indicator before the form is loaded
            $.getJSON(HR.i18n.URL.ContractInternExtension.getDetailsSavedForm(wiID), function (data) {
                loadForm(data, that);
                that.getView().byId("contractEffectiveDateOld").setVisible(true);
                HR.util.Control.setValue("contractEffectiveDateOld", that, data.d.EffectiveDateOld, "date");
                HR.util.Control.setValue("contractEndDate", that, data.d.I0016CtedtNew, "edit");
                HR.util.Busy.setBusyOff(); //Showing busy indicator before the form is loaded
            }).error(function(err) { 
                HR.util.Busy.setBusyOff();
                that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });
        }
	},	
	openDialog: function (sType) {
        if (!this[sType]) {
          this[sType] = sap.ui.xmlfragment("HR.view.Dialog." + sType, this);
          this.getView().addDependent(this[sType]);
        }
        this[sType].open();
    },
    edit : function (evt) {
        HR.util.Control.edit(evt.getSource().data("id"), this);
    },
    cancel : function (evt) {
        HR.util.Control.cancel(evt.getSource().data("id"), this );
    },
    cancelContractInternExtension: function(evt){
        this.openDialog('Cancel');
    },
    
    submit: function(evt){
        var that=this;
        HR.util.Busy.setBusyOff();
        var successFn = function(data){
            HR.util.Busy.setBusyOff();
            that._router.navTo("EmployeeSearch",{pageNum:1});
			var oLayout = new sap.ui.layout.VerticalLayout();
			oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.ContractInternExtension.submitSuccess}));
            oLayout.addContent(new sap.m.Label({text: "Reference Number:"+ data.d.ProcessReferenceNumber}));
			sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success");
        };
        this.go(successFn,"SEND","Submit", HR.i18n.Messages.ContractInternExtension.submit);
    },
    getMessageBoxLayout: function(text){
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: text}));
        oLayout.addContent(new sap.m.Label({text: ""}));
        if(this.changes.warnings.length>0){
                oLayout.addContent(new sap.m.ObjectStatus({text: "Warnings:", state: "Warning", icon:"sap-icon://alert"}));
                for (var num in this.changes.warnings) 
                    oLayout.addContent(new sap.m.Label({text: this.changes.warnings[num]}));
        }
        return  oLayout;   
    },
    go: function(successFn, action, msgBoxTitle, msgBoxMsg){
        try{
            this.getChanges(); //get the changes
            if(HR.util.General.objectLength(this.changes)===1) { 
                if(msgBoxTitle==="Submit"){
                    sap.m.MessageToast.show(HR.i18n.Messages.ContractInternExtension.noChangesSubmit, {closeOnBrowserNavigation: false});
                    return;
                }
            }
            this.validations(); // do validations
            if($.isEmptyObject(this.changes.validations)){
                this.warnings(); //assign warning messages
                var oLayout = this.getMessageBoxLayout(msgBoxMsg);
                var that=this;
                that.setParameters(action);
                
                var update = function(){
                    HR.util.General.ajaxWrite(HR.i18n.URL.ContractInternExtension.saveSubmit.entity, HR.i18n.URL.ContractInternExtension.saveSubmit.link(that.status), that.parameters, successFn, that);
                }
                //to avoid displaying popups for save if there are no warnings
                if(msgBoxTitle==="Save"){
                    update();
                }
                else if(msgBoxTitle==="Submit"){
                // Syntax - MessageBox.show(message, icon, title, [oActions], fnCallback, oDefaultAaction, sDialogId)
                sap.m.MessageBox.show(oLayout,
                    sap.m.MessageBox.Icon.NONE,
                    msgBoxTitle, [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                           update();
                        }
                    },"submitDialog",
                    sap.m.MessageBox.Action.NO
                );
                HR.util.PopupDrag.draggable("submitDialog");
                }
            }
            else{
                sap.m.MessageToast.show(HR.i18n.Messages.ContractInternExtension.validationFailed);
            }
        }
        catch(err){
           
            console.log(err);
        }
    },
    close: function(evt){
            this.getChanges(); //get the changes
            if(HR.util.General.objectLength(this.changes)===1) {  
                this._router.navTo("EmployeeSearch",{pageNum:1}); 
                return; 
            }
            var that=this;
            var successFn = function(data, object){
                HR.util.Busy.setBusyOff(); //Showing busy indicator before the form is loaded
                that._router.navTo("EmployeeSearch",{pageNum:1});
                sap.m.MessageToast.show(HR.i18n.Messages.ContractInternExtension.formSave, {closeOnBrowserNavigation: false});
                object.WiID=data.d.WiID;
            }; 
            this.warnings(); //assign warning messages
            var oLayout = this.getMessageBoxLayout(HR.i18n.Messages.ContractInternExtension.saveConfirm);
            
                sap.m.MessageBox.show(oLayout,sap.m.MessageBox.Icon.NONE, "Save", 
                    [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.CANCEL],
                function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        that.go(successFn,"SAVE_DRAFT", "Save", HR.i18n.Messages.ContractInternExtension.saveConfirm);
                    }
                    if (oAction === sap.m.MessageBox.Action.NO) {
                        that._router._myNavBack();
                    }
                },"saveDialog");
                HR.util.PopupDrag.draggable("saveDialog");
    },
    validateContractEffectiveDate:function(evt){
        var value=HR.util.Control.getValue("contractEffectiveDate", this);

        var plus2Months =HR.util.General.getDate();
        plus2Months.setDate(plus2Months.getDate() + 60); 
        var minus2Months =HR.util.General.getDate();
        minus2Months.setDate(minus2Months.getDate() - 60); 
        var beginDate = HR.util.Formatter.getNormalDateDefault(sap.ui.getCore().getModel("contractInternExtension").getProperty("/d/I0000Begda"));
        beginDate.setHours(0); beginDate.setMinutes(0);beginDate.setSeconds(0); beginDate.setMilliseconds(0);
        
        var error=false;
        if(value===undefined){
           error=HR.i18n.Messages.ContractInternExtension.errors.contractEffectiveDateNull;
        }
        else if(value =="Invalid Date"){
           error=HR.i18n.Messages.ContractInternExtension.errors.date;
        }
        else if(HR.util.Control.getValue("contractEffectiveDate", this) > plus2Months || HR.util.Control.getValue("contractEffectiveDate", this)<minus2Months){
            error=HR.i18n.Messages.ContractInternExtension.errors.twoMonths;
        }
        else if(HR.util.Control.getValue("contractEffectiveDate", this) <= beginDate){
            error= HR.i18n.Messages.EmployeeDataChange.futureAction;            
        }     
        if(error===false){
            HR.util.Control.setValueState("contractEffectiveDate",this,"None");
        }
        else{
            HR.util.Control.setValueState("contractEffectiveDate",this,"Error");
            this.changes.validations.contractEffectiveDate=error;
        }
    },
    validateContractEndDate:function(evt){
        var oneYearFromEffectiveDate =HR.util.Control.getValue("contractEffectiveDate", this);
        oneYearFromEffectiveDate.setFullYear(oneYearFromEffectiveDate.getFullYear() + 1); 
        var value=HR.util.Control.getValue("contractEndDate", this) 
        var error=false;
        if(value===undefined){
            error=HR.i18n.Messages.ContractInternExtension.errors.contractEndDateNull;
        }    
        else if(value =="Invalid Date"){
            error=HR.i18n.Messages.ContractInternExtension.errors.date;
        }    
        else if(value > oneYearFromEffectiveDate){ // contract extension should be for 12 months or less
            error=HR.i18n.Messages.ContractInternExtension.errors.monthContract;
        }    
        else if(value< HR.util.Control.getValue("contractEffectiveDate", this) ){
            error=HR.i18n.Messages.ContractInternExtension.errors.contractEndDateLess;
        }  
        else if(HR.util.Control.getValue("contractType-old", this)=="Fixed term contract" && HR.util.Control.getValue("contractEndDate", this)<=HR.util.General.getDate() ){
            error=HR.i18n.Messages.ContractInternExtension.errors.fixedTermContract;
        }   
        else if(HR.util.Control.getValue("contractEndDate", this)!==undefined && HR.util.Control.getValue("contractEndDate-old", this)!==undefined  && HR.util.Control.getValue("contractEndDate", this).getTime()===HR.util.Control.getValue("contractEndDate-old", this, "date").getTime()){
            error=HR.i18n.Messages.ContractInternExtension.errors.noChangeContractEndDate;
        } 
        if(error===false){
            HR.util.Control.setValueState("contractEndDate",this,"None");
        }
        else{
            HR.util.Control.setValueState("contractEndDate",this,"Error" );
            this.changes.validations.contractEndDate=error;
        }
    },
    error: function(evt){
      
        sap.m.MessageToast.show(this.changes.validations[evt.getSource().data("id")]);
    },
    validations: function(){
        this.changes.validations = [];
        this.validateContractEffectiveDate();
        this.validateContractEndDate();
    },
    warnings: function(){
        this.changes.warnings=[];
        var getDate = HR.util.General.getDate();
        if (this.changes.contractEffectiveDate < getDate){ //contract effective date is in the past
            this.changes.warnings.push(HR.i18n.Messages.ContractInternExtension.errors.pastContractEffectiveDate);
        }
        if(this.changes.contractEndDate < getDate){
            this.changes.warnings.push(HR.i18n.Messages.ContractInternExtension.errors.pastContractEndDate);
        }
    },
    setParameters: function(action){
        this.parameters={};
        this.parameters =new sap.ui.getCore().getModel("contractInternExtension").getData();
        if(this.changes.contractEffectiveDate!==undefined) 
            this.parameters.d.EffectiveDate= HR.util.Formatter.getODataDate(this.changes.contractEffectiveDate);
        if(this.changes.contractEndDate!==undefined) 
            this.parameters.d.I0016CtedtNew=HR.util.Formatter.getODataDate(this.changes.contractEndDate);
        if(this.changes.comments!==undefined) this.parameters.d.HrasrCurrentNote=this.changes.comments;
        this.parameters.d.Event=action;
        this.parameters.d.WiID= this.WiID;
    },
    cancelNo: function (oEvent) {
        this[oEvent.getSource().data("dialogType")].close();
    },
    cancelYes: function () {
        this._router.navTo("EmployeeSearch",{pageNum:1});
    },
    handleNavButtonPress : function () {
		this._router.navTo("Menu");
	}
});