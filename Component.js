jQuery.sap.declare("HR.Component");

function version() { return sap.ui.getCore().getModel("i18n").getResourceBundle().getText("version");};
sap.ui.core.UIComponent.extend("HR.Component", {
    metadata: {
		routing: {
			config: {
				viewType: "XML",
				viewPath: "HR.view",
				targetControl: "splitApp",
				clearTarget: false,
				controlId: "splitApp",
				targetsClass: "sap.m.routing.Targets",
				transition: "show"
			},
            targets: {
              ApprovalsHome: {
                viewName: "ApprovalsHome",
                viewLevel: 0,
                controlAggregation: "detailPages"
              },
              ApprovalsDetail: {
                viewName: "ApprovalsDetail",
                viewLevel: 2,
                controlAggregation: "detailPages"
              },
              ApprovalsMaster: {
                viewName: "ApprovalsMaster",
                viewLevel: 1,
                controlAggregation: "masterPages"
              }
            },
			routes: [
			    {	
			        pattern: "Approvals/Home/{ECDID}",
					name : "ApprovalsMaster",
					target: ["ApprovalsMaster", "ApprovalsHome"]
				},
				{	
			        pattern: "Approvals/Home/",
					name : "ApprovalsMasterMobile",
					target: ["ApprovalsMaster"]
				},
			    {	
			        pattern: "Approvals/Detail/{ECDID}",
					name : "ApprovalsDetail",
					target: ["ApprovalsDetail"]
				},
				
				{	pattern: "",
					name : "Menu",
					view : "Menu",
					targetAggregation : "masterPages",
					subroutes : [
						{
        					pattern: "EmployeeSearch/page/{pageNum}",
        					name: "EmployeeSearch",
        					view: "EmployeeSearch",
        					targetAggregation: "detailPages"
        				},
        				{
        					pattern: "MyRequests",
        					name: "MyRequests",
        					view: "MyRequests",
        					targetAggregation: "detailPages"
        				},
        		    	{
					       	pattern: "Details/{formName}/{id}/{WorkItemId}/{ECDName}",
				            name: "Details",
					        view: "EmployeeDataChangeDetails",
					        targetAggregation: "detailPages"
        				},
        				{
        					pattern: "EmployeeDataChange/{ID}/{status}/{workItemId}",
        					name: "EmployeeDataChange",
        					view: "EmployeeDataChange",
        					targetAggregation: "detailPages"
        				},
        				{
					       	pattern: "EmployeeDataChangeSuccess/{ID}/{status}/{ProcessReferenceNumber}",
				            name: "EmployeeDataChangeSuccess",
					        view: "EmployeeDataChangeSuccess",
					        targetAggregation: "detailPages"
        				},
        				{
        					pattern: "ContractInternExtension/{ID}/{status}/{workItemId}",
        					name: "ContractInternExtension",
        					view: "ContractInternExtension",
        					targetAggregation: "detailPages"
        				},
        				{
        					pattern: "Termination/{ID}/{status}/{workItemId}",
        					name: "Termination",
        					view: "Termination",
        					targetAggregation: "detailPages"
        				},
        				{
        					pattern: "ViewProfile/{ID}/{employeeType}/{employeeRole}/:flag:",
        					name: "ViewProfile",
        					view: "ViewProfile",
        					targetAggregation: "detailPages"
        				},
        				{
        					pattern: "StatusReport/:flag:",
        					name: "StatusReport",
        					view: "StatusReport",
        					targetAggregation: "detailPages"
        				},
        				{
        					pattern: "Delegation",
        					name: "Delegation",
        					view: "Delegation",
        					targetAggregation: "detailPages"
        				},
        				{
        					pattern: "EducationData/{ID}/:statusReport:",
        					name: "EducationData",
        					view: "EducationData",
        					targetAggregation: "detailPages"
        				}
					]
				}
			]
		}
	},

	init : function () {

		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		jQuery.sap.require("sap.ui.core.routing.HashChanger");
		jQuery.sap.require("HR.myRouter");
		// call overwritten init (calls createContent)
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		//extend the router
		this._router = this.getRouter();
		jQuery.extend(this._router, HR.myRouter);

		// initialize the router
		this._routeHandler = new sap.m.routing.RouteMatchedHandler(this._router);
		this._router.initialize();

	},

	destroy : function () {
		if (this._routeHandler) {
			this._routeHandler.destroy();
		}
		// call overriden destroy
		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	},



	createContent : function() {


		// create root view
		var oView = sap.ui.view({
			id : "app",
			viewName : "HR.view.App",
			type : "JS",
			viewData : { component : this }
		});
		// set i18n model - for views
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : [$.sap.getResourcePath("HR"), "i18n/messageBundle.properties"].join("/"), bundleLocale: "en"
		});
		oView.setModel(i18nModel, "i18n");
		sap.ui.getCore().setModel(i18nModel, "i18n");
		// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
				 	isTouch : sap.ui.Device.support.touch,  
			        isNoTouch : !sap.ui.Device.support.touch,  
			        isPhone : sap.ui.Device.system.phone,  
			        isNoPhone : !sap.ui.Device.system.phone,  
			        listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",  
			        listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"  
		});
		deviceModel.setDefaultBindingMode("OneWay");
		oView.setModel(deviceModel, "device");
		return oView;
	}
});