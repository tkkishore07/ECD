sap.ui.core.mvc.Controller.extend("HR.view.ApprovalsMaster", {	
	onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("ApprovalsMaster").attachPatternMatched(this._routePatternMatched, this);
	    this._router.getRoute("ApprovalsDetail").attachPatternMatched(this._routePatternMatched, this);
        this._router.getRoute("ApprovalsMasterMobile").attachPatternMatched(this._routePatternMatched, this);
        this.getApprovalList();
        if(sap.ui.getCore().getModel("i18n").getProperty("Mobile")){ 
        /* to decide the master page content in case of mobile access. For mobile access the back button is not visible to prevent navigation to 
        Main menu. The messageBundle property needs to be set to false to disable all mobile device specific coding*/
            if(sap.ui.Device.system.phone){
                this.getView().byId("ApprovalsMaster").setShowNavButton(false);
            }
        }
	},
	_routePatternMatched: function(oEvent) {
	    if(!sap.ui.Device.system.phone && sap.ui.getCore().byId("splitApp").getMode()==="HideMode"){
            this.getView().byId("HideButton").setVisible(false);
            this.getView().byId("ShowButton").setVisible(true);
        }
        else if(!sap.ui.Device.system.phone){
            this.getView().byId("ShowButton").setVisible(false);
            this.getView().byId("HideButton").setVisible(true);
        }
        else{
            this.getView().byId("ShowButton").setVisible(false);
            this.getView().byId("HideButton").setVisible(false);
        }
	},
	handleNavButtonPress : function (oEvent) {
		if(!sap.ui.Device.system.phone) this._router.navTo("Menu"); // to prevent navigation to Main Menu in case of mobile back button press
	},
	openECD: function (oEvent){ // function is called on selection of any workitem from the approval list to display the request details in detail page of the App
        var obj = oEvent.getSource().getBindingContext();
        
        var selectedRow = this.getView().getModel().getProperty(null,obj); 
        if(selectedRow.Process.indexOf('Education')>-1){
            this._router.navTo("EducationData",{ID:selectedRow.WiID});
        }
        else{
            this._router.navTo("ApprovalsDetail",{ECDID:selectedRow.WiID}); // opens up in the detail page of the split App
        }
	},
	refresh: function(){// sync the workitems displayed in Approval list table with the backend & update the count of no of approval requests on Menu page 
	    var that=this;
	    var oModel = sap.ui.getCore().getModel("ApprovalList");
	    oModel.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        sap.ui.controller("HR.view.Menu").setPendingApprovalCount();
        oModel.loadData(HR.i18n.URL.MyApproval.getAllApprovalRequests(""), null, false);
        oModel.refresh(true);
        oModel.attachRequestCompleted(function(){  
            HR.util.Busy.setBusyOff();
        });
        
	},
	// Function to display Approval requests on the Master Page
	getApprovalList: function(){
	    var that=this;
	    var oModel = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModel,"ApprovalList");
	    var sortModel = function(data) {
            var fGrouper = function(oContext) {
                var sType = oContext.getProperty("Process") || "Undefined";
                if(sType==="Employee Data Change Process"){
                    sType = "Employee Data Change";
                }
                else if(sType==="Employee Education form"){
                    sType = "Education Data";
                }
                return { key: sType , value: sType }
            }
            var grpSorter =   new sap.ui.model.Sorter("Process", null, fGrouper);
            var listSorter =  new sap.ui.model.Sorter("DaysPending", null, null);
            listSorter.fnCompare = function(valueA, valueB)
            {
              return parseInt(valueA) - parseInt(valueB); 
            };
            var sorter = [];
            sorter.push(grpSorter);
            sorter.push(listSorter);
            that.getView().setModel(oModel); 
            that.getView().byId("approvalsList").getBinding("items").sort(sorter);
	    }
        oModel.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModel.loadData(HR.i18n.URL.MyApproval.getAllApprovalRequests(""));
        
        oModel.attachRequestCompleted(function(){ 
            that.getView().setModel(oModel); 
            sortModel(oModel.getData()) ;
            HR.util.Busy.setBusyOff();
        });
	},
	hide: function(){
	    sap.ui.getCore().byId("splitApp").setMode("HideMode");
		sap.ui.getCore().byId("splitApp").hideMaster();
		this.getView().byId("HideButton").setVisible(false);
        this.getView().byId("ShowButton").setVisible(true);
	},
	show: function(){
	    sap.ui.getCore().byId("splitApp").setMode("ShowHideMode");
	    this.getView().byId("HideButton").setVisible(true);
        this.getView().byId("ShowButton").setVisible(false);
	}
});