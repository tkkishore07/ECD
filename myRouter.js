jQuery.sap.declare("HR.myRouter");

HR.myRouter = {

	/**
	 * to extend the router with a nav to method that
	 * does not write hashes but load the views properly
	 */
	_myNavToWithoutHash : function (sViewName, sViewType, isMaster, oData) {
		var oApp = sap.ui.getCore().byId("splitApp");
		var oView = this.getView(sViewName, sViewType);
		oApp.addPage(oView, isMaster);
		oApp.toDetail(oView.getId(), "show", oData);
	},

	/**
	 * navigates back if there was a previos navigation,
	 * if not, navigation back to home/welcome screen
	 */
	_myNavBack : function () {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var oPrevHash = oHistory.getPreviousHash();
	    if (oPrevHash !== undefined) {
			window.history.go(-1);
		} else {
			this.navTo("EmployeeSearch",{pageNum:1});
		}
	}
};