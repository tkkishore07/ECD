$.sap.require("sap.m.MessageBox");
$.sap.require("sap.m.TablePersoController");
$.sap.require("HR.util.MyRequestsFilter");
sap.ui.controller("HR.view.MyRequests", {
    managerPernr : null,
    onInit: function()
    {
        this._router = sap.ui.core.UIComponent.getRouterFor(this);
        this._router.getRoute("MyRequests").attachPatternMatched(this._routePatternMatched, this);
        var myRequests = new sap.ui.model.json.JSONModel(); 
        sap.ui.getCore().setModel(myRequests,"myRequests");
    },
    
    _routePatternMatched: function(evt)
    {  
        i18nModel = sap.ui.getCore().getModel("i18n");
        this.formName = "MyRequests"; 
        this.dateValidation = "";
        //Code to apply filter for mobile devices
       /* if(sap.ui.Device.system.phone)
        {   
            console.log("mobile device");
            this.getView().byId("filter").setVisible(true);
            this._oTPC = new sap.m.TablePersoController({
            table: this.getView().byId("myRequests"),
            componentName: "myRequests",
            persoService: HR.util.MyRequestsFilter,
            }).activate();
        }
        this.getView().byId("filter").setVisible(false);*/
        this.managerPernr = sap.ui.getCore().getModel("loggedUser").getData().d.results[0].Pernr;
        this.managerPernr = HR.util.Formatter.getPernr(this.managerPernr); // Removing leading zeros
        this.setDate();   // Setting default from and to date
        var formattedDates = this.getDates(); 
        this.getMyRequests(formattedDates.toDate,formattedDates.fromDate,this.managerPernr);
        HR.util.Control.setValueState("fromDate",this,"None");
        HR.util.Control.setValueState("toDate",this,"None"); 
       // fetching the data based for selected dates
         //Get data based on from and to date
    },
    
    // Required for filter
    /* onPersoButtonPressed: function (oEvent) {
        this._oTPC.openDialog();
    },

    onTablePersoRefresh : function() {
       HR.util.MyRequestsFilter.resetPersData();
       this._oTPC.refresh();
    },*/
    
    // To set default from and to date. To date- current and From date - one month ago
    setDate: function()
    {
        var currentDate = HR.util.General.getDate();
        this.getView().byId("toDate").setDateValue(currentDate); 
        var minus1month = HR.util.General.getDate(); 
        minus1month.setDate(minus1month.getDate() - 30); 
        this.getView().byId("fromDate").setDateValue(minus1month); 
    },
    
    // To change the date format 
    getDates: function(){
        var toDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("toDate").getDateValue());
        var fromDate =  HR.util.Formatter.getDateTimeFormat(this.getView().byId("fromDate").getDateValue());
        return {
            toDate: toDate,
            fromDate: fromDate
        }
    },
    
    // To fetch the date based on manager pernr, from and to date
    getMyRequests: function(toDate,fromDate,managerPernr, that)
    {
       var that= this;
	   HR.util.Busy.setBusyOn(true);
       $.getJSON(HR.i18n.URL.MyRequests.getRequestDetails(toDate,fromDate,managerPernr), function (data) {
                if(data==null){
                     sap.m.MessageToast.show(HR.i18n.Messages.MyRequests.noRequestsFound,{ duration: 5000});
                } 
                sap.ui.getCore().getModel("myRequests").setData(data);
		        oTable =that.getView().byId("myRequests");
                oTable.setModel(sap.ui.getCore().getModel("myRequests")) ;
                oTable.getModel().refresh(true);
		        HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
		    }).error(function(err) { 
		        HR.util.Busy.setBusyOff();
		        that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
		    });
    },
    error:function(evt){
        if(this.dateValidation!==null || this.dateValidation!==undefined)
            sap.m.MessageToast.show(this.dateValidation);
    },
    // To check the status of selected request
    checkStatus: function(status)
    {
        status = status.toLowerCase();
        
       //To display/hide footer buttons based on status
        if(status.indexOf("rejected") > -1){
            this.getView().byId("WithdrawButton").setVisible(false); 
            this.getView().byId("DiscardButton").setVisible(false);
            this.getView().byId("OpenButton").setVisible(false);
            this.getView().byId("CopyButton").setVisible(true);
        } 
       
        else if(status.indexOf("started approval pending") > -1){
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("DiscardButton").setVisible(false);
            this.getView().byId("OpenButton").setVisible(false); 
            this.getView().byId("WithdrawButton").setVisible(true); 
        }
       
        else if(status=='draft'){
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("WithdrawButton").setVisible(false); 
            this.getView().byId("DiscardButton").setVisible(true);
            this.getView().byId("OpenButton").setVisible(true); 
        }
        else
        {
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("WithdrawButton").setVisible(false) ; 
            this.getView().byId("DiscardButton").setVisible(false) ;
            this.getView().byId("OpenButton").setVisible(false); 
        }
      
    },
    
    // To navigate the user from requests to details page on press of Work item id link
    onLinkPress : function(evt) {
        var data = sap.ui.getCore().getModel("myRequests").getData().d.results;
        var employeeId, workItemId,ecdName,ecdId;
        for (var count=0; count<data.length; count++){
            if(data[count].WiID==evt.getSource().getText()){
                employeeId = data[count].Pernr;
                workItemId = data[count].WiID;
                ecdName= HR.util.Formatter.getECDName(data[count].EcdName);
                ecdId = data[count].EcdID;
                break;
            }
        }
        this._router.navTo("Details",{id:employeeId, WorkItemId: workItemId, ECDName:ecdName, formName: this.formName});
    },
    
    //To update the data and refresh the table if From date gets changed
    onFromDateChange: function(evt)
    {   
        var error,toDate,changedFromDate;
        if(new Date(evt.getSource().getValue())=="Invalid Date")
        {
            error=HR.i18n.Messages.EmployeeDataChange.errors.date;
            HR.util.Control.setValueState("fromDate",this,"Error");
            this.dateValidation = error;
        }
        else
        {
            changedFromDate = HR.util.Formatter.getDateTimeFormat(evt.getSource().getDateValue());
            HR.util.Control.setValueState("fromDate",this,"None");
            if(new Date(this.getView().byId("toDate").getValue())=="Invalid Date"){
                error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                HR.util.Control.setValueState("toDate",this,"Error");
                this.dateValidation = error;
            }
            else{
                toDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("toDate").getDateValue());
                var checkDate = this.validateDate(toDate,changedFromDate) ;
                if(checkDate){
                   this.getMyRequests(toDate,changedFromDate,this.managerPernr, this) ;
                }
            }
        }
    },
    
    //To update the data and refresh the table if To date gets changed
    onToDateChange: function(evt)
    {
        var error,fromDate,changedToDate;
        if(new Date(evt.getSource().getValue())=="Invalid Date")
        {
            error=HR.i18n.Messages.EmployeeDataChange.errors.date;
            HR.util.Control.setValueState("toDate",this,"Error");
            this.dateValidation = error;
        }
        else
        {
            changedToDate = HR.util.Formatter.getDateTimeFormat(evt.getSource().getDateValue());
            HR.util.Control.setValueState("toDate",this,"None");
            if(new Date(this.getView().byId("fromDate").getValue())=="Invalid Date"){
                error=HR.i18n.Messages.EmployeeDataChange.errors.date;
                HR.util.Control.setValueState("fromDate",this,"Error");
                this.dateValidation = error;
            }
            else{
                fromDate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("fromDate").getDateValue());
                var checkDate = this.validateDate(changedToDate,fromDate);
                if(checkDate){
                   this.getMyRequests(changedToDate,fromDate,this.managerPernr, this) ;
                }
            }
        }
    },
    
    // To Validate the date (if from date is greater than to date
    validateDate: function(toDate,fromDate) 
    {
            if(fromDate>toDate) {   
                error=HR.i18n.Messages.MyRequests.invalidDate; 
                HR.util.Control.setValueState("toDate",this,"Error");
                HR.util.Control.setValueState("fromDate",this,"Error");
                this.dateValidation=error;
                return false;
            }
            else{
                HR.util.Control.setValueState("toDate",this,"None");
                HR.util.Control.setValueState("fromDate",this,"None");
                return true;
            }
    },
    
    // If row selection gets changed
    onRowSelectionChange : function(oEvent)
    {
        this.getView().byId("ShowDetailsButton").setVisible(true);
        var path = this.getDetails();
        var status = oTable.getModel().getProperty(path).Status;
        this.checkStatus(status);
    },
    
    // To get the selected row context
    getDetails: function(){
        var oContext=  oTable.getSelectedItem().getBindingContext() ; 
        var path = oContext.getPath();
        return path;
    },
    
    // To navigate the user from Requests to Details page on Details button's click
    showDetails: function()
    {   
        var path = this.getDetails();
        var workItemId = oTable.getModel().getProperty(path).WiID;
        var ecdName = oTable.getModel().getProperty(path).EcdName;
        ecdName= HR.util.Formatter.getECDName(ecdName);
        var employeeId = oTable.getModel().getProperty(path).Pernr;
        var ecdId =  oTable.getModel().getProperty(path).EcdID;
        if(employeeId){  
            this._router.navTo("Details",{id:employeeId, WorkItemId: workItemId, ECDName:ecdName , formName: this.formName});
        }
    },
    
    // To open the request as saved ECD form - enabled if the request is in draft status
    onOpen: function(oEvent){
          
        var path = this.getDetails();
        var status = oTable.getModel().getProperty(path).Status;
        if(status.toLowerCase()=="draft"){
            status="saved";
        }
        var workItemId = oTable.getModel().getProperty(path).WiID;
        var employeeId =  oTable.getModel().getProperty(path).Pernr;
        var formType = HR.util.Formatter.getECDName(oTable.getModel().getProperty(path).EcdName);
        if(formType===i18nModel.getResourceBundle().getText("EDCValue")){
            this._router.navTo("EmployeeDataChange",{ID:employeeId, status:status , workItemId: workItemId });
        }
        else if(formType===i18nModel.getResourceBundle().getText("ContractExtensionValue")){
             this._router.navTo("ContractInternExtension",{ID:employeeId, status:status , workItemId: workItemId });
        }
        else if(formType===i18nModel.getResourceBundle().getText("TerminationValue")){
             this._router.navTo("Termination",{ID:employeeId, status:status , workItemId: workItemId });
        }
        
        
    },
    
    // To generate the layout for pop ups 
    getMessageBoxLayout: function(message){
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: message }));
        oLayout.addContent(new sap.m.Label({text: ""}));
        return  oLayout;   
    }, 
    
    // To delete the request if its in draft status
    onDiscard: function(oEvent){
        var msgBoxTitle = oEvent.getSource().getText();
        var successFn = function(data){
         
    		var oLayout = new sap.ui.layout.VerticalLayout();
    		oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.MyRequests.draftDiscarded}));
    		sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success");
    		
        };
        this.go(successFn,msgBoxTitle, HR.i18n.Messages.MyRequests.discardDraft); 
    },
    
    //To withdraw the request which is in started state and awaiting for approval
    onWithdraw: function(oEvent){
        var that=this;
        var formattedDates = this.getDates();
        var msgBoxTitle = oEvent.getSource().getText();
        var successFn = function(data){
            var oLayout = new sap.ui.layout.VerticalLayout();
    		oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.MyRequests.requestWithdrawn}));
    		sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success",sap.m.MessageBox.Action.Ok,
    		            function(oAction) {
                            if (oAction === sap.m.MessageBox.Action.YES) {
                                var formattedDates = that.getDates();
    	                        that.getMyRequests(formattedDates.toDate,formattedDates.fromDate,that.managerPernr, that) ;
    	                        
                             }
    		            });   
    		 }
        this.go(successFn,msgBoxTitle, HR.i18n.Messages.MyRequests.withdraw); 
    },
    
    //To send a withdraw or discard draft request to backend along with requests' parameters
    go: function(successFn, msgBoxTitle, msgBoxMsg,that){
        var path = this.getDetails();
        var workItemId = oTable.getModel().getProperty(path).WiID;
        var withdrawOrDiscard= function(wiID,event){
            parameters = {};
            parameters.WiID = wiID;
            parameters.Event = event;
            HR.util.General.ajaxWrite(HR.i18n.URL.MyRequests.onWithdrawOrDiscard.entity,HR.i18n.URL.MyRequests.onWithdrawOrDiscard.link(workItemId,event),parameters, successFn, this,"PUT");
        };
        
        if(msgBoxTitle=="Withdraw" || msgBoxTitle=="Discard Draft") { 
            var oLayout = this.getMessageBoxLayout(msgBoxMsg);
            var event; 
            // to show a confirmation message to user if he really wants to withdraw or discard the request
            sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.NONE,
                    msgBoxTitle, [ sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) { // If user clicks yes
                            if(msgBoxTitle=="Withdraw"){
                                event = "WITHDRAW"
                            } 
                            else if(msgBoxTitle.indexOf("Draft") > -1){
                                event = "DEL_DRAFT"
                            } 
                           withdrawOrDiscard(workItemId,event);
                        }
                    },"confirmDialog");
            HR.util.PopupDrag.draggable("confirmDialog");
        }
        
    },
    
    // To show the copied request in ECD form if the request was in rejected state
    onCopy: function(oEvent){
        var status = oEvent.getSource().getText();
        status = status.toLowerCase();
        var path = this.getDetails();
        var workItemId = oTable.getModel().getProperty(path).WiID;
        var employeeId =  oTable.getModel().getProperty(path).Pernr;
        this._router.navTo("EmployeeDataChange",{ID:employeeId, status:status, workItemId: workItemId});
        
    },
    
    
});    
