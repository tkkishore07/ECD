sap.ui.controller("HR.view.Menu", {
    
    onInit: function () {
        this._router = sap.ui.core.UIComponent.getRouterFor(this);
        var oModel = new sap.ui.model.json.JSONModel() ;
        if(sap.ui.Device.system.phone) oModel.loadData([$.sap.getResourcePath("HR"), "i18n/menuMobile.json"].join("/"), null, false);
		else oModel.loadData([$.sap.getResourcePath("HR"), "i18n/menu.json"].join("/"), null, false);

		this.getView().setModel(oModel);
		sap.ui.getCore().setModel(oModel,"Menu");
		
		var oModelApprovalCount = new sap.ui.model.json.JSONModel();
		sap.ui.getCore().setModel(oModelApprovalCount,"ApprovalCount");
		this.setPendingApprovalCount();
	},
	nav: function(menu){
	    if(menu==="Employee Search"){
		    sap.ui.getCore().byId("splitApp").setMode("HideMode");
		    sap.ui.getCore().byId("splitApp").hideMaster();
		    this._router.navTo("EmployeeSearch",{pageNum:1});
		}
		else if(menu==="My Requests"){
		    sap.ui.getCore().byId("splitApp").setMode("HideMode");
		    sap.ui.getCore().byId("splitApp").hideMaster();
		    this._router.navTo("MyRequests");
		}
		else if(menu==="Help"){
		    var url = sap.ui.getCore().getModel("loggedUser").getData().d.results[0].EcdHelplink;
		    window.open(url,'_blank');
		}
		else if(menu==="Status Report"){
		    sap.ui.getCore().byId("splitApp").setMode("HideMode");
		    sap.ui.getCore().byId("splitApp").hideMaster();
            this._router.navTo("StatusReport");
		}
		else if(menu==="Delegation"){
		    sap.ui.getCore().byId("splitApp").setMode("HideMode");
		    sap.ui.getCore().byId("splitApp").hideMaster();
		    this._router.navTo("Delegation");
		}
		else{
		    sap.ui.getCore().byId("splitApp").setMode("ShowHideMode");
		    if(sap.ui.Device.system.phone)this._router.navTo("ApprovalsMasterMobile");
		    else this._router.navTo("ApprovalsMaster",{ECDID:0});
		}
	    
	},
	menuSelect:function(evt){
	    try{
	        //if one of the menu options is chosen, fire menuSelectPress event
	        evt.getParameter("listItem").firePress();
	    }
	    catch(err){
	    }
	},
	menuSelectPress: function (evt) {
        this.nav(evt.getSource().getTitle());
	},
	setPendingApprovalCount: function() {
	    var oModel= sap.ui.getCore().getModel("Menu"); 
	   	if(oModel==undefined) {
	   	    var oModel = new sap.ui.model.json.JSONModel();
	   	    oModel.loadData([$.sap.getResourcePath("HR"), "i18n/menu.json"].join("/"), null, false);
	   	    sap.ui.getCore().setModel(oModel,"Menu");
	   	}    
	 	var oModelApprovalCount=sap.ui.getCore().getModel("ApprovalCount");
        try{
            if(oModelApprovalCount==undefined) {
            var oModelApprovalCount = new sap.ui.model.json.JSONModel();
            sap.ui.getCore().setModel(oModelApprovalCount,"ApprovalCount");
            }
            oModelApprovalCount.loadData(HR.i18n.URL.MyApproval.getPendingApprovalCount(), null, false);
        }
        catch(err){
            console.log(err);
        }
        var count = oModelApprovalCount.getData().d.number;
        if(count=="") count=0;
        if(sap.ui.Device.system.phone) oModel.getData().results[0].title = "My Approvals ("+count+")";
        else oModel.getData().results[2].title = "My Approvals ("+count+")";
        oModel.refresh(true); 
	},
	hide: function(){
	    sap.ui.getCore().byId("splitApp").setMode("HideMode");
		sap.ui.getCore().byId("splitApp").hideMaster();
	}
});