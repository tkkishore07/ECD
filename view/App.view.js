
sap.ui.jsview("HR.view.App", {

	getControllerName: function () {
		return "HR.view.App";
	},
	
	createContent: function (oController) {
		this.app = new sap.m.SplitApp("splitApp",{});
		return this.app;
	}
});