jQuery.sap.declare("HR.util.StatusReports");
HR.util.StatusReports = {
    
    //Setting default submitted dates
    setDates: function(that){
        var currentDate = HR.util.General.getDate();
        that.byId("submitToDate").setDateValue(currentDate); // To date - Current date
        var minus1month = HR.util.General.getDate(); 
        minus1month.setDate(minus1month.getDate() - 30); 
        that.byId("submitFromDate").setDateValue(minus1month); // From date - one month back
        return {
            toDate: currentDate,
            fromDate: minus1month
        }
    }, 
    fetchSavedData: function(parameters,that){
        $.getJSON(HR.i18n.URL.StatusReports.getECDDetails(parameters.InitDateFrom,parameters.InitDateTo,parameters.EffDateFrom,parameters.EffDateTo,parameters.MngrID,parameters.HrbpID,parameters.Process,parameters.SelfInvolved,parameters.DirectReportee,parameters.Status,parameters.Pernr),function (data) {
                    if(data.d.results.length==0) {
                         that.getView().byId("totalRecordsTable").setVisible(false); // IF data is null hide total records
                         sap.m.MessageToast.show(HR.i18n.Messages.MyRequests.noRequestsFound);
                    } 
                    else{
                        that.getView().byId("totalRecordsTable").setVisible(true); // If data is not null show the total records field
                        that.getView().byId("totalRecords").setText("Total Records: " + data.d.results.length); // Set the length to show total records
                        sap.ui.getCore().getModel("statusReports").setData(data);
                        that.getView().byId("statusReports").setVisible(true);
                        that.getView().byId("statusReports").setModel(sap.ui.getCore().getModel("statusReports"));
                        that.getView().byId("statusReports").bindRows("/d/results");
                    }
    		        HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
    		    }).error(function(err) { 
    		        HR.util.Busy.setBusyOff();
                    sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
    		    });
    },
    
    onDownload: function(parameters){
        var url = HR.i18n.URL.StatusReports.downloadExcel(parameters.InitDateFrom,parameters.InitDateTo,parameters.EffDateFrom,parameters.EffDateTo,parameters.MngrID,parameters.HrbpID,parameters.Process,parameters.SelfInvolved,parameters.DirectReportee,parameters.Status,parameters.Pernr);
        sap.m.URLHelper.redirect(url,false);
    },
    
    setValidState: function(that) {
        HR.util.Control.setValueState("submitFromDate",that,"None");
        HR.util.Control.setValueState("submitToDate",that,"None"); 
        HR.util.Control.setValueState("effectiveFromDate",that,"None");
        HR.util.Control.setValueState("effectiveToDate",that,"None");
    },
    
   
    onReset: function(that){
       that.getView().byId("submitToDate").setValue("");
       that.getView().byId("submitFromDate").setValue("");
       that.getView().byId("effectiveToDate").setValue("");
       that.getView().byId("effectiveFromDate").setValue("");
       that.getView().byId("affectedEmp").setValue("");
       that.getView().byId("manager").setValue("");
       that.getView().byId("HRBP").setValue("");
       that.getView().byId("selfInvolved").setSelected(false);
       that.getView().byId("directReportee").setSelected(false);
       that.getView().byId("processStatus").setSelectedKey("");
       that.getView().byId("processName").setSelectedKey("");
       
    },
    
    //Getting list of managers to populate Manager search pop up
    getManagerDetails : function(sValue){
	   var oModelForManager = new sap.ui.model.json.JSONModel();
	   oModelForManager.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModelForManager.loadData(HR.i18n.URL.StatusReports.getManagerDetails(sValue));
        sap.ui.getCore().setModel(oModelForManager, "managerSearch");
        oModelForManager.attachRequestCompleted(function(){
            HR.util.Busy.setBusyOff();
        });
	},
   
    //Getting list of HRBPs to populate HRBP search pop up
	getHRBPDetails : function(that){
        var oModelForHRBP = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModelForHRBP, "hrbpSearch");
	    HR.util.Busy.setBusyOn(true); //Showing busy indicator before the form is loaded
        $.getJSON(HR.i18n.URL.StatusReports.getHRBPDetails, function (data) {
                oModelForHRBP.setData(data);
                that._valueHelpDialogHRBPSearch.setModel(oModelForHRBP);
                HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
            }).error(function(err) { 
                HR.util.Busy.setBusyOff();
                that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });
	},

    //Getting list of affected employees to populate Affected Emp search pop up
	getAffectedEmpDetails : function(sValue){
	    var oModelForAffectedEmp = new sap.ui.model.json.JSONModel();
	    oModelForAffectedEmp.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModelForAffectedEmp.loadData(HR.i18n.URL.StatusReports.getAffectedEmpDetails(sValue));
        sap.ui.getCore().setModel(oModelForAffectedEmp, "affectedEmployees");
        oModelForAffectedEmp.attachRequestCompleted(function(){
            HR.util.Busy.setBusyOff();
        });
	},
	
	// Getting the values user has entered
    getInputParameters: function(that){
        if(that.getView().byId("affectedEmp").getValue()!==""){
            var data = sap.ui.getCore().getModel("affectedEmployees").getData().d.results;
        }
        that.parameters = {};
       
        //Changing the date format which needs to be sent to backend
        that.parameters.InitDateFrom  = HR.util.Formatter.getDateTimeFormat(that.getView().byId("submitFromDate").getDateValue());
        that.parameters.InitDateTo = HR.util.Formatter.getDateTimeFormat(that.getView().byId("submitToDate").getDateValue());  
        that.parameters.EffDateFrom = HR.util.Formatter.getDateTimeFormat(that.getView().byId("effectiveFromDate").getDateValue());
        that.parameters.EffDateTo =  HR.util.Formatter.getDateTimeFormat(that.getView().byId("effectiveToDate").getDateValue());
       
        // Values entered by the user - need to be displayed if user refreshes the page
        that.parameters.submittedfromValue = that.getView().byId("submitFromDate").getValue();
        that.parameters.submittedtoValue = that.getView().byId("submitToDate").getValue();
        that.parameters.effectivefromValue = that.getView().byId("effectiveFromDate").getValue();
        that.parameters.effectivetoValue = that.getView().byId("effectiveToDate").getValue();
        that.parameters.affectedEmp = that.getView().byId("affectedEmp").getValue();
        that.parameters.manager = that.getView().byId("manager").getValue();
        that.parameters.hrbp = that.getView().byId("HRBP").getValue();
        
       // this.parameters.Pernr= HR.util.Formatter.getEmployeeId(this.getView().byId("affectedEmp").getValue());  
        if(data){
        for(var count=0; count<data.length; count++){
              // matching employee id of Affected employee
                if(data[count].PersonID== HR.util.Formatter.getEmployeeId(that.getView().byId("affectedEmp").getValue())){
                     that.parameters.Pernr= data[count].Pernr;   // Getting  manager pernr
                     break;
                }
        }
        }
        else{
             that.parameters.Pernr= "";
        }
        that.parameters.MngrID = HR.util.Formatter.getEmployeeId(that.getView().byId("manager").getValue());
        // Getting status which the user has selected
        that.parameters.Status = that.getView().byId("processStatus").getSelectedKey();
        // Getting hrbp id 
        that.parameters.HrbpID = HR.util.Formatter.getEmployeeId(that.getView().byId("HRBP").getValue());
        // Getting the process name selected by user
        that.parameters.Process = that.getView().byId("processName").getSelectedKey();
        
        // Checking if the checbox of self involved is checked or not
            if(that.getView().byId("selfInvolved").getSelected()==true){
                 that.parameters.SelfInvolved="X";
            }
            else{
                 that.parameters.SelfInvolved="";
            }
        // Checking if the checbox of direct Reportee is checked or not
            if(that.getView().byId("directReportee").getSelected()==true){
                 that.parameters.DirectReportee="X";
            }
            else{
                 that.parameters.DirectReportee="";
            }
            //Saving all the parameters in local storage
            oStorage.put("parameters",  that.parameters);   
            return that.parameters;
        
    },
    
    
    getECDDetails: function(parameters,that) {
        if((parameters.InitDateFrom=="0000-00-00T00:00:00") || (parameters.InitDateTo=="0000-00-00T00:00:00") ){  //if Submitted to or from date is empty // If empty disable Search field
            that.getView().byId("search").setEnabled(false);
            if(parameters.InitDateFrom=="0000-00-00T00:00:00"){ 
                that.submittedDateError = HR.i18n.Messages.StatusReport.submittedDatesBlank
                HR.util.Control.setValueState("submitFromDate",that,"Error");
            }
            if (parameters.InitDateTo=="0000-00-00T00:00:00"){
                that.submittedDateError = HR.i18n.Messages.StatusReport.submittedDatesBlank
                HR.util.Control.setValueState("submitToDate",that,"Error");
            }
        }
        else{
            HR.util.Busy.setBusyOn(true);
            // Sending request to backend with all the parameters
            $.getJSON(HR.i18n.URL.StatusReports.getECDDetails(parameters.InitDateFrom,parameters.InitDateTo,parameters.EffDateFrom,parameters.EffDateTo,parameters.MngrID,parameters.HrbpID,parameters.Process,parameters.SelfInvolved,parameters.DirectReportee,parameters.Status,parameters.Pernr), function (data) {
                if(data.d.results.length==0) { // If there is no request found for the input parameters
                     that.getView().byId("DownloadButton").setVisible(false);
                     sap.m.MessageToast.show(HR.i18n.Messages.MyRequests.noRequestsFound); // Show no requests found message
                     that.getView().byId("statusReports").setVisible(false);
                     that.getView().byId("totalRecordsTable").setVisible(false);// hide the table
                } 
                else{ //If requests are found for input parameteres - Set all the requests in the table
                    that.getView().byId("DownloadButton").setVisible(true);
                    that.getView().byId("statusReports").setVisible(true);
                    that.getView().byId("totalRecordsTable").setVisible(true);
                    that.getView().byId("totalRecords").setText("Total Records: " + data.d.results.length);
                    sap.ui.getCore().getModel("statusReports").setData(data);
                    sap.ui.getCore().getModel("statusReports").refresh();
    		        oTable.setModel(sap.ui.getCore().getModel("statusReports")) ;
    		        oTable.bindRows("/d/results");
                }
                
		        HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
		    }).error(function(err) { 
		        HR.util.Busy.setBusyOff();
		        that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
		    });
        }
    },
        // Checking which button needs to be shown/hidden based on the request status
    checkStatus: function(oTable,that){ 
        var role = this.roleCheck();
        //checking if one row gets selected
        if(oTable.getSelectedIndices().length==1){
            that.getView().byId("ShowDetailsButton").setVisible(true);
            
        }
        // if no item is selected
        if (oTable.getSelectedIndices().length==0){
            that.getView().byId("ShowDetailsButton").setVisible(false);
            that.getView().byId("WithdrawButton").setVisible(false); 
            that.getView().byId("ForwardButton").setVisible(false); 
        }
        // if multiple rows gets selected
        if(oTable.getSelectedIndices().length > 1){
            that.getView().byId("ShowDetailsButton").setVisible(false); 
        }
        
        //If user is HRAdmin
        if((role==HR.i18n.User.Roles.HRAdmin)&&(oTable.getSelectedIndices().length!==0)){
            that.getView().byId("WithdrawButton").setVisible(true); 
            that.getView().byId("ForwardButton").setVisible(true); 
        }
    },

    roleCheck: function(){
        var role = HR.i18n.User.Roles.find();
        //var role = ["HRADMIN","ZHRIS"]; // test data for ZHRAdmin role
        if(role.length>1){ //If logged in user has more than one role
            for(var count=0; count<role.length;count++){
                if(role[count]===HR.i18n.User.Roles.HRAdmin){ // if role is HRADMIN 
                    return HR.i18n.User.Roles.HRAdmin;
                }
            }
            return role[0]; // If user doesn't have HRAdmin role
        }
        else if(role.length===1){   // if user has only one role
                    return role[0];
        }
    },
    
     //Compare the values of To and From date fields
    compareDates: function(toDate,fromDate,controlId,that){
            if(fromDate>toDate){ // If from date is greater than to date
                that.getView().byId("search").setEnabled(false);
                // If submitted date fields  are getting compared
                if(controlId.indexOf("submit")>-1){
                    HR.util.Control.setValueState("submitFromDate",that,"Error");
                    HR.util.Control.setValueState("submitToDate",that,"Error");
                    that.submittedDateError = HR.i18n.Messages.MyRequests.invalidDate;
                }
                else{   // If effective date fields  are getting compared
                    HR.util.Control.setValueState("effectiveFromDate",that,"Error");
                    HR.util.Control.setValueState("effectiveToDate",that,"Error");
                    that.effectiveDateError = HR.i18n.Messages.MyRequests.invalidDate;
                }
                      
            }
            else{ // If to date is greater than from date
                that.getView().byId("search").setEnabled(true);
                if(controlId.indexOf("submit")>-1){
                    HR.util.Control.setValueState("submitFromDate",that,"None");
                    HR.util.Control.setValueState("submitToDate",that,"None");
                }
                else{
                    HR.util.Control.setValueState("effectiveFromDate",that,"None");
                    HR.util.Control.setValueState("effectiveToDate",that,"None");
                }
            }
    }
    
   
};