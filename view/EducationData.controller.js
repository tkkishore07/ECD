$.sap.require("sap.m.MessageBox");
sap.ui.controller("HR.view.EducationData", {
    count: 0,
    statusReport: false,
    fragments: [],
    onInit: function (evt) {
        this._router = sap.ui.core.UIComponent.getRouterFor(this);
        this._router.getRoute("EducationData").attachPatternMatched(this._routePatternMatched, this);
        if(!sap.ui.Device.system.phone && !this.statusReport)this.getOwnerComponent().getTargets().display("ApprovalsMaster"); 
    },
    back: function(evt){
        if(!this.statusReport) this.showApprovals(this);
        else this._router.navTo("StatusReport",{flag:true});
	},
    _routePatternMatched: function(evt){ 
        this.setProperties();
        this.workItem = HR.util.Formatter.getPernr(evt.getParameters().arguments.ID);
        if(evt.getParameters().arguments.statusReport!==undefined ) this.statusReport = true;
        else this.statusReport = false;
        if(this.statusReport){
            this.getView().byId("approve").setVisible(false);
            this.getView().byId("reject").setVisible(false);
            this.getView().byId("ok").setVisible(true);
        }else{
            this.getView().byId("approve").setVisible(true);
            this.getView().byId("reject").setVisible(true);
            this.getView().byId("ok").setVisible(false);
        }    
        var that = this;
        var jsonModel = new sap.ui.model.json.JSONModel();
        var loadForm= function(data){
            jsonModel.setData(data);
            that.getView().byId("header").setModel(jsonModel);  
            sap.ui.getCore().setModel(jsonModel, "headerDetails")
            if(data.d.Begda1!==null && data.d.Endda1!==null){
               that.showDetailsFragment(jsonModel) ;   
            }
        }
        HR.util.Busy.setBusyOn(true);
        $.getJSON(HR.i18n.URL.MyApproval.getEducationApprovals(this.workItem), function (data) {
            loadForm(data, that);		    
          	HR.util.Busy.setBusyOff();
    	}).error(function(err) { 
    		HR.util.Busy.setBusyOff();
    		that._router._myNavBack();
            sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
    	});
    	 if(!sap.ui.Device.system.phone && !this.statusReport) this.getOwnerComponent().getTargets().display("ApprovalsMaster"); 
    },
    setHeader: function(model){
        this.getView().byId("header").setModel(model); 
    },
    setProperties: function(){
       this.workItem = "";
       this.employeeId = "";
       this.limit = 5;// to track the data edited by the user
    },
    
    //When the page opens, show the education details already added by the user
    showDetailsFragment : function (jsonModel) {
            var data = HR.util.Formatter.changeStructure(jsonModel.getData(),this.limit,"tabular");
            var educationDetails = new sap.ui.model.json.JSONModel();
            educationDetails.setData(data);
            sap.ui.getCore().setModel(educationDetails,"educationDetails");
            var results = data.d.results;
            var oPage = this.getView().byId("educationForm");
            if(this._valueHelp){
                oPage.destroyItems();
            } 
            for(var count=0; count<data.d.results.length; count++){
    			        var fragmentId = "EducationData"+count; // assigning dynamic id to shown details fragment
    			        this._valueHelp = sap.ui.xmlfragment(fragmentId,"HR.view.Dialog.EducationDetails",this );
            		    this._valueHelp.setModel(sap.ui.getCore().getModel("educationDetails"));
            		    oPage.addItem(this._valueHelp);
            		    // Binding the data which need to be shown on the screen
            		    sap.ui.core.Fragment.byId(fragmentId, "institute").bindProperty("title",{parts: [
            		                                                                                  {path: "/d/results/"+count+"/institution"},
            		                                                                                  {path: "/d/results/"+count+"/country"}
            		                                                                             ],
            		                                                                            formatter: HR.util.Formatter.concatData,
            		                                                                        });
            		    sap.ui.core.Fragment.byId(fragmentId, "degree").bindProperty("text",{   parts: [
                                                                                                        {path:"/d/results/"+count+"/degree"},
                                                                                                        {path:"/d/results/"+count+"/startDate"},
                                                                                                        {path:"/d/results/"+count+"/endDate"}
                                                                                                      ],
                                                                                                      formatter: HR.util.Formatter.concatData,
                                                                                                });
                    	sap.ui.core.Fragment.byId(fragmentId, "majors").bindProperty("text",{   parts: [
                                                                                                        {path:"/d/results/"+count+"/major1"},
                                                                                                        {path:"/d/results/"+count+"/major2"}
                                                                                                      ],
                                                                                                      formatter: HR.util.Formatter.concatData,
                                                                                                });
                        //If the app is opened on mobile devices                                                                     
                        if(sap.ui.Device.system.phone) {
                            sap.ui.core.Fragment.byId(fragmentId, "col1").setWidth("80%");
                            sap.ui.core.Fragment.byId(fragmentId, "col2").setWidth("10%");
                            sap.ui.core.Fragment.byId(fragmentId, "col3").setWidth("10%");
                           
                        }
    		}
            
            /*else
            {
                for(var count=0; count<data.d.results.length; count++){
                    var fragmentId = "ViewProfile"+count;
                    var results = data.d.results[count];
                    sap.ui.core.Fragment.byId(fragmentId, "institute").setTitle(HR.util.Formatter.concatData(results.institution,results.country));
                    sap.ui.core.Fragment.byId(fragmentId, "degree").setText(HR.util.Formatter.concatData(results.degree,results.startDate,results.endDate));
                    sap.ui.core.Fragment.byId(fragmentId, "majors").setText(HR.util.Formatter.concatData(results.major1,results.major2));
                }

            }*/
	},
    
    getCode: function(field,description){
        var results,code;
        if(field=="degree"){
            if(sap.ui.getCore().getModel("degreeDetails")==undefined){
                this.getDegreeDetails();
            }
            results = sap.ui.getCore().getModel("degreeDetails").getData().d.results;
            for(var count=0; count<results.length; count++){
                if(description==results[count].Stext){
                   code = results[count].Slabs;
                }
            }
        }
        else if(field=="major"){
            if(sap.ui.getCore().getModel("majorDetails")==undefined){
                 this.getMajors();
            }
            results = sap.ui.getCore().getModel("majorDetails").getData().d.results;
            for(var count=0; count<results.length; count++){
                if(description==results[count].Ftext){
                    code = results[count].Faart;
                }
            }
        }
        else if(field=="country"){
            if(sap.ui.getCore().getModel("countries")==undefined){
                 this.getCountries();
            }
            results = sap.ui.getCore().getModel("countries").getData().d.results;
            for(var count=0; count<results.length; count++){
                if(description==results[count].Landx){
                    code = results[count].Land1;
                }
            }
        }
        if(code==undefined){
            code="";
        }
        return code;
    },
    //On click of submit
    showApprovals: function(that, workItemID){
	    var oModelApprovalList = sap.ui.getCore().getModel("ApprovalList");
	    var finalData={"d":{"results":[]}};
	    for(var i=0; i < oModelApprovalList.getData().d.results.length; i++){  
            if(HR.util.Formatter.getPernr(oModelApprovalList.getData().d.results[i].WiID) != workItemID) finalData.d.results.push(oModelApprovalList.getData().d.results[i]);
          }
        oModelApprovalList.setData(finalData);
        oModelApprovalList.refresh(true);
	    if(!sap.ui.Device.system.phone) that._router.navTo("ApprovalsMaster",{ECDID:workItemID});
	    else that._router.navTo("ApprovalsMasterMobile");
	},
	
	update: function(str, successFn, that ) {
        parameters = {};
        parameters.WiID = that.workItem;
        parameters.Event = str;
        parameters.Pernr = sap.ui.getCore().getModel("headerDetails").getData().d.Pernr;
        parameters.HrasrCurrentNote = sap.ui.getCore().byId("CommentsId").getValue();
        HR.util.General.ajaxWrite(HR.i18n.URL.EducationData.approveOrReject.entity, HR.i18n.URL.EducationData.approveOrReject.link(that.workItem),parameters, successFn, that,"PUT");
    },
	
	getLayout: function(text){
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: text}));
        var textArea = new sap.m.TextArea({id:"CommentsId", text:"", cols:45, required:true});
        if(text.indexOf("Reject")>-1){
            textArea.setPlaceholder("Mandatory");
        }
        oLayout.addContent(textArea); 
        return oLayout;
	},
    onApprove: function(oEvent) {
        var that = this;
        var successFn = function(data){ // Success callback function in case odata service for processing approval request is successfully executed
            that.showApprovals(that, HR.util.Formatter.getPernr(that.workItem));
            sap.m.MessageToast.show(HR.i18n.Messages.MyApprovals.approveSuccess, {closeOnBrowserNavigation: false});
        };
        sap.m.MessageBox.show(this.getLayout(HR.i18n.Messages.MyApprovals.approveRequest),sap.m.MessageBox.Icon.NONE, "Approve", [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            function(oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                   that.update("APPROVE",successFn, that);
                }
            },"approveDialog");
        HR.util.PopupDrag.draggable("approveDialog");    
    },
    onReject: function(oEvent) {
        var that = this;
        var successFn = function(data){// Success callback function in case odata service for processing rejection request is successfully executed
            that.showApprovals(that, HR.util.Formatter.getPernr(that.workItem));
            oTextAreaDialog.close();
            sap.m.MessageToast.show(HR.i18n.Messages.MyApprovals.rejectSuccess, {closeOnBrowserNavigation: false});
        };
        var oLayout = this.getLayout(HR.i18n.Messages.MyApprovals.rejectRequest);
        oLayout.addContent(new sap.m.ObjectStatus({state:"Error", id:"rejectCommentsRequired", text: HR.i18n.Messages.MyApprovals.commentsRequired}));
        var oTextAreaDialog = new sap.m.Dialog({
                id: "rejectPopUp",
				title: "Reject",
				content: oLayout,
				beginButton:new sap.m.Button({
						text: "Yes",
						type: sap.m.ButtonType.Accept,
						press : function() {
                           if(sap.ui.getCore().byId("CommentsId").getValue()===""){
                               sap.ui.getCore().byId("CommentsId").setValueState("Error");
                               sap.ui.getCore().byId("rejectCommentsRequired").setIcon(sap.ui.core.IconPool.getIconURI("alert"));
                           }    
                           else that.update("REJECT", successFn, that);
						}
				}),
				endButton: new sap.m.Button({
					text: "No",
					type: sap.m.ButtonType.Reject,
					press : function() {
						oTextAreaDialog.close();
					}
				})
		}).attachAfterClose(function(){if(sap.ui.getCore().byId("rejectPopUp")!==undefined)sap.ui.getCore().byId("rejectPopUp").destroy(); });
        oTextAreaDialog.open();
        $("section[id^='rejectPopUp']").css("padding","20px"); // yet to confirm
        HR.util.PopupDrag.draggable("rejectPopUp");
    },
    
    
    
    
   }); 