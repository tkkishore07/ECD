$.sap.require("sap.m.MessageBox");
sap.ui.controller("HR.view.ApprovalsDetail", {	
	onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("ApprovalsDetail").attachPatternMatched(this._routePatternMatched, this);
	    if(!sap.ui.Device.system.phone) this.getOwnerComponent().getTargets().display("ApprovalsMaster"); // Senthil to write comment at this piece
	},
	showApprovals: function(that, workItemID){
	    var oModelApprovalList = sap.ui.getCore().getModel("ApprovalList");
	    var finalData={"d":{"results":[]}};
	    for(var i=0; i < oModelApprovalList.getData().d.results.length; i++){  
            if(oModelApprovalList.getData().d.results[i].WiID != workItemID) finalData.d.results.push(oModelApprovalList.getData().d.results[i]);
          }
        oModelApprovalList.setData(finalData);
        oModelApprovalList.refresh(true);
	    if(!sap.ui.Device.system.phone) that._router.navTo("ApprovalsMaster",{ECDID:workItemID});
	    else that._router.navTo("ApprovalsMasterMobile");
	},
	back: function(evt){
	    this.showApprovals(this);
	},
	setProperties: function(){
            this.employeeType= "";
            this.SalesEmpNew= "",
            this.isEmployee= false;
	},
	openPanel: function(that, id, value){
	    /* the boolean parameter 'value' will be true if any of this fields under the Panel got changed in the ECD request & so the Panel will 
	       be shown in expanded state, else in compressed state*/
        	that.getView().byId(id).setExpandAnimation(false);
        	that.getView().byId(id).setExpanded(value);
        	that.getView().byId(id).setExpandAnimation(true);
    },
    roleCheck: function(employeeID, data){
        this.getView().byId("sdssSdsmOnly").setVisible(HR.i18n.User.Locations.isSdssSdsm(data.d.I0001BtrtlCurr) && data.d.I0001Persg!==HR.i18n.User.Roles.BatchOnly);
        this.isEmployee = (this.employeeType===HR.i18n.User.Roles.Employee);
        this.getView().byId("pay").setVisible(
                    this.isEmployee || 
                    this.employeeType===HR.i18n.User.Roles.ProvisionalWorker ||
                    (this.employeeType===HR.i18n.User.Roles.Intern && data.d.I0001Persk===HR.i18n.User.Roles.PaidIntern )
        );
        this.getView().byId("becomingAPeopleManager-section").setVisible(data.d.I0001Persg===HR.i18n.User.Roles.Employee);
        this.showTargetCommission(data.d.SalesEmpNew);
        this.showRsu(data) ;
        this.showStockOption(data);
    },
    _routePatternMatched: function(oEvent) {
        var that=this;
        this.setProperties();
        this.workItem= oEvent.getParameter("arguments").ECDID;
            var oModel = new sap.ui.model.json.JSONModel();
            HR.util.Busy.setBusyOn(true);
        $.getJSON(HR.i18n.URL.MyApproval.showEDCData(this.workItem), function (data) {
            oModel.setData(data);
            that.getView().setModel(oModel);
	        that.employeeType=data.d.I0001Persg;
            that.roleCheck(data.d.Pernr, data);
            
            HR.util.Control.setValue("effectiveDate", that, data.d.EffectiveDate, "date");
        /*  if fields of odata service corresponding to New values of various fields of type character will be empty if the field has not been changed 
            in the ECD request. A panel is shown in expanded state only if any of the fields under that panel has been changed in the ECD request */
            that.openPanel(that, "organizationAssignment", data.d.ManagerIDNew!=="" || data.d.PeopleMngrNew!=="" || data.d.I0001KostlNew!=="");
            HR.util.Control.modify("manager", that, data.d.ManagerIDNew+" "+ data.d.ManagerNameNew);
            HR.util.Control.modify("becomingAPeopleManager", that, data.d.PeopleMngrNew);
            HR.util.Control.modify("costCenter", that, data.d.I0001KostlNew+" "+data.d.I0001KostlNameNew);

		    that.openPanel(that, "location", data.d.I0001BtrtlNew!=="");
            HR.util.Control.modify("officeLocation", that, data.d.I0001BtrtlNew);
                
		    that.openPanel(that, "job", data.d.I0001StellNew!=="00000000" ||  data.d.I0001PtextNew!=="");
		    var jobCode= data.d.I0001StellNew+" "+ data.d.I0001ShortNew;
		    jobCode=jobCode.replace(/^0+/, '').trim();
            HR.util.Control.modify("jobCode", that, jobCode);
            HR.util.Control.modify("jobTitle", that, data.d.I9002ZjobtitleNew);
            HR.util.Control.modify("positionTitle", that, data.d.I0001PtextNew);
            HR.util.Control.modify("jobLevel", that, data.d.I1051JcodeNew);
            HR.util.Control.modify("managerLevel", that, data.d.I1010HilfmNew+" "+data.d.I1010HilfmDescrNew);
            
            that.openPanel(that, "pay", HR.util.Formatter.getMoney(data.d.NewAnsal)!=="0"||HR.util.Formatter.getMoney(data.d.NewCommision)!==HR.util.Formatter.getMoney(data.d.CurrCommision)||  data.d.I0761RsuNew!==data.d.I0761RsuCurr ||  data.d.I0761StockNew!==data.d.I0761StockCurr);
            HR.util.Control.modify("annualSalary", that, HR.util.Formatter.getMoney(data.d.NewAnsal));
            if(HR.i18n.User.isSalesRelated(data.d.SalesEmpNew))
            HR.util.Control.modify("targetCommission", that, HR.util.Formatter.getMoney(data.d.NewCommision));
            
            if(that.rsuApplicable)
            HR.util.Control.modify("rsu", that, data.d.I0761RsuNew);
            if(that.stockApplicable)
            HR.util.Control.modify("stockOption", that, data.d.I0761StockNew);
                
            that.openPanel(that, "sdssSdsmOnly", data.d.I0001ZzldridNew!=="" ||  data.d.I9034DirectNew!=="" || data.d.I9034IndirectNew!=="");
            HR.util.Control.modify("leader", that, data.d.I0001ZzldridNew +" " +data.d.I0001ZzldridNameNew);
            HR.util.Control.modify("laborClassification", that, data.d.LaborClassNew);
            HR.util.Busy.setBusyOff(); 
            }).error(function(err) { 
                HR.util.Busy.setBusyOff();
                that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });    
            
         
    },

	showTargetCommission: function(SalesEmpNew){
	    // If an employee moves to sales or was earlier in sales & remains in sales after the change request, then 'SalesEmpNew' flag will be true
	    SalesEmpNew = HR.i18n.User.isSalesRelated(SalesEmpNew);
	    this.getView().byId("targetCommission-old").setVisible(SalesEmpNew);
	    this.getView().byId("targetCommission").setVisible(SalesEmpNew);
	},
	showRsu: function(data){
	    this.rsuApplicable = HR.i18n.User.checkRSU(data);
	    this.getView().byId("rsu-old").setVisible(this.rsuApplicable);
	    this.getView().byId("rsu").setVisible(this.rsuApplicable);
	 },
	 
	showStockOption: function(data){
	    this.stockApplicable = HR.i18n.User.checkStocksOptions(data);
	    this.getView().byId("stockOption-old").setVisible(this.stockApplicable);
	    this.getView().byId("stockOption").setVisible(this.stockApplicable);
	 },
    getMessageBoxLayout: function(text){ 
    var oLayout = new sap.ui.layout.VerticalLayout();
    oLayout.addContent(new sap.m.Label({text: text}));
    var textArea = new sap.m.TextArea({id:"CommentsId", text:"", cols:45, required:true});
    if(text.indexOf("Reject")>-1){
        textArea.setPlaceholder("Mandatory");
    }
    oLayout.addContent(textArea);  
    return oLayout;
    },
    update: function(str, successFn, that ) {
        parameters = {};
        parameters.WiID = that.workItem;
        parameters.Event = str;
        parameters.FromMgrID = sap.ui.getCore().getModel("loggedUser").getData().d.results[0].PersonId;
       
        if(str==="FORWARD"){ // In case of forwarding an approval request, additional parameter To Manager id is send to backend
            parameters.ToMgrID = obj.PersonId;
        }
        else{ // Capture the Approver's comment in case of Approve/Reject
            parameters.HrasrApprNotes = sap.ui.getCore().byId("CommentsId").getValue();
        }
       HR.util.General.ajaxWrite(HR.i18n.URL.MyApproval.processEDCForm.entity, HR.i18n.URL.MyApproval.processEDCForm.links(that.workItem),parameters, successFn, that,"PUT");
    },
    approve: function(oEvent) {
        var that = this;
        var successFn = function(data){ // Success callback function in case odata service for processing approval request is successfully executed
            that.showApprovals(that, that.workItem);
            sap.m.MessageToast.show(HR.i18n.Messages.MyApprovals.approveSuccess, {closeOnBrowserNavigation: false});
        };
        sap.m.MessageBox.show(this.getMessageBoxLayout(HR.i18n.Messages.MyApprovals.approveRequest), sap.m.MessageBox.Icon.NONE, "Approve", [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            function(oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                   that.update("APPROVE",successFn, that);
                }
            },"approveDialog");
        HR.util.PopupDrag.draggable("approveDialog");    
    },
    reject: function(oEvent) {
        var that = this;
        var successFn = function(data){// Success callback function in case odata service for processing rejection request is successfully executed
            that.showApprovals(that, that.workItem);
            oTextAreaDialog.close();
            sap.m.MessageToast.show(HR.i18n.Messages.MyApprovals.rejectSuccess, {closeOnBrowserNavigation: false});
        };
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: HR.i18n.Messages.MyApprovals.rejectRequest}));
        oLayout.addContent(new sap.m.TextArea({id:"CommentsId", text:"", cols:45}));  
        oLayout.addContent(new sap.m.ObjectStatus({state:"Error", id:"rejectCommentsRequired", text: HR.i18n.Messages.MyApprovals.commentsRequired}));
        var oTextAreaDialog = new sap.m.Dialog({
                id: "rejectPopUp",
				title: "Reject",
				content: oLayout,
				beginButton:new sap.m.Button({
						text: "Yes",
						type: sap.m.ButtonType.Accept,
						press : function() {
                           if(sap.ui.getCore().byId("CommentsId").getValue()===""){
                               sap.ui.getCore().byId("CommentsId").setValueState("Error");
                               sap.ui.getCore().byId("rejectCommentsRequired").setIcon(sap.ui.core.IconPool.getIconURI("alert"));
                           }    
                           else that.update("REJECT", successFn, that);
						}
				}),
				endButton: new sap.m.Button({
					text: "No",
					type: sap.m.ButtonType.Reject,
					press : function() {
						oTextAreaDialog.close();
					}
				})
		}).attachAfterClose(function(){if(sap.ui.getCore().byId("rejectPopUp")!==undefined)sap.ui.getCore().byId("rejectPopUp").destroy(); });
        oTextAreaDialog.open();
        $("section[id^='rejectPopUp']").css("padding","20px"); // yet to confirm
        HR.util.PopupDrag.draggable("rejectPopUp");
    },
    forward: function (){
        if(!this._valueHelpDialogManagerSearch) {
            this._valueHelpDialogManagerSearch = sap.ui.xmlfragment("ManagerSelectFragment","HR.view.Dialog.ManagerSearch",this );
            this.getView().addDependent(this._valueHelpDialogManagerSearch);
        }
        if(this._valueHelpDialogManagerSearch){
            if(sap.ui.getCore().getModel("approvalForward")) {// setting the dialog to a blank model so that initially search list is empty
                this._valueHelpDialogManagerSearch.setModel(sap.ui.getCore().getModel("blankModel"));
            }
        }
        this._valueHelpDialogManagerSearch.open();
        sap.ui.core.Fragment.byId("ManagerSelectFragment", "ManagerSearch").setTitle(sap.ui.getCore().getModel("i18n").getProperty("approvalForwardTitle"));
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
        HR.util.PopupDrag.draggable("ManagerSelectFragment");
    },
    _managerSearchPopupSearch : function (evt) { // to search from list of employees eligible for fowarding  an approval request to
        var sValue = evt.getParameter("value");
        this.getForwardsList(sValue); // to fetch the record based on search input
        this.validateSearchInput(evt,sValue);  // to validate the search input and get the data based on that
    },
    _managerSearchPopupConfirm : function (evt) { // to select a employee and foward an approval request to him
        var that=this;
        var successFn = function(data){
            that.showApprovals(that, that.workItem);
            sap.m.MessageToast.show(HR.i18n.Messages.MyApprovals.forwardSuccess, {closeOnBrowserNavigation: false});
        };
        if(evt.getParameters().selectedContexts!==undefined){
            obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("approvalForward").getData() , evt.getParameters().selectedContexts[0].sPath);
            sap.m.MessageBox.show(HR.i18n.Messages.MyApprovals.forwardRequest+" "+obj.FirstName+"("+obj.PersonId+")", sap.m.MessageBox.Icon.NONE, "Forward", [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            function(oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                   that.update("FORWARD", successFn, that);
                }
            },"confirmDialog");
            HR.util.PopupDrag.draggable("confirmDialog");
        }
        
    },
    getForwardsList : function(sValue){
	    var oModelForManager = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModelForManager, "approvalForward");
	    oModelForManager.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModelForManager.loadData(HR.i18n.URL.MyApproval.getForwards(sValue));
        oModelForManager.attachRequestCompleted(function(){
            HR.util.Busy.setBusyOff();
        });
	},
    validateSearchInput: function(evt,sValue) 
    {   var oFilter;
        if(sValue.length>=3){
            //If user has entered emp name
            if(isNaN(sValue)){
                
                this._valueHelpDialogManagerSearch.setModel(sap.ui.getCore().getModel("approvalForward"));
               
                oFilter = new sap.ui.model.Filter("FirstName",sap.ui.model.FilterOperator.Contains, sValue);
                evt.getSource().getBinding("items").filter([oFilter]);
            }
            //If user has entered emp no
            else if(!isNaN(sValue)){ //is integer
                
                this._valueHelpDialogManagerSearch.setModel(sap.ui.getCore().getModel("approvalForward"));

                oFilter = new sap.ui.model.Filter("EmployeeNo",sap.ui.model.FilterOperator.Contains, sValue);
                evt.getSource().getBinding("items").filter([oFilter]);
            }
        }
        if(sValue.length==0){
                HR.util.Busy.setBusyOff();
                oFilter = new sap.ui.model.Filter("FirstName",sap.ui.model.FilterOperator.Contains, sValue);
                evt.getSource().getBinding("items").filter([oFilter]);
        }
    }
});