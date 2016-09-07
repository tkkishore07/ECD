sap.ui.controller("HR.view.Delegation", {
	onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("Delegation").attachPatternMatched(this._routePatternMatched, this);
	},
	removeTime: function(date){
	    date.setHours(0); date.setMinutes(0);date.setSeconds(0); date.setMilliseconds(0);
	},
	setStatus: function(oModel){
	    var sysDate = new Date();
	    /*Two dates objects with same value(date) does not get treated as equal when compared due to difference in time.
	      Therefore to enable comparison between dates, time is set to zero.*/
	    this.removeTime(sysDate); 
	    for(i=0;i<oModel.getData().d.results.length;i++){
            if(oModel.getData().d.results[i].DfDate !=null && oModel.getData().d.results[i].DtDate !=null){
	            var startDate= HR.util.Formatter.getNormalDateDefault(oModel.getData().d.results[i].DfDate);
	            var endDate=HR.util.Formatter.getNormalDateDefault(oModel.getData().d.results[i].DtDate);
	            if(sysDate.getTime()>= startDate.getTime() && sysDate.getTime() <= endDate.getTime()) {
	   // odata service field named 'Action' is mapped to the onscreen table field 'Status'.
	   // If there is an existing delegation covering the current date, its status is set to 'Active'. All other delegations will have status as 'Inactive'
	                oModel.getData().d.results[i].Action = "Active"; 
	            }
	            else {
	                oModel.getData().d.results[i].Action = "Inactive";
	            }
            }         
	    }
	    oModel.refresh(true);	    
	},
	_routePatternMatched: function(evt) {
	    that=this;
	    //Blank model to display blank screens in Manager search
	    var oModelBlank = new sap.ui.model.json.JSONModel();
	    sap.ui.core.Core().setModel(oModelBlank, "blankModel");
	    
	    var oModel = new sap.ui.model.json.JSONModel();
        HR.util.Busy.setBusyOn(true);
	    $.getJSON(HR.i18n.URL.Delegation.getMyDelegations(), function (data) {
	        oModel.setData(data);
            that.getView().setModel(oModel); 
            sap.ui.getCore().setModel(oModel, "delegations");
            that.setStatus(oModel);
	        HR.util.Busy.setBusyOff(); 
	    }).error(function(err) { 
                HR.util.Busy.setBusyOff();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });
	},   
    submitAddDeleteDelegate: function(parameters, successFn){
        // Same odata service is used for both adding & deleting a delegation. Type of request gets determined by the value in parameters.Action attribute.
        that=this;
        HR.util.General.ajaxWrite(HR.i18n.URL.Delegation.addDeleteDelegation.entity, HR.i18n.URL.Delegation.addDeleteDelegation.links(parameters.DfPersonID) ,parameters, successFn, that,"PUT");
    },
    deleteDelegate: function(evt){ // called on press of onscreen delete Icon
        that=this;
        var obj = evt.getSource().getBindingContext(); // fetches the object of the Items aggregation selected for deletion.
        var selectedRow = this.getView().getModel().getProperty(null, obj);        
        parameters = {}; // Array to hold the input values to be send to the delete delegation Odata service.(PUT request)
        parameters.DfDate = selectedRow.DfDate;
        parameters.DtDate = selectedRow.DtDate
        parameters.DtPersonID = selectedRow.DtPersonID
        parameters.DfPersonID = selectedRow.DfPersonID
        parameters.Action = "DELETE";

        //On success callback function of the delete delegation Odata service
        var successFn = function(data){
            oModel = sap.ui.getCore().getModel("delegations");
            oModel.loadData(HR.i18n.URL.Delegation.getMyDelegations(), null, false);
            that.setStatus(oModel);
            sap.m.MessageToast.show(HR.i18n.Messages.Delegation.deleteDelegation, {closeOnBrowserNavigation: false});            
        };
        this.submitAddDeleteDelegate(parameters,successFn); 
    },    
    addDelegate: function(evt){
        that=this;
        parameters = {}; // Array to hold the input values to be send to the odata service for adding a delegation.(PUT request)
        parameters.DfDate = sap.ui.core.Fragment.byId("DelegateDialog", "startDate").getDateValue();
        parameters.DtDate = sap.ui.core.Fragment.byId("DelegateDialog", "endDate").getDateValue();
        parameters.DtPersonID = sap.ui.core.Fragment.byId("DelegateDialog", "delegateTo").getValue();
        parameters.DfPersonID = sap.ui.getCore().getModel("loggedUser").getData().d.results[0].PersonId;
        parameters.Action = "ADD";
        // Validation - Start date, End Date & Delegate To need to be selected inorder to add a Delegation
        if(parameters.DfDate==null || parameters.DfDate==undefined || parameters.DtDate==null || parameters.DtDate==undefined ||
           parameters.DtPersonID==null || parameters.DtPersonID==undefined){
            sap.m.MessageToast.show(HR.i18n.Messages.Delegation.error.empty, {closeOnBrowserNavigation: false});
            return;
        }
        this.removeTime(parameters.DfDate);
        this.removeTime(parameters.DtDate);
        var sysDate = new Date();
        this.removeTime(sysDate);
        // Validation - End Date cannot be earlier than Start date
        if(parameters.DfDate > parameters.DtDate){
            sap.m.MessageToast.show(HR.i18n.Messages.Delegation.error.endDate, {closeOnBrowserNavigation: false});
            return;
        }
        // Validation - Delegation can be raised for current & future dates only
        if(sysDate > parameters.DfDate)  {
	        sap.m.MessageToast.show(HR.i18n.Messages.Delegation.error.pastDate, {closeOnBrowserNavigation: false});
	        return;
	    }
        var oModel = sap.ui.getCore().getModel("delegations");
        for(i=0; i < oModel.getData().d.results.length; i++)
        {  
            var sDate= HR.util.Formatter.getNormalDateDefault(oModel.getData().d.results[i].DfDate);
	        var eDate=HR.util.Formatter.getNormalDateDefault(oModel.getData().d.results[i].DtDate);
	    /* Validation to prevent the dates/period of new delegation from overlapping with dates of any of the existing delegation request
	       in parts or in full*/ 
                if((parameters.DfDate>=sDate && parameters.DfDate<=eDate) || (parameters.DtDate>=sDate && parameters.DtDate<=eDate)
                ||(sDate>=parameters.DfDate && sDate<=parameters.DtDate)||(eDate>=parameters.DfDate && eDate<=parameters.DtDate)){
                    sap.m.MessageToast.show(HR.i18n.Messages.Delegation.error.period, {closeOnBrowserNavigation: false});
                    return;
                }    
        }
        parameters.DfDate = HR.util.Formatter.getODataDate(parameters.DfDate);
        parameters.DtDate = HR.util.Formatter.getODataDate(parameters.DtDate);
        // Person ID needs to sepaarted from Person ID & Employee Name combination
        var parts = parameters.DtPersonID.split(" ");
        parameters.DtPersonID = parts[0];
        
        //On success callback function of the add delegation Odata service
        var successFn = function(data){
            oModel.loadData(HR.i18n.URL.Delegation.getMyDelegations(), null, false);
            that.setStatus(oModel);
            sap.m.MessageToast.show(HR.i18n.Messages.Delegation.addDelegation, {closeOnBrowserNavigation: false});	        
        }; 
        this.submitAddDeleteDelegate(parameters, successFn);
        this._DelegateDialog.close();
    },
    // Open AddDelegate fragment for adding a Delegation on click of "Add Delegation" button
    createDelegate: function(){
        if (!this._DelegateDialog) { //Create an instance of the fragment if it already doesn't exist
          this._DelegateDialog = sap.ui.xmlfragment("DelegateDialog","HR.view.Dialog.AddDelegate",this );
          this.getView().addDependent(this._DelegateDialog);
        }
    // Below code is to invalidate any currently set values in the Dialog box fields
        sap.ui.core.Fragment.byId("DelegateDialog", "startDate").setDateValue(null);
        sap.ui.core.Fragment.byId("DelegateDialog", "endDate").setDateValue(null);
        sap.ui.core.Fragment.byId("DelegateDialog", "delegateTo").setValue("");        
        this._DelegateDialog.open();
        HR.util.PopupDrag.draggable("DelegateDialog");  HR.util.PopupDrag.draggable("DelegateDialog");
    }, 
    closeDialog: function(){
        if(this._DelegateDialog) {
            this._DelegateDialog.close();
        }
    },
    // Opens up SelectDelegateTo fragment to search an employee to delegate to
    _delegateSearchPopup: function (){
        if(!this._delegateDialog) {
            this._delegateDialog = sap.ui.xmlfragment("DelegateSelect","HR.view.Dialog.SelectDelegateTo",this );
            this.getView().addDependent(this._delegateDialog);
        }
        if(this._delegateDialog){
            // setting the dialog to a blank model so that initially search list is empty
            if(sap.ui.getCore().getModel("delegateToSearch") || sap.ui.getCore().getModel("delegations")) {  
                this._delegateDialog.setModel(sap.ui.getCore().getModel("blankModel"));
            }
        }
        this._delegateDialog.open();
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
        HR.util.PopupDrag.draggable("DelegateSelect");
    },
    _delegateSearchPopupSearch : function (evt) { // to search from list of employees eligible for delegating to
        var sValue = evt.getParameter("value");
        this.validateSearchInput(evt,sValue);  //Method to validate the search input and get the data based on that
    },
    _delegateSearchPopupConfirm : function (evt) { //Funnction to select an employee in the 'Delegate To' field
        if(evt.getParameters().selectedContexts!==undefined){
            obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("delegateToSearch").getData() , evt.getParameters().selectedContexts[0].sPath);
            sap.ui.core.Fragment.byId("DelegateDialog", "delegateTo").setValue(obj.PersonID+" "+obj.FirstName);
        }
    },
    getForwardsList : function(sValue){
	    var oModelForManager = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModelForManager, "delegateToSearch");
	    oModelForManager.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModelForManager.loadData(HR.i18n.URL.Delegation.getDelegateTos(sValue));
        oModelForManager.attachRequestCompleted(function(){
            HR.util.Busy.setBusyOff();
        });
	},
    validateSearchInput: function(evt,sValue) 
    {   var oFilter;
        if(sValue.length>=3){
            //If user has entered emp name
                this.getForwardsList(sValue);
                this._delegateDialog.setModel(sap.ui.getCore().getModel("delegateToSearch"));
            }
        if(sValue.length==0){
                HR.util.Busy.setBusyOff();
                evt.getSource().getBinding("items").filter([oFilter]);
        }
    }
});    