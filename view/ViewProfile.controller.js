$.sap.require("sap.m.MessageBox");
sap.ui.controller("HR.view.ViewProfile", {
    onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
        this._router.getRoute("ViewProfile").attachPatternMatched(this._routePatternMatched, this);
       
	},
	_routePatternMatched: function(evt){  
	    var oModel = new sap.ui.model.json.JSONModel();
    	i18nModel = sap.ui.getCore().getModel("i18n");
    	sap.ui.core.Core().setModel(oModel, "profileDetails"); 
    	this.setProperties(evt);
    	var that=this;
        var employeeID = HR.util.Formatter.getPernr(evt.getParameter("arguments").ID);
    	this.employeeId = employeeID;
    	var loadForm = function(data, that){
    	        that.openPanel(that, "organizationAssignment", false);
    		    that.openPanel(that, "location", false);
    		    that.openPanel(that, "jobInfo", false);
    		    that.openPanel(that, "payInfo", false);
    		    that.openPanel(that, "contractInfo", false);
    		    that.openPanel(that, "performanceInfo", false);
    	        oModel.setData(data);
                that.getView().setModel(oModel);
                that.getJobDetails(employeeID); 
                // that.bindLocalTime(data.d.LocalTime,that.getView().byId("header"),that);
    	    };
    	HR.util.Busy.setBusyOn(true); 
    	$.getJSON(HR.i18n.URL.ViewProfile.getProfileDetails(employeeID) , function (data) {
            loadForm(data, that);		    
    		        //return data;//Hiding busy indicator after the form is loaded
    	}).error(function(err) { 
    		HR.util.Busy.setBusyOff();
    		that._router._myNavBack();
            sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
    	});
    	//	this.roleCheck();
            this.onTabSelect();
            this.hideButtons();
    },
    bindLocalTime: function(timezone,id,that) {
        var newTime  = HR.util.Formatter.getTimezone(timezone); 
        id.setProperty("localTime",newTime) ;
            /* var setScopedInterval = function(func, millis, scope) {
                return setInterval(function () {
                    func.apply(scope);
                }, millis);
            }
            var timeout =  setScopedInterval(that.bindLocalTime,1000,that);*/
           // console.log(timeout);
           
        
    },
    getJobDetails: function(employeeID) {
        var that = this;
        var jobModel = new sap.ui.model.json.JSONModel();
        var loadForm = function(data, that){
            
            if(data.d.results.length!==0){
                that.getView().byId("jobInfo").setVisible(true);
                that.hideColumns(data.d.results.length,"job"); 
                //Get formatted Data
                var formattedData = HR.util.Formatter.getJsonFormat(data);
                //Adding titles to the records gng be displayed on screen
                for(var count=0; count<formattedData.d.results.length; count++){
                        var obj = formattedData.d.results[count];
                        switch(obj.key)
                        {
                            case "JobCode": obj.title = "Job Code";  break;
                            case "JobTitle": obj.title = "Job Title"; break;
                            case "PosTitle": obj.title = "Position Title"; break;
                            case "JobLevel": obj.title = "Job Level";
                                if(obj['effectDate0']!==undefined && obj['effectDate0']!=="" ){
                                    obj['effectDate0'] = data.d.results[0]['JobLevelDescr']; 
                                }
                                if(obj['effectDate1']!==undefined  && obj['effectDate1']!=="" ){
                                    obj['effectDate1'] = data.d.results[1]['JobLevelDescr'] 
                                }
                                if(obj['effectDate2']!==undefined  && obj['effectDate2']!=="" ){
                                    obj['effectDate2'] = data.d.results[2]['JobLevelDescr']
                                }   
                                break;
                            case "SignAuth": 
                                obj.title = "Signature Authority";
                                that.showInfo(obj,data,'SignAuth','SignAuthDescr');
                                break;
                            case "EffDate" :
                                obj.title="";
                                that.getEffectiveDate(obj,"job");
                            break;  
                            default: obj.title="";
                        }
                        if(obj.title==""){
                            var index = formattedData.d.results.indexOf(formattedData.d.results[count]);
                            formattedData.d.results.splice(index,1); 
                            count--;
                        } 
                      
                    }
                    
                //Setting data to jobDetails table
                jobModel.setData(formattedData);
                that.getView().byId("jobInfo").setModel(jobModel);
                sap.ui.getCore().setModel(jobModel,"jobDetails");
            }
            else{
                 that.getView().byId("jobInfo").setVisible(false);
            }
            // Populate Pay Details
            if(that.roleCheck()==true){
                 that.getPayDetails(employeeID);
            }
            else
            {
                 HR.util.Busy.setBusyOff();
            }
           
	    };
    	 //HR.util.Busy.setBusyOn(true); 
    	 $.getJSON(HR.i18n.URL.ViewProfile.getJobDetails(employeeID) , function (data) {
    		    loadForm(data, that);
    		   // HR.util.Busy.setBusyOff();
    	}).error(function(err) { 
    		    HR.util.Busy.setBusyOff();
    		    that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
    	});
    },
    
    getPayDetails: function(employeeID){
        this.getView().byId("payInfo").setVisible(true);
        this.getView().byId("performanceInfo").setVisible(true);
        
        var that = this;
        var length= 0;
        var payModel = new sap.ui.model.json.JSONModel();
        var performanceData = { d:{ results:[ ] } };
        var payData = { d:{ results:[ ] } };
        var loadForm = function(results, that){
            if(results.d.results.length!==0){
                that.getView().byId("payInfo").setVisible(true);
                //separating pay and performance records 
                for(var counter=0; counter<results.d.results.length; counter++){
                    if(results.d.results[counter].RecType=="PAY") {
                        payData.d.results.push(results.d.results[counter]);
                    }
                    else{
                        performanceData.d.results.push(results.d.results[counter]);
                    }
                } 
                that.hideColumns(payData.d.results.length,"pay"); 
                //Get formatted data
                var formattedData = HR.util.Formatter.getJsonFormat(payData);
                
                //Adding titles to the records
                for(var count=0; count<formattedData.d.results.length; count++){
                        var obj = formattedData.d.results[count];
                        switch(obj.key)
                        {
                            case "AnnualSal": 
                                obj.title = "Annual Salary"; 
                                that.showInfo(obj,payData,'AnnualSal','Waers');
                                break;
                            case "TargetBonus":
                                obj.title = "Target Bonus %"; 
                                break;
                            case "TargetComm": 
                                obj.title = "Target Commission(Sales Only)";
                                that.showInfo(obj,payData,'TargetComm','Waers');
                                break;
                            case "PayMix": obj.title = "Pay Mix";
                                if(payData.d.results[0]!==undefined && payData.d.results[0].TargetComm==""){
                                    obj['effectDate0'] = 'NA';
                                }
                                if(payData.d.results[1]!==undefined && payData.d.results[1].TargetComm==""){
                                    obj['effectDate1'] = 'NA';
                                }
                                if(payData.d.results[2]!==undefined && payData.d.results[2].TargetComm==""){
                                    obj['effectDate2'] = 'NA';
                                }
                                break;
                            case "Total": 
                                obj.title = "Total Target Comp (TTC)";
                                that.showInfo(obj,payData,'Total','Waers');
                                break;
                            case "MinSalary":  
                                obj.title = "Salary Range";
                                that.showInfo(obj,payData,'MinSalary','MaxSalary','Waers');
                                break;
                            case "MaxSalary":
                                obj.title = "Position in Range";
                                that.calculatePosRange(obj,payData); 
                                break;
                            case "EffDate" :
                                obj.title="";
                                that.getEffectiveDate(obj,"pay");
                            break;   
                            default: obj.title="";
                        }
                        if(obj.title==""){
                            var index = formattedData.d.results.indexOf(formattedData.d.results[count]);
                            formattedData.d.results.splice(index,1); 
                            count--;
                        } 
                      
                    }
                //Setting data to Pay table
                payModel.setData(formattedData);
                that.getView().byId("payInfo").setModel(payModel);
                sap.ui.getCore().setModel(payModel,"payDetails");
                //Populate Performance Details and send all the performance data
            }
            else
            {
                  that.getView().byId("payInfo").setVisible(false);
            }
            that.getPerformanceDetails(performanceData); 
	    };
    	 $.getJSON(HR.i18n.URL.ViewProfile.getPayDetails(employeeID) , function (data) {
    		    loadForm(data, that);		   
    	 }).error(function(err) { 
    		    HR.util.Busy.setBusyOff();
    		    that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
    	});
    },
    getPerformanceDetails: function(data){
        var performanceModel = new sap.ui.model.json.JSONModel();
        //Get formatted Data
        if(data.d.results.length!==0){
            this.getView().byId("performanceInfo").setVisible(true);
            this.hideColumns(data.d.results.length,"performance"); 
            var formattedData = HR.util.Formatter.getJsonFormat(data);
            //Assigning titles to the records
            for(var count=0; count<formattedData.d.results.length; count++){
                var obj = formattedData.d.results[count];
                switch(obj.key)
                {
                    case "Rating": obj.title = "Calibration Tier";  break;
                    case "EffDate" :
                            obj.title="";
                            this.getEffectiveDate(obj,"performance");
                         break;   
                    default: obj.title="";
                }
                if(obj.title==""){
                    var index = formattedData.d.results.indexOf(formattedData.d.results[count]);
                    formattedData.d.results.splice(index,1); 
                    count--;
                } 
                      
            }
            //Setting data to performance table
            performanceModel.setData(formattedData);
            this.getView().byId("performanceInfo").setModel(performanceModel);
            sap.ui.getCore().setModel(performanceModel,"performanceDetails");
        } 
        else {
            this.getView().byId("performanceInfo").setVisible(false);
        }
        
        HR.util.Busy.setBusyOff(); 
       
    },
    showInfo: function(obj,formattedData,value1,value2,value3){
        if(value3!==undefined && value1=='MinSalary'){
            if(obj['effectDate0']!==undefined && obj['effectDate0']!=="" ){
              obj['effectDate0'] = formattedData.d.results[0][value1]+" - "+formattedData.d.results[0][value2]+" "+formattedData.d.results[0][value3]; 
            }
            if(obj['effectDate1']!==undefined  && obj['effectDate1']!=="" ){
                obj['effectDate1'] = formattedData.d.results[1][value1]+" - "+formattedData.d.results[1][value2]+" "+formattedData.d.results[1][value3];
            }
            if(obj['effectDate2']!==undefined  && obj['effectDate2']!=="" ){
                obj['effectDate2'] = formattedData.d.results[2][value1]+" - "+formattedData.d.results[2][value2]+" "+formattedData.d.results[2][value3];
            }
        }
        else{
            if(obj['effectDate0']!==undefined && obj['effectDate0']!=="" ){
              obj['effectDate0'] = formattedData.d.results[0][value1]+" "+formattedData.d.results[0][value2]; 
            }
            if(obj['effectDate1']!==undefined  && obj['effectDate1']!=="" ){
                obj['effectDate1'] = formattedData.d.results[1][value1]+" "+formattedData.d.results[1][value2];
            }
            if(obj['effectDate2']!==undefined  && obj['effectDate2']!=="" ){
                obj['effectDate2'] = formattedData.d.results[2][value1]+" "+formattedData.d.results[2][value2];
            }
        }
        
    },
    calculatePosRange: function(obj, data){
        if(obj.effectDate0!==undefined && obj['effectDate0']!=="" ){
            var effectDate0 =(parseFloat(data.d.results[0]["AnnualSal"].replace(',','')) - parseFloat(data.d.results[0]["MinSalary"].replace(',',''))) / (parseFloat(data.d.results[0]["MaxSalary"].replace(',','')) - parseFloat(data.d.results[0]["MinSalary"].replace(',',''))); 
              obj['effectDate0'] = effectDate0.toFixed(4);
        } 
        if(obj.effectDate1!==undefined && obj['effectDate1']!=="" ){
            var effectDate1 =(parseFloat(data.d.results[1]["AnnualSal"].replace(',','')) - parseFloat(data.d.results[1]["MinSalary"].replace(',',''))) / (parseFloat(data.d.results[1]["MaxSalary"].replace(',','')) - parseFloat(data.d.results[1]["MinSalary"].replace(',',''))); 
              obj['effectDate1'] = effectDate1.toFixed(4);
        } 
        if(obj.effectDate2!==undefined && obj['effectDate2']!=="" ){
            var effectDate2 =(parseFloat(data.d.results[2]["AnnualSal"].replace(',','')) - parseFloat(data.d.results[2]["MinSalary"].replace(',',''))) / (parseFloat(data.d.results[2]["MaxSalary"].replace(',','')) - parseFloat(data.d.results[2]["MinSalary"].replace(',',''))); 
              obj['effectDate2'] = effectDate2.toFixed(4);
        } 
    },
    getEffectiveDate: function(obj,value){
        if(obj.effectDate0!==undefined){
            var effectiveDate0 = HR.util.Formatter.effectiveDate(obj.effectDate0);
            this.getView().byId("effectiveDate-"+value+"1").setText(effectiveDate0);
        }
        if(obj.effectDate1!==undefined){
            var effectiveDate1 = HR.util.Formatter.effectiveDate(obj.effectDate1);
            this.getView().byId("effectiveDate-"+value+"2").setText(effectiveDate1);
        }
        if(obj.effectDate2!==undefined){
            var effectiveDate2 = HR.util.Formatter.effectiveDate(obj.effectDate2);
            this.getView().byId("effectiveDate-"+value+"3").setText(effectiveDate2);
        }
        
    },
    hideColumns: function(length,value){
        if(length<3){
            if(length===2){
                this.getView().byId("effectiveDate-"+value+"1" ).setVisible(true);
                this.getView().byId("effectiveDate-"+value+"2" ).setVisible(true);
                this.getView().byId("effectiveDate-"+value+"3" ).setVisible(false);
            }
            else if(length===1){
                this.getView().byId("effectiveDate-"+value+"1" ).setVisible(true);
                this.getView().byId("effectiveDate-"+value+"2").setVisible(false);
                this.getView().byId("effectiveDate-"+value+"3").setVisible(false);
            }
            else if(length===0){
                this.getView().byId("effectiveDate-"+value+"1").setVisible(false);
                this.getView().byId("effectiveDate-"+value+"2").setVisible(false);
                this.getView().byId("effectiveDate-"+value+"3").setVisible(false);
            }
        }
        else
        {
            this.getView().byId("effectiveDate-"+value+"1").setVisible(true);
            this.getView().byId("effectiveDate-"+value+"2").setVisible(true);
            this.getView().byId("effectiveDate-"+value+"3").setVisible(true);
        }
    },
    openPanel: function(that, id, value){
        	that.getView().byId(id).setExpandAnimation(false);
        	that.getView().byId(id).setExpanded(value);
        	that.getView().byId(id).setExpandAnimation(true);
    },
    setProperties: function(evt){
        this.employeeId = ""; 
	    this.employeeType = evt.getParameter("arguments").employeeType;
	    this.westValley = evt.getParameter("arguments").employeeRole;
	    this.formName = "EcdHistory";
        this.workItemId = "";
        this.ecdName = "";
        this.ecdId = "";
        this.status = "";
        this.fromDate = "";
        this.toDate = "";
    },
    roleCheck: function(){
        var roles = HR.i18n.User.Roles.find();
        //var roles =["HRADMIN","HRASRB"]
        var loggedUser = (function(){
                                if(roles.length>1){ //If logged in user has more than one role
                                    for(var count=0; count<roles.length;count++){
                                        if(roles[count]===HR.i18n.User.Roles.ExecutiveAdmin){ // if role is HRADMIN 
                                            return HR.i18n.User.Roles.ExecutiveAdmin;
                                        }
                                    }
                                    return roles[0]; // If user doesn't have HRAdmin role
                                    }
                                else if(roles.length===1){   // if user has only one role
                                            return roles[0];
                                }
                        })();
        if(loggedUser===HR.i18n.User.Roles.ExecutiveAdmin){
            return false;
        }
        else
        {
           return true;
        }
    },
    /*roleCheck : function(){
        var roles = HR.i18n.User.Roles.find();
    },*/
    onTabSelect: function(evt){
        if(this.getView().byId("tabs").getSelectedKey().indexOf('profile')>-1){
            this.hideButtons();
        }
        else if(this.getView().byId("tabs").getSelectedKey().indexOf('history')>-1){
            this.populateHistoryDetails();
        }
    },
    getMessageBoxLayout: function(message){
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: message }));
        oLayout.addContent(new sap.m.Label({text: ""}));
        return  oLayout;   
    },
    checkStatus: function(status){
        status = status.toLowerCase();
        
       //To display/hide footer buttons based on status
        if(status.indexOf("rejected") > -1){
            this.getView().byId("WithdrawButton").setVisible(false); 
            this.getView().byId("DiscardButton").setVisible(false);
            this.getView().byId("OpenButton").setVisible(false);
            this.getView().byId("CopyButton").setVisible(true);
        } 
       
        else if(status.indexOf("started approval pending") > -1){
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("DiscardButton").setVisible(false);
            this.getView().byId("OpenButton").setVisible(false); 
            this.getView().byId("WithdrawButton").setVisible(true); 
        }
       
        else if(status=='draft'){
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("WithdrawButton").setVisible(false); 
            this.getView().byId("DiscardButton").setVisible(true);
            this.getView().byId("OpenButton").setVisible(true); 
        }
        else
        {
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("WithdrawButton").setVisible(false) ; 
            this.getView().byId("DiscardButton").setVisible(false) ;
            this.getView().byId("OpenButton").setVisible(false); 
        }
      
    },
    hideButtons: function(){
    		this.getView().byId("ecdButton").setVisible(true);
            this.getView().byId("contractButton").setVisible(true);
            this.getView().byId("terminateButton").setVisible(true);
            
              //Hiding History Buttons
            this.getView().byId("CopyButton").setVisible(false);
            this.getView().byId("WithdrawButton").setVisible(false) ; 
            this.getView().byId("DiscardButton").setVisible(false) ;
            this.getView().byId("OpenButton").setVisible(false); 
            this.getView().byId("DetailsButton").setVisible(false);
             //Checking employee type to hide inappropriate buttons
        
            var initiatorRole = HR.i18n.User.Roles.find(this.employeeId);
            if((HR.util.FormAccess.EmployeeDataChange(initiatorRole, this.employeeType, this.westValley)!==true)){
                this.getView().byId("ecdButton").setVisible(false);
            }
            if(HR.util.FormAccess.Termination.noPermissionToAccess(initiatorRole) ||
                !HR.util.FormAccess.Termination.onlyWestValley(initiatorRole,this.employeeType, this.westValley)){
                this.getView().byId("terminateButton").setVisible(false);
            }
            if(!HR.util.FormAccess.ContractInternExtension.onlyContractorsInterns(initiatorRole,this.employeeType,this.westValley)
             || !HR.util.FormAccess.ContractInternExtension.onlyWestValley(initiatorRole,this.employeeType, this.westValley)){
                this.getView().byId("contractButton").setVisible(false);
                this.getView().byId("contractInfo").setVisible(false); 
            }
            else
            {
                  this.getView().byId("contractInfo").setVisible(true); 
            }
           
    },
    checkScreenHeight: function(data){
        if(screen.height<=768){
           this.getView().byId("ecdHistory").setVisibleRowCount(5);
            if(data.d.results.length<=5){
               this.getView().byId("ecdHistory").setNavigationMode(sap.ui.table.NavigationMode.None);
            } 
            else
            {
                 this.getView().byId("ecdHistory").setNavigationMode(sap.ui.table.NavigationMode.Paginator);
            }
        }
        else if(screen.height>768 && screen.height<1024){
            this.getView().byId("ecdHistory").setVisibleRowCount(10);
            if(data.d.results.length<=10){
               this.getView().byId("ecdHistory").setNavigationMode(sap.ui.table.NavigationMode.None);
            } 
            else
            {
                 this.getView().byId("ecdHistory").setNavigationMode(sap.ui.table.NavigationMode.Paginator);
            }
        }
        else if(screen.height>=1024){
            this.getView().byId("ecdHistory").setVisibleRowCount(15);
            if(data.d.results.length<=15){
               this.getView().byId("ecdHistory").setNavigationMode(sap.ui.table.NavigationMode.None);
            } 
            else
            {
                 this.getView().byId("ecdHistory").setNavigationMode(sap.ui.table.NavigationMode.Paginator);
            }
        } 
    },
    populateHistoryDetails: function(){
        
        var that = this;
        var oModel = new sap.ui.model.json.JSONModel();
        this.toDate =  HR.util.Formatter.getDateTimeFormat(HR.util.General.getDate());
        var minus1month = HR.util.General.getDate(); 
        minus1month.setDate(minus1month.getDate() - 60); 
        this.fromDate = HR.util.Formatter.getDateTimeFormat(minus1month);
        var loadHistory = function(data){
            oModel.setData(data);
            that.checkScreenHeight(data); 
            sap.ui.getCore().setModel(oModel,"historyDetails");
            that.getView().byId("ecdHistory").setModel(oModel) ;
            that.getView().byId("ecdHistory").bindRows("/d/results");
            that.getView().byId("ecdButton").setVisible(false);
            that.getView().byId("contractButton").setVisible(false); 
            that.getView().byId("terminateButton").setVisible(false);
            that.getView().byId("ecdHistory").setVisible(true); 
        }
        
        HR.util.Busy.setBusyOn(true); 
    	 $.getJSON(HR.i18n.URL.ViewProfile.getECDHistory(this.fromDate,this.toDate,this.employeeId), function (data) {
    		    loadHistory(data);		    
    		    HR.util.Busy.setBusyOff(); 
    		        //return data;//Hiding busy indicator after the form is loaded
    	 }).error(function(err) { 
    		    HR.util.Busy.setBusyOff();
    		    that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
    	});
    },
    openForm:  function(evt){
        if(evt.getSource().getText()==sap.ui.getCore().getModel("i18n").getResourceBundle().getText("valueForEDCButton")){
            this._router.navTo("EmployeeDataChange",{ID:this.employeeId, status:"new" , workItemId: "0"});
        } 
        else if(evt.getSource().getText()==sap.ui.getCore().getModel("i18n").getResourceBundle().getText("valueForContractorButton")){
            this._router.navTo("ContractInternExtension",{ID:this.employeeId, status:"new" , workItemId: "0" });
        }
        else
        {
            this._router.navTo("Termination",{ID:this.employeeId, status:"new" , workItemId: "0" });
        }
    },
    onLinkPress: function(evt){
            var data = sap.ui.getCore().getModel("historyDetails").getData().d.results;
            var employeeId, workItemId,ecdName,ecdId;
            for (var count=0; count<data.length; count++){
                if(data[count].WiID==evt.getSource().getText()){
                    employeeId = data[count].Pernr;
                    workItemId = data[count].WiID;
                    ecdName= HR.util.Formatter.getECDName(data[count].EcdName);
                    ecdId = data[count].EcdID;
                    break;
                }
            }
            this._router.navTo("Details",{id:employeeId, WorkItemId: workItemId, ECDName:ecdName, formName: this.formName} );
    },
    onRowSelectionChange : function(oEvent){  
        oTable = this.getView().byId("ecdHistory");
        this.getView().byId("DetailsButton").setVisible(true);
        this.contextPath =  oEvent.getParameters().rowContext.sPath;
        this.workItemId = HR.util.Formatter.getPernr(oTable.getModel().getProperty(this.contextPath).WiID);
        this.ecdName = HR.util.Formatter.getECDName(oTable.getModel().getProperty(this.contextPath).EcdName);
        this.employeeId =HR.util.Formatter.getPernr(oTable.getModel().getProperty(this.contextPath).Pernr);
        this.ecdId =  oTable.getModel().getProperty(this.contextPath).EcdID;
        this.status = oTable.getModel().getProperty(this.contextPath).Status;
        this.checkStatus(this.status);
    },
    openDetailsForm: function(evt){
        if(evt.getSource().sId.indexOf("Details")>-1){
             // navigate to details form
            if(this.employeeId){  
                this._router.navTo("Details",{id:this.employeeId, WorkItemId:this.workItemId, ECDName:this.ecdName, formName:this.formName });
            }
        }
        else if(evt.getSource().sId.indexOf("Open")>-1){
            // navigate to savedform
            var path = this.contextPath;
            var status = oTable.getModel().getProperty(path).Status;
            if(status.toLowerCase()=="draft"){
                status="saved";
            }
            if(this.ecdName===i18nModel.getResourceBundle().getText("EDCValue")){
                this._router.navTo("EmployeeDataChange",{ID:this.employeeId, status:status , workItemId: this.workItemId });
            }
            else if(this.ecdName===i18nModel.getResourceBundle().getText("ContractExtensionValue")){
                 this._router.navTo("ContractInternExtension",{ID:this.employeeId, status:status , workItemId: this.workItemId });
            }
            else if(this.ecdName===i18nModel.getResourceBundle().getText("TerminationValue")){
                 this._router.navTo("Termination",{ID:this.employeeId, status:status , workItemId: this.workItemId });
            }
        }
        else if(evt.getSource().sId.indexOf("Copy")>-1){
            //copy the rejected detail
            var status = "copy"
            
            this._router.navTo("EmployeeDataChange",{ID:this.employeeId, status:status, workItemId: this.workItemId});
            
            
        }
        else if(evt.getSource().sId.indexOf("Withdraw")>-1){
            // Withdraw the request
            var that=this;
            var msgBoxTitle = evt.getSource().getText();
            var successFn = function(data){
            var oLayout = new sap.ui.layout.VerticalLayout();
    		oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.MyRequests.requestWithdrawn}));
    		sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success",sap.m.MessageBox.Action.Ok,
    		            function(oAction) {
                            if (oAction === sap.m.MessageBox.Action.YES) {
    	                        that.populateHistoryDetails();
    	                        
                             }
    		            });   
    		 }
            this.go(successFn,msgBoxTitle, HR.i18n.Messages.MyRequests.withdraw,this); 
        } 
        else if(evt.getSource().sId.indexOf("Discard")>-1) 
        {
            //Discard draft
             var msgBoxTitle = evt.getSource().getText();
             var successFn = function(data){
         
            		var oLayout = new sap.ui.layout.VerticalLayout();
            		oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.MyRequests.draftDiscarded}));
            		sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.SUCCESS, "Success");
    		
                };
            this.go(successFn,msgBoxTitle, HR.i18n.Messages.MyRequests.discardDraft,this); 
        }
        
    },
    go: function(successFn, msgBoxTitle, msgBoxMsg,that){
       var workItemId = this.workItemId;
        var withdrawOrDiscard= function(wiID,event){
            parameters = {};
            parameters.WiID = wiID;
            parameters.Event = event;
            HR.util.General.ajaxWrite(HR.i18n.URL.MyRequests.onWithdrawOrDiscard.entity,HR.i18n.URL.MyRequests.onWithdrawOrDiscard.link(workItemId,event),parameters, successFn, this,"PUT");
        };
        
        if(msgBoxTitle=="Withdraw" || msgBoxTitle=="Discard Draft") { 
            var oLayout = this.getMessageBoxLayout(msgBoxMsg);
            var event; 
            // to show a confirmation message to user if he really wants to withdraw or discard the request
            sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.NONE,
                    msgBoxTitle, [ sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    function(oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) { // If user clicks yes
                            if(msgBoxTitle=="Withdraw"){
                                event = "WITHDRAW"
                            } 
                            else if(msgBoxTitle.indexOf("Draft") > -1){
                                event = "DEL_DRAFT"
                            } 
                           withdrawOrDiscard(workItemId,event);
                        }
                    },"confirmDialog");
            HR.util.PopupDrag.draggable("confirmDialog");
        }
        
    },
    
    
    
});