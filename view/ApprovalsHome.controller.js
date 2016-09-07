sap.ui.core.mvc.Controller.extend("HR.view.ApprovalsHome", {
    onInit : function (evt) {
    	this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("ApprovalsMaster").attachPatternMatched(this._routePatternMatched, this);
	},
	_routePatternMatched: function(oEvent) {
	    /* The navigation to this view happens in 3 scenarios a)When an item from approval list is selected, b)When a request is forwarded,
	    c) when a request is approved or rejected, In scenarios a & b, the workitem passed during the navigation is '0'*/
	    this.workItem= oEvent.getParameter("arguments").ECDID;
	    this.refresh();
	},
	refresh: function(oEvent) {
	    var oModelApprovalCount=sap.ui.getCore().getModel("ApprovalCount");
	    if(oModelApprovalCount == undefined){
	        try{
	            var oModelApprovalCount = new sap.ui.model.json.JSONModel();
                oModelApprovalCount.loadData(HR.i18n.URL.MyApproval.getPendingApprovalCount(), null, false);
            }
            catch(err){
                console.log(err);
            }
	    }
        var count =  oModelApprovalCount.getData().d.number; // gets the count of the no of Approval request
        var oModelApprovalList = sap.ui.getCore().getModel("ApprovalList");
	    var pending=0;
	/* After an approval request is approved or rejected at front end, it takes few seconds for the request to get updated in backend.
	   Therefore instead of reloading the model data from backend, the concerned approval request is removed from the model data to update 
	   the approval list on screen & also the count of the no of request is decreased by 1.*/    
	    if(this.workItem !=0) {    // When the request is approved or rejected the workitem is not equal to 0
    	    if(count>0){  // To prevent the approval request count visible on screen from becoming negative if there is no approval request
    	       count=count-1; 
    	       oModelApprovalCount.getData().d.number = count;
    	       oModelApprovalCount.refresh(true);
    	    } 
            var oModelMenu= sap.ui.getCore().getModel("Menu"); 
            if(oModelMenu === undefined){
    	        try{
    	            var oModelMenu = new sap.ui.model.json.JSONModel();
                    oModelMenu.loadData([$.sap.getResourcePath("HR"), "i18n/menu.json"].join("/"), null, false);
                }
                catch(err){
                    console.log(err);
                }
    	      }
    	    oModelMenu.getData().results[2].title = "My Approvals ("+count+")";
            oModelMenu.refresh(true);
            oModelApprovalList.loadData(HR.i18n.URL.MyApproval.getAllApprovalRequests(""), null, false);
            for(var i=0; i < oModelApprovalList.getData().d.results.length; i++){  
                // Below code will remove the workitem which is processed out of the approval list & also find out the no. of days the longest pending request is pending from
                if(oModelApprovalList.getData().d.results[i].WiID != this.workItem)
                {
                    if(pending < parseInt(oModelApprovalList.getData().d.results[i].DaysPending)){
                        pending = parseInt(oModelApprovalList.getData().d.results[i].DaysPending);
                    }
                }
                }
        }
	    else{
	      if(oModelApprovalList.getData().d==undefined) {
        	try{
	            var oModelApprovalList = new sap.ui.model.json.JSONModel();
                oModelApprovalList.loadData(HR.i18n.URL.MyApproval.getAllApprovalRequests(""), null, false);
                //  The third parameter above is set to false to make it synchronous, else method oModelApprovalList.getData() in the code below will throw undefined error
            }
            catch(err){
                console.log(err);
            }
	      }
	      sap.ui.getCore().setModel(oModelApprovalList, "approvals"); 
	      for(i=0; i < oModelApprovalList.getData().d.results.length; i++) {  
                if(pending < parseInt(oModelApprovalList.getData().d.results[i].DaysPending)){
                pending = parseInt(oModelApprovalList.getData().d.results[i].DaysPending);
                }
          } 
	    }
        this.putTexts(count,oModelApprovalList, pending);
	},
	putTexts: function(count, oModel, pending) {
	    var ecdCount=0;
	    var educationCount=0;
	    if(oModel!==undefined){
	        var approvals = oModel.getData().d.results;
	        for(var counter=0; counter<approvals.length; counter++){
	            if(approvals[counter].Process.indexOf('Employee Data Change')>-1){
	                ecdCount++;
	            }
	            else if(approvals[counter].Process.indexOf('Education')>-1){
                    educationCount++;
	            }
	        } 
	    }
	    if(pending===1) this.getView().byId("oldestPending").setText("Oldest Request: "+pending+" day");
	    else this.getView().byId("oldestPending").setText("Oldest Request: "+pending+" days");
        if(count>1) {
            this.getView().byId("ecdRequestCount").setText(ecdCount+" Employee Data Change requests");
            this.getView().byId("educationRequestCount").setText(educationCount+" Education Approval requests");
        }
	    else if(count === 1){
	        this.getView().byId("ecdRequestCount").setText(ecdCount+" Employee Data Change request"); 
	        this.getView().byId("educationRequestCount").setText(educationCount+" Education Approval request");
	    }
	    else if(count === 0) {
	        this.getView().byId("ecdRequestCount").setText("No Employee Data Change request");
	        this.getView().byId("educationRequestCount").setText("No Education Approval request");
	        this.getView().byId("oldestPending").setVisible(false);
	    }
	    if(ecdCount===0){
	           this.getView().byId("ecdRequestCount").setText("No Employee Data Change request");
	    }
	    if(educationCount===0){
	         this.getView().byId("educationRequestCount").setText("No Education Approval request");
	    }
	   
 	}
});    