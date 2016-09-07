$.sap.require("sap.m.MessageBox");
sap.ui.controller("HR.view.Termination", {	
    onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("Termination").attachPatternMatched(this._routePatternMatched, this);
    },
    setProperties:function(){
        this.changes= {};
        this.parameters= ""; 
        this.status= "";
        this.WiID= "";
        this.isIsrael= false;
        this.LastDayKey="";
        that=this;
    },
    roleCheck: function(employeeType, employeeID, data){
        //hide if not israel.location based
        if(!HR.i18n.User.Locations.isIsrael(data.d.I0001Btrtl)){
            this.getView().byId("israelTermNotificationDate-columnListItem").setVisible(false);
        } 
        else {
            this.getView().byId("israelTermNotificationDate-columnListItem").setVisible(true);
            this.isIsrael=true;
        }
    },
	clearForm:function(){
	    HR.util.Control.clear("terminationReason", this);
	    HR.util.Control.clear("terminationDate", this);
        HR.util.Control.clear("lastDayWorked", this);
        HR.util.Control.clear("rehireEligible", this);
        HR.util.Control.clear("israelTermNotificationDate", this);
        HR.util.Control.clear("comments", this);
        this.getView().byId("israelTermNotificationDate-columnListItem").setVisible(true);
	    this.changes={};
	},
	getChanges:function(){
        this.changes={};
        this.changes.terminationReason = HR.util.Control.getValue("terminationReason", this,"key");
        this.changes.terminationReasonDescription= HR.util.Control.getValue("terminationReason", this, "value");
        this.changes.terminationDate = HR.util.Control.getValue("terminationDate", this);
        this.changes.lastDayWorked= HR.util.Control.getValue("lastDayWorked", this);
        this.changes.rehireEligible= HR.util.Control.getValue("rehireEligible", this);
        this.changes.israelTermNotificationDate= HR.util.Control.getValue("israelTermNotificationDate", this);
        this.changes.comments= HR.util.Control.getValue("comments", this);
	},
	hide: function(){
	       HR.util.Control.hide("terminationReason-error", this);
	       HR.util.Control.hide("terminationDate-error", this);
	       HR.util.Control.hide("lastDayWorked-error", this);
	       HR.util.Control.hide("rehireEligible-error", this);
	       HR.util.Control.hide("israelTermNotificationDate-error", this);
	},
	_routePatternMatched: function(oEvent) {
		this.clearForm();
		this.hide();
		this.setProperties();
	    var oModel = new sap.ui.model.json.JSONModel();
	    var that=this;
	    var url;
	    var ID = oEvent.getParameter("arguments").ID;
	    var wiID = oEvent.getParameter("arguments").workItemId;
	    this.status = oEvent.getParameter("arguments").status;
	    if(this.status === "new") url = HR.i18n.URL.Termination.getDetails(ID, HR.i18n.User.Roles.find(ID));
	    else if(this.status === "saved") url = HR.i18n.URL.Termination.getDetailsSavedForm(wiID);
        HR.util.Busy.setBusyOn(true);
        $.getJSON(url, function (data) {
    	    oModel.setData(data);
    	    that.LastDayKey=data.d.LastDayKey;
    	    that.roleCheck(data.d.I0001Persg, data.d.Pernr, data);
    	    that.WiID=data.d.WiID;
            that.setTerminationReasonDropdown(data.d.Pernr, data.d.I0001Persg, HR.i18n.User.Roles.find(data.d.Pernr));
            HR.util.Control.setValue("terminationReason", that, data.d.Massg);
            HR.util.Control.setValue("terminationDate", that, data.d.TermDate);
            HR.util.Control.setValue("lastDayWorked", that, data.d.LastDayWorked);
            HR.util.Control.setValue("rehireEligible", that, data.d.RehireEligibility);
            HR.util.Control.setValue("israelTermNotificationDate", that, data.d.IlNoticeDate);
            HR.util.Busy.setBusyOff();
            that.getView().setModel(oModel);
    	    sap.ui.getCore().setModel(oModel, "Termination");
        }).error(function(err) { 
            HR.util.Busy.setBusyOff();
            that._router._myNavBack();
            sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });
	},	
	
	setTerminationReasonDropdown: function(employeeID, employeeType, InitiatorRole){
	var oModel = new sap.ui.model.json.JSONModel();
	sap.ui.getCore().setModel(oModel, "terminationReason");
	this.getView().byId("terminationReason").setModel(oModel);
	var finalData={"d":{"results":[{"Massg":"","Mgtxt":""}]}};//push an empty for the 0th index/default value
	var that=this;
	$.ajax({
	        
            url: HR.i18n.URL.Termination.getTerminationReason(employeeID, employeeType, InitiatorRole), 
            dataType: "json",
            async: false,
            success: function(data, textStatus, jqXHR) {
                //setting the data into Termination Reasons drop down
                data.d.results.unshift({"Massg":"", "Mgtxt":""})
                oModel.setData(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                sap.m.MessageToast.show(HR.i18n.Messages.Termination.errorTerminationReason, {closeOnBrowserNavigation: false});
            }
        });
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
    cancelTermination: function(evt){
        this.openDialog('Cancel');
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
    submit: function(evt){
        var that=this;
        var successFn = function(data){
            HR.util.Busy.setBusyOff();
            that._router.navTo("EmployeeSearch",{pageNum:1});
			var oLayout = new sap.ui.layout.VerticalLayout();
			oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.Termination.submitSuccess}));
            oLayout.addContent(new sap.m.Label({text: "Reference Number:"+ data.d.ProcessReferenceNumber}));
			sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success");
        };
        this.go(successFn,"SEND","Submit", HR.i18n.Messages.Termination.submit);
    },
    close: function(evt){
        this.getChanges(); //get the changes
            if(HR.util.General.objectLength(this.changes)===0) {  
                this._router.navTo("EmployeeSearch",{pageNum:1}); 
                return; 
            }
            var that=this;
        var successFn = function(data, object){
            HR.util.Busy.setBusyOff();
            that._router.navTo("EmployeeSearch",{pageNum:1});
            sap.m.MessageToast.show(HR.i18n.Messages.Termination.formSave, {closeOnBrowserNavigation: false});
            object.WiID=data.d.WiID;
        }; 
            this.warnings(); //assign warning messages
            var oLayout = this.getMessageBoxLayout(HR.i18n.Messages.Termination.saveConfirm);
            
                sap.m.MessageBox.show(oLayout,sap.m.MessageBox.Icon.NONE, "Save", 
                    [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.CANCEL],
                function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        that.go(successFn,"SAVE_DRAFT", "Save", HR.i18n.Messages.Termination.saveConfirm);
                    }
                    if (oAction === sap.m.MessageBox.Action.NO) {
                        that._router._myNavBack();
                    }
                });
    },    
    go: function(successFn, action, msgBoxTitle, msgBoxMsg){
        try{
            this.getChanges(); //get the changes
            if(HR.util.General.objectLength(this.changes)===0) { 
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
                    HR.util.General.ajaxWrite(HR.i18n.URL.Termination.saveSubmit.entity, HR.i18n.URL.Termination.saveSubmit.link(that.status), that.parameters, successFn, that);
                }
                //to avoid displaying popups for save if there are no warnings
                if(msgBoxTitle==="Save") {
                            update();
                }
                else if(msgBoxTitle==="Submit"){
                sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.NONE,
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
                sap.m.MessageToast.show(HR.i18n.Messages.ContractInternExtension.validationFailed+ this.changes.validations.toString());
            }
        }
        catch(err){
            console.log(err);
        }
    },
    
    validateTerminationDate: function(){
        var element=this.getView().byId("terminationDate");
        var value=HR.util.Control.getValue("terminationDate", this);
        var error=false;
        var date3MonthsFromNow = HR.util.General.getDate();
        date3MonthsFromNow.setMonth(date3MonthsFromNow.getMonth() + 3); 
        var date3MonthsToNow = HR.util.General.getDate();
        date3MonthsToNow.setMonth(date3MonthsToNow.getMonth() - 3); 
    
        var beginDate = HR.util.Formatter.getNormalDateDefault(sap.ui.getCore().getModel("Termination").getProperty("/d/I0000Begda"));
        beginDate.setHours(0); beginDate.setMinutes(0);beginDate.setSeconds(0); beginDate.setMilliseconds(0);
        if(value < HR.util.Control.getValue("lastDayWorked", this)){
           error=HR.i18n.Messages.Termination.errors.terminationDate;
        }
        if(value< date3MonthsToNow || value> date3MonthsFromNow){
            error=HR.i18n.Messages.Termination.errors.terminationDateWindow;
        }
        else if(value===undefined){
           error=HR.i18n.Messages.Termination.errors.terminationDateNull;
        }
        else if(value =="Invalid Date"){
           error=HR.i18n.Messages.Termination.errors.date;
        }
        else if (value <= beginDate){
            error=HR.i18n.Messages.EmployeeDataChange.futureAction;            
        }
        
        if(error==false){
            HR.util.Control.setValueState("terminationDate",this,"None");
        }
        else{
           HR.util.Control.setValueState("terminationDate",this,"Error");
            this.changes.validations.terminationDate=error;
        }
    },
    
    error: function(evt){
        sap.m.MessageToast.show(this.changes.validations[evt.getSource().data("id")]);
    },
    validateLastDayWorked:function(){
        var terminationReason=HR.util.Control.getValue("terminationReason", this, "key");
        var value=HR.util.Control.getValue("lastDayWorked", this);
        var element=this.getView().byId("lastDayWorked");
        var error=false;
        
        if(this.LastDayKey!=="N"){ 
            HR.util.Control.enable("lastDayWorked", this, true);
            var value = HR.util.Control.getValue("terminationDate", this);
            HR.util.Control.setValue("lastDayWorked", this, value,"noConversions");
            HR.util.Control.enable("lastDayWorked", this, false);
        }
        else {
            HR.util.Control.enable("lastDayWorked", this, true);
            if(value===undefined){
                error=HR.i18n.Messages.Termination.errors.lastDayWorkedNull;
            }
            else if(value==="Invalid Date"){
               error=HR.i18n.Messages.Termination.errors.date;
            }
        }
        
        if(error===false){
            HR.util.Control.setValueState("lastDayWorked",this,"None");
        }
        else{
            HR.util.Control.setValueState("lastDayWorked",this,"Error");
            this.changes.validations.lastDayWorked=error;
        }
        
    },
    validateTerminationReason:function(){
        var value=HR.util.Control.getValue("terminationReason", this, "key");
        
        if(value===undefined){
            HR.util.Control.setValueState("terminationReason", this, "Error");
            this.changes.validations.terminationReason=HR.i18n.Messages.Termination.errors.terminationReasonNull;
        }
        else{
            HR.util.Control.setValueState("terminationReason",this,"None");
        }
    },
    validateRehireEligible:function(){
        var value=HR.util.Control.getValue("rehireEligible", this, "key");
        if(value===undefined){
            HR.util.Control.setValueState("rehireEligible", this, "Error");
            this.changes.validations.rehireEligible=HR.i18n.Messages.Termination.errors.rehireEligibleNull;
        }
        else{
            HR.util.Control.setValueState("rehireEligible", this, "None"); 
        }   
    },
    validateIsraelTermNotificationDate:function(){
        var value=HR.util.Control.getValue("israelTermNotificationDate", this);
        var element=this.getView().byId("israelTermNotificationDate");
        var error=false;
        if(this.isIsrael){
            if(value===undefined ){
               error=HR.i18n.Messages.Termination.errors.israelTermNotificationDateNull;
            }
            else if(value =="Invalid Date"){
               error=HR.i18n.Messages.Termination.errors.date;
            }
            if(error==false){
                HR.util.Control.setValueState("israelTermNotificationDate",this,"None");
            }
            else{
                this.changes.validations.israelTermNotificationDate=error;
                HR.util.Control.setValueState("israelTermNotificationDate",this,"Error");
            }
        }
    },
    validations: function(){
        this.changes.validations = [];
        this.validateTerminationReason();
        this.validateTerminationDate();
        this.validateLastDayWorked();
        this.validateRehireEligible();
        this.validateIsraelTermNotificationDate();
    },
    warnings: function(){
        this.changes.warnings=[];
        var getDate = HR.util.General.getDate();
        if (this.changes.terminationDate < getDate){ //termination date is in the past
            this.changes.warnings.push(HR.i18n.Messages.Termination.errors.pastTerminationDate);
        }
    },
    

    setParameters: function(action){
        this.parameters={};
        this.parameters =new sap.ui.getCore().getModel("Termination").getData();
        if(this.changes.terminationReason!==undefined) {
            this.parameters.d.Massg= this.changes.terminationReason;
            this.parameters.d.MassgDescr= this.changes.terminationReasonDescription;
        }
        if(this.changes.terminationDate!==undefined) 
            this.parameters.d.TermDate=HR.util.Formatter.getODataDate(this.changes.terminationDate);
        if(this.changes.lastDayWorked!==undefined) 
            this.parameters.d.LastDayWorked=HR.util.Formatter.getODataDate(this.changes.lastDayWorked);
        if(this.changes.rehireEligible!==undefined) 
            this.parameters.d.RehireEligibility=this.changes.rehireEligible;
        if(this.changes.israelTermNotificationDate!==undefined) 
            this.parameters.d.IlNoticeDate=HR.util.Formatter.getODataDate(this.changes.israelTermNotificationDate);    
        if(this.changes.comments!==undefined) 
            this.parameters.d.HrasrCurrentNote=this.changes.comments;
            
        this.parameters.d.Event=action;
        this.parameters.d.WiID= this.WiID;
        this.parameters.d.InitiatorRole= HR.i18n.User.Roles.find(sap.ui.getCore().getModel("Termination").getData().d.Pernr);
    },
    handleNavButtonPress : function (oEvent) {
        this.cancelTermination(oEvent);
	},
    cancelNo: function (oEvent) {
        this[oEvent.getSource().data("dialogType")].close();
    },
    cancelYes: function () {
        this._router.navTo("EmployeeSearch",{pageNum:1});
    }
});