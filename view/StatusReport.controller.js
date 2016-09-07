$.sap.require("sap.m.MessageBox");
$.sap.require("jquery.sap.storage");
$.sap.require("HR.util.StatusReports");
sap.ui.controller("HR.view.StatusReport", {
    
    onInit: function(){
        this._router = sap.ui.core.UIComponent.getRouterFor(this);
        this._router.getRoute("StatusReport").attachPatternMatched(this._routePatternMatched, this);
        //model for keeping Status Reports 
        var statusReports = new sap.ui.model.json.JSONModel();
        sap.ui.getCore().setModel(statusReports,"statusReports");
        oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);  
    },
    
    _routePatternMatched: function(evt){
        this.checkScreenHeight();
        this.flag = evt.getParameters().arguments.flag;
        i18nModel = sap.ui.getCore().getModel("i18n"); 
        oTable =this.getView().byId("statusReports");
        this.setProperties();
        // to set the drop down for Status types
        var processStatus = new sap.ui.model.json.JSONModel(); 
        processStatus.loadData(HR.i18n.URL.StatusReports.getProcessStatus,null,false);
        
        // Setting an option 'All', so the user can see the requests with all statuses 
        processStatus.getData().d.results.unshift({Status:"", Description:"All"});
        this.getView().byId("processStatus").setModel(processStatus);
        
        //hiding the table when user opens the page
        this.getView().byId("statusReports").setVisible(false);
        if(this.flag==="true"){  // If page is navigated back from Details page
            var that=this;
            var parameters = oStorage.get("parameters"); 
            HR.util.StatusReports.fetchSavedData(parameters,that);// get the parameters from local storage
            this.setFieldsAfterRefresh(parameters); // Set the parameters to fields
            HR.util.Busy.setBusyOn(true);
        }
        else{ // If page if openned from Master page
                HR.util.StatusReports.onReset(this); 
                var submittedDates =   HR.util.StatusReports.setDates(this);//Setting default values for submitted dates
                this.getView().byId("totalRecordsTable").setVisible(false);
                HR.util.StatusReports.setValidState(this);
        }
    },
    
    checkScreenHeight: function(){
        if(screen.height<=768){
           this.getView().byId("statusReports").setVisibleRowCount(5);
        }
        else if(screen.height>768 && screen.height<1024){
            this.getView().byId("statusReports").setVisibleRowCount(10);
        }
        else if(screen.height>=1024){
            this.getView().byId("statusReports").setVisibleRowCount(15);
        }
    },

    setProperties: function(){
        this.workItemId="";
        this.ecdName = "";
        this.employeeId= "";
        this.ecdId = "";
        this.submittedDateError= "";
        this.effectiveDateError = "";
        this.contextPath = "";
        this.formName = "StatusReports";
    },
    
     //Setting everything to default on reset
    onReset: function(){
         HR.util.StatusReports.onReset(this); 
    },

    onSearch: function(){
        var parameters = HR.util.StatusReports.getInputParameters(this);
        HR.util.StatusReports.getECDDetails(parameters,this);
    },
   
    // When the row gets selected or unselected
    onRowSelectionChange : function(oEvent){
        this.contextPath =  oEvent.getParameters().rowContext.sPath;
        this.workItemId = HR.util.Formatter.getPernr(oTable.getModel().getProperty(this.contextPath).WiID);
        this.ecdName = HR.util.Formatter.getECDName(oTable.getModel().getProperty(this.contextPath).EcdProcName);
        this.employeeId =HR.util.Formatter.getPernr(oTable.getModel().getProperty(this.contextPath).Pernr);
        this.ecdId =  oTable.getModel().getProperty(oTable.getModel().getProperty(this.contextPath).EcdID);
       // var path = this.getContextPath();
        HR.util.StatusReports.checkStatus(oTable,this);
    },
    
    // Creating the message pop up for withdraw / forward
    getMessageBoxLayout: function(message){
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: message }));
        oLayout.addContent(new sap.m.Label({text: ""}));
        return  oLayout;   
    }, 
    
    // If user clicks on withdraw or Forward button
    onWithdrawOrForward: function(oEvent){
        var path = this.contextPath;
        var inProcessRequests = []; // An array to keep all the requests which user wants to withdraw or forward
        var that = this;
        var msgBoxTitle = oEvent.getSource().getText();
        
        // If user wants to withdraw the request
        var withdrawRequest = function(oEvent,inProcessRequests){
            var successFn = function(data){
                var oLayout = new sap.ui.layout.VerticalLayout();
                oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.MyRequests.requestWithdrawn}));
                sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success",sap.m.MessageBox.Action.Ok);   
            }   
            that.go(successFn,msgBoxTitle, HR.i18n.Messages.MyRequests.withdraw,this,inProcessRequests);
        };
        // If user wants to forward the request
        var forwardRequest = function(oEvent,inProcessRequests){
            var msgBoxMsg;
            var msgBoxTitle = oEvent.getSource().getText(); // getting the name of the pop up
            that._managerSearchPopup(msgBoxTitle) ;
            
            if(msgBoxTitle==="Forward"){
                
                // after user selects the manager to whom he wants to forward the request
                sap.ui.core.Fragment.byId("ForwardToManager", "ManagerSearch").attachConfirm(function(data)
                {
                if(data.getParameters().selectedContexts!==undefined){
                    // Asking for the user confirmation after showing the selected manager details - name and id
                    obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("managerSearch").getData() , data.getParameters().selectedContexts[0].sPath);
                    msgBoxMsg = HR.i18n.Messages.MyApprovals.forwardRequest+" "+obj.FirstName+"("+obj.PersonId+")";
                    
                    // If request is forwarded successfully
                    var successFn = function(data){
                        var oLayout = new sap.ui.layout.VerticalLayout();
                        oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.MyApprovals.forwardSuccess}));
                        sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success",sap.m.MessageBox.Action.Ok);   
                    }   
                    
                    that.go(successFn,msgBoxTitle,msgBoxMsg,this,inProcessRequests);
                }
            });
            } 
        };
        
        if(path!==undefined){ // if atleast some request is selected
                var status = oTable.getModel().getProperty(path).Status.toLowerCase();
                if(msgBoxTitle==="Withdraw"){ // If user has clicked Withdraw button
                 
                    if(status.indexOf("approval pending") > -1 || status.indexOf("error") > -1){  // If the selected request has approval pending or error status
                        inProcessRequests.push(status); 
                        withdrawRequest(oEvent,inProcessRequests); 
                    }
                    else{ // user is trying to withdraw request with status other than approval pending 
                    sap.m.MessageToast.show(HR.i18n.Messages.StatusReport.withdrawError);
                    }    
                }
                else if (msgBoxTitle==="Forward"){ // If user has clicked Forward button
                    if(status.indexOf("approval pending") > -1){  // If the selected request has approval pending status
                        inProcessRequests.push(status);
                        forwardRequest(oEvent,inProcessRequests); 
                    }
                    else{ // user is trying to forward request with status other than approval pending 
                        sap.m.MessageToast.show(HR.i18n.Messages.StatusReport.forwardError);
                    }   
                }
            }
                
        else{ // if no item is selected
            sap.m.MessageToast.show(HR.i18n.Messages.StatusReport.noRequestSelected);
        }
    },

    // sending the request's info to backend which needs to be withdrawn or forwarded
    go: function(successFn, msgBoxTitle, msgBoxMsg,that,inProcessRequests){
       // var path = this.getContextPath();
        var that=this;
        var parameters = {};
        var batchRequestEntries =[]; // Array to keep all the requests which need to be sent in the batch request
        var oModelStatusReports = new sap.ui.model.odata.ODataModel(HR.i18n.URL.StatusReports.withdrawOrForward.entity);  //Odata model for withdrawOrForward service
        var oLayout = this.getMessageBoxLayout(msgBoxMsg);
        sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.NONE,
            msgBoxTitle, [ sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                                    parameters.Event =msgBoxTitle.toUpperCase();
                                    parameters.WorkitemID =  that.workItemId;
                                    if(msgBoxTitle=="Withdraw"){ //If only one request need to be withdrawn
                                        parameters.FromMgrID = "";
                                        parameters.ToMgrID= "";
                                    }
                                    else if(msgBoxTitle=="Forward"){ //If only one request need to be forwarded 
                                        parameters.FromMgrID = HR.util.Formatter.getPernr(sap.ui.getCore().getModel("loggedUser").getData().d.results[0].PersonId);
                                        parameters.ToMgrID = obj.PersonId;
                                    } 
                                // Sending request parameters to backend
                                HR.util.General.ajaxWrite(HR.i18n.URL.StatusReports.withdrawOrForward.entity,HR.i18n.URL.StatusReports.withdrawOrForward.link(parameters.WorkitemID,parameters.Event, parameters.FromMgrID, parameters.ToMgrID),parameters, successFn, this,"PUT");    
                                }
  
                },"confirmDialog"
        );
        HR.util.PopupDrag.draggable("confirmDialog");
    },
    
        // Navigate to details page when user selects a request to see its details
    showDetails: function(oEvent){
        // getting all the paramteres need to be sent to Details page
        if(this.employeeId ){  
            if(this.ecdName=="Employee Education") {this._router.navTo("EducationData",{ ID:this.workItemId, statusReport:true });}
            else this._router.navTo("Details",{id:this.employeeId, WorkItemId:this.workItemId, ECDName:this.ecdName, formName:this.formName });
        }
    },

    // Navigate the details page on click of a Work Item id link
    onLinkPress : function(evt) {
        var data = sap.ui.getCore().getModel("statusReports").getData().d.results;
        var employeeId, workItemId,ecdName,ecdId;
        for (var count=0; count<data.length; count++){
            if(HR.util.Formatter.getPernr(data[count].WiID)==evt.getSource().getText()){
                employeeId = HR.util.Formatter.getPernr(data[count].Pernr);
                workItemId = HR.util.Formatter.getPernr(data[count].WiID);
                ecdName= HR.util.Formatter.getECDName(data[count].EcdProcName);
                ecdId = data[count].EcdID;
                break;
            }
        }
        if(this.ecdName=="Employee Education") {this._router.navTo("EducationData",{ID:this.workItemId, statusReport:true });}
        else this._router.navTo("Details",{id:this.employeeId, WorkItemId:this.workItemId, ECDName:this.ecdName, formName:this.formName });
    },
    
    // Setting all the saved fields
    setFieldsAfterRefresh: function(parameters){
        this.getView().byId("submitFromDate").setValue(parameters.submittedfromValue);
        this.getView().byId("submitToDate").setValue(parameters.submittedtoValue);
        this.getView().byId("effectiveFromDate").setValue(parameters.effectivefromValue);
        this.getView().byId("effectiveToDate").setValue(parameters.effectivetoValue);
        this.getView().byId("affectedEmp").setValue(parameters.affectedEmp);
        this.getView().byId("manager").setValue(parameters.manager);
        this.getView().byId("HRBP").setValue(parameters.hrbp);
        this.getView().byId("effectiveToDate").setValue(parameters.effectivetoValue);
        this.getView().byId("processStatus").setSelectedKey(parameters.Status); 
        this.getView().byId("processName").setSelectedKey(parameters.Process); 
        this.getView().byId("selfInvolved").setSelected(parameters.SelfInvolved) ;
        this.getView().byId("directReportee").setSelected(parameters.DirectReportee) ;
        HR.util.Control.setValueState("submitFromDate",this,"None");
        HR.util.Control.setValueState("submitToDate",this,"None"); 
        HR.util.Control.setValueState("effectiveFromDate",this,"None");
        HR.util.Control.setValueState("effectiveToDate",this,"None");
    },
    // pop up for hrbp search
    _hrbpSearchPopup : function(){
        var that= this;
        if (!this._valueHelpDialogHRBPSearch) {  // get hrbps list
            this._valueHelpDialogHRBPSearch = sap.ui.xmlfragment("HRBPSearchDialog","HR.view.Dialog.HRBPSearch",this );
            this.getView().addDependent(this._valueHelpDialogHRBPSearch);
            this._valueHelpDialogHRBPSearch.open();
            HR.util.StatusReports.getHRBPDetails(that);
        }
        else{
            this._valueHelpDialogHRBPSearch.open();
            this._valueHelpDialogHRBPSearch.setModel(sap.ui.getCore().getModel("hrbpSearch")); 
        }
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
        HR.util.PopupDrag.draggable("HRBPSearchDialog");
    },
    
    // On click of Search button of the pop up
    _hrbpSearchPopupSearch : function (evt) {
        var role ="HRBP";
        var sValue = evt.getParameter("value");
        this.validateSearchInput(role,evt,sValue) ; // to validate the search input and get the data based on that
    },
    
    // After user makes selection
    _hrbpSearchPopupConfirm : function (evt) {
        if(evt.getParameters().selectedContexts!==undefined){
            var obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("hrbpSearch").getData() , evt.getParameters().selectedContexts[0].sPath);
            HR.util.Control.setValue("HRBP", this, (obj.HrbpID+" "+obj.EmpName));
            this.getView().byId("HRBP-cancel").setVisible(true);
        }
    },
    
    _managerSearchPopup: function (msgBoxTitle){
        var oModelBlank = new sap.ui.model.json.JSONModel();
            if(msgBoxTitle==="Forward"){ // if manager search is opened to forward the request
                if(!this._valueHelpDialog){
                        this._valueHelpDialog = sap.ui.xmlfragment("ForwardToManager","HR.view.Dialog.ManagerSearch",this );
                }
                else if(this._valueHelpDialog){
                    if(sap.ui.getCore().getModel("managerSearch")) {//  if model is set in dialog
                        this._valueHelpDialog.setModel(oModelBlank);
                    }
                }
                this.getView().addDependent(this._valueHelpDialog);
                this._valueHelpDialog.open();
                HR.util.PopupDrag.draggable("ForwardToManager");
                
            }
            else{  // if manager search is opened to search the requests for a particular manager (f4 help)
                if(!this._valueHelpDialogManagerSearch) {
                        this._valueHelpDialogManagerSearch = sap.ui.xmlfragment("ManagerChooseFragment","HR.view.Dialog.ManagerSearch",this );
                }
                else if(this._valueHelpDialogManagerSearch){
                    if(sap.ui.getCore().getModel("managerSearch")) {    //  if model is already set in dialog
                        this._valueHelpDialogManagerSearch.setModel(oModelBlank);
                    }
                }
                this.getView().addDependent(this._valueHelpDialogManagerSearch);
                this._valueHelpDialogManagerSearch.open();
                HR.util.PopupDrag.draggable("ManagerChooseFragment");
            }
        // Replacing the placeholder for pop ups 
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
    },
    
    // Searching a manager based on user input
    _managerSearchPopupSearch : function (evt) { 
        var role;
        if(evt.getSource().getId().indexOf("ForwardToManager")>-1){ // for forward
           role ="New Manager"
        }
        else if(evt.getSource().getId().indexOf("ManagerChooseFragment")>-1){ // For f4 value help
           role ="Manager"
        }
        var that = this;
        var sValue = evt.getParameter("value");
        this.validateSearchInput(role,evt,sValue);
        
        // If user has clicked on manager f4 help, on selection of a manager value will be set to control
        if(evt.getSource().getId().indexOf("ManagerChooseFragment")>-1){ 
            sap.ui.core.Fragment.byId("ManagerChooseFragment", "ManagerSearch").attachConfirm(function(data){ 
                    if(data.getParameters().selectedContexts!==undefined){
                        obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("managerSearch").getData() , data.getParameters().selectedContexts[0].sPath);
                        HR.util.Control.setValue("manager", that, (obj.PersonId+" "+obj.FirstName));
                        that.getView().byId("manager-cancel").setVisible(true);
                    }
            });
        }
    },


    // Affected employee search pop up
   _affectedEmpSearchPopup : function(){
        var oModelBlank = new sap.ui.model.json.JSONModel();
         if(!this._valueHelpDialogAffectedEmpSearch) {
            this._valueHelpDialogAffectedEmpSearch = sap.ui.xmlfragment("AffectedEmpDialog","HR.view.Dialog.AffectedEmpSearch",this );
            this.getView().addDependent(this._valueHelpDialogAffectedEmpSearch);
        }
        if(this._valueHelpDialogAffectedEmpSearch){
            if(sap.ui.getCore().getModel("affectedEmployees")) {//  if model is set in dialog
                this._valueHelpDialogAffectedEmpSearch.setModel(oModelBlank);
            }
        }
        this._valueHelpDialogAffectedEmpSearch.open();
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
        HR.util.PopupDrag.draggable("AffectedEmpDialog");
   },
   
    // On click of Search button of the pop up
    _affectedEmpSearchPopupSearch : function (evt) {
        var role ="Affected Employee";
        var sValue = evt.getParameter("value");
        this.validateSearchInput(role,evt,sValue) ; // to validate the search input and get the data based on that
    },
    
    // After user makes selection
    _affectedEmpSearchPopupConfirm : function (evt) {
        if(evt.getParameters().selectedContexts!==undefined){
            var obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("affectedEmployees").getData() , evt.getParameters().selectedContexts[0].sPath);
            HR.util.Control.setValue("affectedEmp", this, (obj.PersonID+" "+obj.EmpName));
            this.getView().byId("affectedEmp-cancel").setVisible(true);
        }
    },

    validateSearchInput: function(role,evt,sValue) {
        var oFilter;
        if(sValue.length>=3)// If value has more than 3 characters
           {
                if(role==='Manager'){ // for manager search
                    HR.util.StatusReports.getManagerDetails(sValue); 
                    this._valueHelpDialogManagerSearch.setModel(sap.ui.getCore().getModel("managerSearch"));
                }
                else if(role==="New Manager"){ // for forward event
                    HR.util.StatusReports.getManagerDetails(sValue); 
                    this._valueHelpDialog.setModel(sap.ui.getCore().getModel("managerSearch"));
                }
                else if (role==='HRBP'){ // for hrbp search
                    this._valueHelpDialogHRBPSearch.setModel(sap.ui.getCore().getModel("hrbpSearch"));
                    if(isNaN(sValue)){
                         oFilter = new sap.ui.model.Filter("EmpName",sap.ui.model.FilterOperator.Contains, sValue);
                    }
                    else{
                         oFilter = new sap.ui.model.Filter("HrbpID",sap.ui.model.FilterOperator.Contains, sValue);
                    }
                    evt.getSource().getBinding("items").filter([oFilter]);
                }
                else if(role==='Affected Employee'){ // for affected employee search
                    HR.util.StatusReports.getAffectedEmpDetails(sValue); 
                    this._valueHelpDialogAffectedEmpSearch.setModel(sap.ui.getCore().getModel("affectedEmployees"));
                }
               
            }
        if(sValue.length==0){ // if user has not entered any search value
            HR.util.Busy.setBusyOff();
            if(role=='HRBP'){
                evt.getSource().getBinding("items").filter([]);
            }
            else{
                evt.getSource().getBinding("items").filter([oFilter]);
            }
        }
    },
    
    onDownload: function(){
        var parameters = HR.util.StatusReports.getInputParameters(this);
        HR.util.StatusReports.onDownload(parameters);
    },
    
        //Resetting the particular fields on click of a cross button
    resetField: function(oEvent){
        var fields = ['effectiveToDate', 'effectiveFromDate','affectedEmp', 'manager', 'HRBP'];
        var resetButtonId = oEvent.getSource().getId();
        for(var count=0; count<fields.length; count++){
            if(resetButtonId.indexOf(fields[count])>-1){
                this.getView().byId(fields[count]).setValue("");
                this.getView().byId(fields[count]+"-cancel").setVisible(false);    
            } 
        }
        // If effective date To or from gets deleted perform validations for the dates
        if(resetButtonId.indexOf(fields[0])>-1 || resetButtonId.indexOf(fields[1])>-1){
            this.validations(oEvent);
        }
    },
    
    error: function(evt){
        var errorId = evt.getSource().getId();
        if(errorId.indexOf("effective")>-1){
            sap.m.MessageToast.show(this.effectiveDateError);
        }
        else{
            sap.m.MessageToast.show(this.submittedDateError);
        }
    },

    // validation for dates after user changes them
    validations : function(evt) {
        var controlId = evt.getParameters().id;
        var submittedToDate, submittedFromDate;
        var effectiveToDate, effectiveFromDate;
        
        
        // If any of the field has invalid value- disable search
        if(HR.util.Control.getValue("submitFromDate", this)=="Invalid Date" || HR.util.Control.getValue("submitToDate", this)=="Invalid Date" ||
            HR.util.Control.getValue("effectiveFromDate", this)== "Invalid Date" || HR.util.Control.getValue("effectiveToDate", this)=="Invalid Date"){
             this.getView().byId("search").setEnabled(false);
        }
        else{ // If all date fields are valid
             this.getView().byId("search").setEnabled(true);
        }
        
        // If submitted from date has changed - validate the new date
        if(controlId.indexOf("submitFromDate") > -1){
            
            if(new Date(evt.getSource().getValue())=="Invalid Date")
            { // If new value entered by the user  is invalid 
                error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                HR.util.Control.setValueState("submitFromDate",this,"Error");
                this.submittedDateError = error;
            }
            else
            {   // If new date entered is valid 
                submittedFromDate = HR.util.Formatter.getDateTimeFormat(evt.getSource().getDateValue());
                HR.util.Control.setValueState("submitFromDate",this,"None");
                // check the corresponding To Date is valid or not
                if(new Date(this.getView().byId("submitToDate").getValue())=="Invalid Date"){
                    error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                    HR.util.Control.setValueState("submitToDate",this,"Error");
                    this.submittedDateError = error;
                }
                else{ // If both dates are valid compare if from date is greater than to date
                    submittedToDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("submitToDate").getDateValue());
                    HR.util.StatusReports.compareDates(submittedToDate,submittedFromDate,controlId,this);
                }
            }
        }
        
        // If submitted to date has changed - validate the new date
        if(controlId.indexOf("submitToDate") > -1){ 
            
            if(new Date(evt.getSource().getValue())=="Invalid Date")
            { // If new value entered by the user  is invalid 
                error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                HR.util.Control.setValueState("submitToDate",this,"Error");
                this.submittedDateError = error;
            }
            else
            {   // If new date entered is valid 
                submittedToDate = HR.util.Formatter.getDateTimeFormat(evt.getSource().getDateValue());
                HR.util.Control.setValueState("submitToDate",this,"None");
                 // check the corresponding From Date is valid or not
                if(new Date(this.getView().byId("submitFromDate").getValue())=="Invalid Date"){
                    error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                    HR.util.Control.setValueState("submitFromDate",this,"Error");
                    this.submittedDateError = error;
                }
                else{// If both dates are valid compare if from date is greater than to date
                    submittedFromDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("submitFromDate").getDateValue());
                    HR.util.StatusReports.compareDates(submittedToDate, submittedFromDate,controlId,this);
                     
                }
            }
        }
        
        // If effective from date field has changed - validate the new date
        if(controlId.indexOf("effectiveFromDate") > -1){
               
            // If effective from date is not null
            if(this.getView().byId("effectiveFromDate").getValue()!==""){
                this.getView().byId("effectiveFromDate-cancel").setVisible(true);
                
                // If new value entered by the user  is invalid 
                if(new Date(this.getView().byId("effectiveFromDate").getValue())=="Invalid Date")
                {
                    error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                    HR.util.Control.setValueState("effectiveFromDate",this,"Error");
                    this.effectiveDateError = error;
                }
                else
                {   // If new date entered is valid 
                    effectiveFromDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("effectiveFromDate").getDateValue());
                    HR.util.Control.setValueState("effectiveFromDate",this,"None");
                     // check the corresponding To Date is valid or not
                    if(this.getView().byId("effectiveToDate").getValue()!==""){
                        if(new Date(this.getView().byId("effectiveToDate").getValue())=="Invalid Date"){
                            error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                            HR.util.Control.setValueState("effectiveToDate",this,"Error");
                            this.effectiveDateError = error;
                        }
                        else{ // If both dates are valid compare if from date is greater than to date
                            effectiveToDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("effectiveToDate").getDateValue());
                            HR.util.StatusReports.compareDates(effectiveToDate,effectiveFromDate,controlId,this) ;
                        }
                    }
                }
            }
            else{ // If effective from field is null
                HR.util.Control.setValueState("effectiveFromDate",this,"None");
                if(HR.util.Control.getValue("effectiveToDate", this)!=="Invalid Date" ){
                    HR.util.Control.setValueState("effectiveToDate",this,"None");
                }
                this.getView().byId("effectiveFromDate-cancel").setVisible(false);
            }
                
        }
         // If effective from date field has changed - validate the new date 
        if(controlId.indexOf("effectiveToDate") > -1){
               
            // If effective to date is not null
            if(this.getView().byId("effectiveToDate").getValue()!==""){
                this.getView().byId("effectiveToDate-cancel").setVisible(true);
                 // If new value entered by the user  is invalid 
                if(new Date(this.getView().byId("effectiveToDate").getValue())=="Invalid Date")
                { 
                    error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                    HR.util.Control.setValueState("effectiveToDate",this,"Error");
                    this.effectiveDateError = error;
                }
                else
                {   // If new date entered is valid 
                    effectiveToDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("effectiveToDate").getDateValue());
                    HR.util.Control.setValueState("effectiveToDate",this,"None");
                     // check the corresponding from Date is valid or not
                    if(this.getView().byId("effectiveFromDate").getValue()!==""){
                        if(new Date(this.getView().byId("effectiveFromDate").getValue())=="Invalid Date"){
                            error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                            HR.util.Control.setValueState("effectiveFromDate",this,"Error");
                            this.effectiveDateError = error;
                        }
                        else{ // If both dates are valid compare if from date is greater than to date
                            effectiveFromDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("effectiveFromDate").getDateValue());
                            HR.util.StatusReports.compareDates(effectiveToDate,effectiveFromDate,controlId,this);
                        }
                    }
                }
                   
            }
            else{  // If effective from field is null
                HR.util.Control.setValueState("effectiveToDate",this,"None");
                if(HR.util.Control.getValue("effectiveFromDate", this)!=="Invalid Date" ){
                    HR.util.Control.setValueState("effectiveFromDate",this,"None");
                }
                this.getView().byId("effectiveToDate-cancel").setVisible(false);
            }
        }
    }
});
