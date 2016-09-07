$.sap.require("HR.util.Formatter");
$.sap.require("HR.util.Control");
$.sap.require("HR.util.General");
$.sap.require("HR.util.StatusReports");
$.sap.require("HR.util.FormAccess");
$.sap.require("HR.util.Busy");
$.sap.require("HR.util.PopupDrag");
$.sap.require("HR.util.MyRequestsFilter");
$.sap.require("HR.i18n.Messages");
$.sap.require("HR.i18n.URL");
$.sap.require("HR.i18n.User");
$.sap.require("sap.m.InstanceManager");
sap.ui.controller("HR.view.App", {
    onInit:function(evt){
        var role = HR.i18n.User.Roles.find();
        var managerPernr = sap.ui.getCore().getModel("loggedUser").getData().d.results[0].Pernr;
	    if($.inArray(HR.i18n.User.Roles.Manager, role) !== -1)
	    {
	        var oModelReportees = new sap.ui.model.json.JSONModel();
            oModelReportees.loadData(HR.i18n.URL.EmployeeSearch.getDirectReportees(managerPernr),null,false,"GET",false,false,null); //anupriya - once chandra gives you employee search services
            sap.ui.getCore().setModel(oModelReportees ,"directReportees");	  
	    } 
    }, 
    onBeforeRendering: function(){ //default home screen
      if(sap.ui.getCore().byId("splitApp").getCurrentDetailPage()===undefined && !sap.ui.Device.system.phone){
           sap.ui.core.UIComponent.getRouterFor(this).navTo("EmployeeSearch",{pageNum:1});  
           sap.ui.getCore().byId("splitApp").setMode("ShowHideMode");
      }   
      else if(sap.ui.Device.system.phone){
            sap.ui.core.UIComponent.getRouterFor(this).navTo("ApprovalsMasterMobile",{ECDID:0});
      }
    }
});