$.sap.require("sap.m.MessageBox");
sap.ui.controller("HR.view.EmployeeDataChange", {
    onInit : function (evt) {
	    this._router = sap.ui.core.UIComponent.getRouterFor(this);
	    this._router.getRoute("EmployeeDataChange").attachPatternMatched(this._routePatternMatched, this);
	    this.getOfficeLocations();
	    this.getJobGroup();
	    this.getJobTrack();//Job Track controller
	    this.getJobFamily();//Job Family controller
	},
	setProperties: function(){
	        this.changes= {};
            this.parameters= ""; 
            this.status= "";
            this.WiID= "";
            this.employeeType= "";
            this.SalesEmpNew= "";
            this.isEmployee= false;
            this.employeeLevel ="";
            this.jobType= "";
            this.currencyDecimal="";
            this.partTimeEmployee=false;
            this.managerPernrNew="";
            this.managerPernrForLeader="";
            this.costCenters_profitCenter_forValidation="";
            this.salesEmp = "";
            this.effdate = "";
            that=this;
	},
	getManagerPernrForLeader: function(){
	    if(this.managerPernrNew==""){ 
	        this.managerPernrForLeader=HR.util.Formatter.getPernr(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/ManagerIDCurr"));
	    }
	    else {
	        this.managerPernrForLeader=this.managerPernrNew;
	    }   
	    return this.managerPernrForLeader;
	},
	getManagerProfitCenter: function(str){
	    var json = (new sap.ui.getCore().getModel("managerProfitCenter").getData()).d.results;
	    var assignedProfitCenter="";
	    var ownedProfitCenters=[];
        $.each(json, function(i, item) {
            ownedProfitCenters.push(item.Prctr);
            if(item.AssignPrctr==="X") assignedProfitCenter=item.Prctr;
        });
	    if(str==="Assigned") {return assignedProfitCenter;}
	    else if(str==="Owned") return ownedProfitCenters; 
	},
	getManagerDetails : function(sValue){
	    var effdate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("effectiveDate").getDateValue());
	    var oModelForManager = new sap.ui.model.json.JSONModel();

	    sap.ui.getCore().setModel(oModelForManager, "managerSearch");
	    oModelForManager.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModelForManager.loadData(HR.i18n.URL.EmployeeDataChange.getManager(sValue,effdate));
        oModelForManager.attachRequestCompleted(function(){
            HR.util.Busy.setBusyOff();

        });
        
	},
	getLeaderDetails : function(managerId,that){
	    var oModelForLeader = new sap.ui.model.json.JSONModel();
	    HR.util.Busy.setBusyOn(true); //Showing busy indicator before the form is loaded
        $.getJSON( HR.i18n.URL.EmployeeDataChange.getLeader(this.getManagerPernrForLeader()), function (data) {
                oModelForLeader.setData(data);
                sap.ui.getCore().setModel(oModelForLeader, "leaderSearch");
                that._valueHelpDialogLeaderSearch.setModel(oModelForLeader);
                HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
            }).error(function(err) { 
                HR.util.Busy.setBusyOff();
                that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });
	},
	
	getOldManagerLeaders: function(managerId){
	    var oModelOldManager =  new sap.ui.model.json.JSONModel();
	    oModelOldManager.loadData(HR.i18n.URL.EmployeeDataChange.getLeader(managerId));
	    sap.ui.getCore().setModel(oModelOldManager, "oldManagerLeaders");
	},
	getCostCenter: function(Bukrs, Prctr, Kostl){
	    var effdate = HR.util.Formatter.getDateTimeFormat(this.getView().byId("effectiveDate").getDateValue());
	    this.costCenters_profitCenter_forValidation=Prctr;
	    var oModel = new sap.ui.model.json.JSONModel();
    	sap.ui.getCore().setModel(oModel, "costCenter");
    	if(Kostl===""|| Kostl===undefined) Kostl=" ";
    	oModel.loadData(HR.i18n.URL.EmployeeDataChange.getCostCenter(Bukrs, Prctr, Kostl,effdate));  
    	oModel.attachRequestSent(function(){
	        HR.util.Busy.setBusyOn(true);
        });
        oModel.attachRequestCompleted(function(){
            HR.util.Busy.setBusyOff();
        });
	},
	getOfficeLocations: function(){
	    var oModel = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModel, "officeLocations");
	    $.ajax({
            url: HR.i18n.URL.EmployeeDataChange.getOfficeLocations, 
            dataType: "json",
            async: false,
            success: function(data, textStatus, jqXHR) {
                oModel.setData(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                sap.m.MessageToast.show(HR.i18n.Messages.EmployeeDataChange.errorOfficeLocations, {closeOnBrowserNavigation: false});
            }
        });
	},
	getProfitCenter: function(I0001Bukrs){
	    var oModel = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModel, "profitCenter");
	    var finalData={"d":{"results":[{"ProfitCenter":"","PrctrText":""}]}};//push an empty for the 0th index/default value
	        $.ajax({
            url: HR.i18n.URL.EmployeeDataChange.getProfitCenter(I0001Bukrs),
            dataType: "json",
            async: false,
            success: function(data, textStatus) {
                    for (index = 0; index < data.d.results.length; index++)
                            finalData.d.results.push(data.d.results[index]);
                    oModel.setData(finalData);  
            },
            error: function(jqXHR, textStatus, errorThrown) {
                sap.m.MessageToast.show("Error fetching Profit Center") ;
            }
        });
	}, 
	getJobGroup: function(){
	    var oModel = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModel, "jobGroup");
	    
	    var finalData={"d":{"results":[{"Ltext":"","Cjobgrp":""}]}};//push an empty for the 0th index/default value
	       //Ltext Cjobgrp, Ltext
	        $.ajax({
            url: HR.i18n.URL.EmployeeDataChange.getJobGroup,
            dataType: "json",
            async: false,
            success: function(data, textStatus) {
                    for (index = 0; index < data.d.results.length; index++)
                            finalData.d.results.push(data.d.results[index]);
                    oModel.setData(finalData);  
            },
            error: function(jqXHR, textStatus, errorThrown) {
                sap.m.MessageToast.show("Error fetching Job Groups") ;
            }
        });
	},
	//Get Job Track function
		getJobTrack: function(){
	    var oModel = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModel, "JobTrack");
	    var finalData={"d":{"results":[{"Ltext":"","Jcode":""}]}};//push an empty for the 0th index/default value
	       //Ltext Jcode, Ltext
	        $.ajax({
            url: HR.i18n.URL.EmployeeDataChange.getJobTrack,
            dataType: "json",
            async: false,
            success: function(data, textStatus) {
                    for (index = 0; index < data.d.results.length; index++)
                            finalData.d.results.push(data.d.results[index]);
                  oModel.setData(finalData);  
            },
            error: function(jqXHR, textStatus, errorThrown) {
                sap.m.MessageToast.show("Error fetching Job Tracks") ;
            }
        });
	},
    //Get Job Family function
		getJobFamily: function(){
	    var oModel = new sap.ui.model.json.JSONModel();
	    sap.ui.getCore().setModel(oModel, "JobFamily");
	    var finalData={"d":{"results":[{"Ltext":"","Evgrd":""}]}};//push an empty for the 0th index/default value
	       //Ltext Evgrd, Ltext
	        $.ajax({
            url: HR.i18n.URL.EmployeeDataChange.getJobFamily,
            dataType: "json",
            async: false,
            success: function(data, textStatus) {
                    for (index = 0; index < data.d.results.length; index++)
                            finalData.d.results.push(data.d.results[index]);
                  oModel.setData(finalData);  
            },
            error: function(jqXHR, textStatus, errorThrown) {
                sap.m.MessageToast.show("Error fetching Job Family") ;
            }
        });
	},
	loadOfficeLocations: function(I0001Werks, that){
	    var data = jQuery.extend(true, {}, new sap.ui.core.Core().getModel("officeLocations").getData()); //deep copy
        var data_location = $.grep(data.d.results, function(element, index){
              return element.Persa===I0001Werks;
        });
        data.d.results=data_location;
        data.d.results.splice(0, 0, {"Btrtl":"","Btext":"", "RemoFlag": "", "Persa": ""}); 
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData(data); 
        that.getView().byId("officeLocation").setModel(oModel); 
	 },
	 
	 showTargetCommission: function(that, SalesEmp, curr){ 
	    this.salesEmp = SalesEmp;
	    var showTargetCommission = that.isEmployee && HR.i18n.User.isSalesRelated(SalesEmp) && !that.partTimeEmployee;
	    HR.util.Control.cancel("targetCommission", this);
	    that.getView().byId("targetCommission-edit").setVisible(showTargetCommission);
	    if(curr) that.getView().byId("targetCommission-old").setVisible(showTargetCommission);
	 },
	 
	 showRsu: function(that, I1010Hilfm, curr){
	    var showRsu = this.isEmployee && HR.i18n.User.isRsuApplicable(I1010Hilfm);
	    HR.util.Control.cancel("rsu", this);
	    that.getView().byId("rsu-edit").setVisible(showRsu);
	    if(curr) that.getView().byId("rsu-old").setVisible(showRsu);
	 },
	 
	 showStockOption: function(that, I1010Hilfm, curr){
        var showStockOption = this.isEmployee && HR.i18n.User.isVpOrAbove(I1010Hilfm);
	    HR.util.Control.cancel("stockOption", this);
	    that.getView().byId("stockOption-edit").setVisible(showStockOption);
	    if(curr) that.getView().byId("stockOption-old").setVisible(showStockOption);
	 },
	 roleCheck: function(employeeID, data){ 
        var role = HR.i18n.User.Roles.find(employeeID);
        if(!HR.util.FormAccess.EmployeeDataChange(role, this.employeeType, data.d.I0016Kontx)){
                this._router._myNavBack();
                sap.m.MessageToast.show(HR.i18n.Messages.EmployeeDataChange.notAuthorized, {closeOnBrowserNavigation: false});
        }
        this.getView().byId("sdssSdsmOnly").setVisible(HR.i18n.User.Locations.isSdssSdsm(data.d.I0001BtrtlCurr) && data.d.I0001Persg!==HR.i18n.User.Roles.BatchOnly);
        
        this.isEmployee = (this.employeeType===HR.i18n.User.Roles.Employee);
        this.partTimeEmployee=HR.i18n.User.isPartTimeEmployee(data.d.PartTimeEmp);
        this.getView().byId("pay").setVisible(role !==HR.i18n.User.Roles.ExecutiveAdmin && (this.isEmployee || this.employeeType===HR.i18n.User.Roles.ProvisionalWorker|| (this.employeeType===HR.i18n.User.Roles.Intern && data.d.I0001Persk===HR.i18n.User.Roles.PaidIntern )));
        this.getView().byId("becomingAPeopleManager-section").setVisible(data.d.I0001Persg===HR.i18n.User.Roles.Employee);
	    this.getView().byId("becomingAPeopleManager-edit").setVisible(data.d.PeopleMngrCurr!=="X");
	    this.getView().byId("officeLocation-edit").setVisible(data.d.I0001Persg===HR.i18n.User.Roles.Employee || data.d.I0001Persg===HR.i18n.User.Roles.Intern);
        this.getView().byId("jobCode-edit").setVisible((data.d.I0001Persg===HR.i18n.User.Roles.Employee || data.d.I0001Persg===HR.i18n.User.Roles.ProvisionalWorker) &&role !==HR.i18n.User.Roles.ExecutiveAdmin) ;
        this.getView().byId("positionTitle-edit").setVisible(data.d.I0001Persg===HR.i18n.User.Roles.Employee || data.d.I0001Persg===HR.i18n.User.Roles.Intern || data.d.I0001Persg===HR.i18n.User.Roles.ProvisionalWorker);
        this.showTargetCommission(this, data.d.SalesEmp, true);
        this.showRsu(this, data.d.I1010HilfmCurr, true);
        this.showStockOption(this, data.d.I1010HilfmCurr, true);
        
        this.getView().byId("leader-edit").setVisible(role===HR.i18n.User.Roles.HRIS ||  role===HR.i18n.User.Roles.Manager);
    },
    openPanel: function(that, id, value){
        	that.getView().byId(id).setExpandAnimation(false);
        	that.getView().byId(id).setExpanded(value);
        	that.getView().byId(id).setExpandAnimation(true);
    },
	_routePatternMatched: function(oEvent) {
		this.clearForm();
	    this.hide();
	    this.setProperties();
	    
	    //Blank model to display blank screens in Manager search
	    var oModelBlank = new sap.ui.model.json.JSONModel();
	    sap.ui.core.Core().setModel(oModelBlank, "blankModel") ;
	    
	    var oModel = new sap.ui.model.json.JSONModel();
	    this.status=oEvent.getParameter("arguments").status;
	    this.employeeId = oEvent.getParameter("arguments").ID;
	    
	    var that=this;	  
	    var loadForm = function(data, that){
	        oModel.setData(data);
		    sap.ui.getCore().setModel(oModel, "employeeDataChange");
	        that.employeeType=data.d.I0001Persg;
	        that.roleCheck(data.d.Pernr, data);
	        that.loadOfficeLocations(data.d.I0001Werks, that);
	        that.WiID=data.d.WiID;
	        that.getProfitCenter(data.d.I0001Bukrs); //based on company code
	        that.afterManagerSelection(that, data.d.ManagerIDCurr);
            HR.util.Control.setValue("effectiveDate", that, data.d.EffectiveDate);
            that.getView().setModel(oModel);
		    that.currencyDecimal= HR.util.General.hasDecimal(data.d.CurrAnsal);
		    that.managerPernrNew=data.d.ManagerIDNew;
		    that.initialEffectiveDate =  HR.util.Control.getValue("effectiveDate",that) ;
	    };
	    if(this.status === "new"){
	        var employeeID = oEvent.getParameter("arguments").ID; 
	        //that.roleCheck(employeeID, data);
	        HR.util.Busy.setBusyOn(true); //Showing busy indicator before the form is loaded
	        $.getJSON(HR.i18n.URL.EmployeeDataChange.getDetails(employeeID, HR.i18n.User.Roles.find(employeeID)), function (data) {
		        loadForm(data, that);		    
		        that.openPanel(that, "organizationAssignment", false);
		        that.openPanel(that, "location", false);
		        that.openPanel(that, "job", false);
		        that.openPanel(that, "pay", false);
		        that.openPanel(that, "sdssSdsmOnly", false);
		        HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
		    }).error(function(err) { 
		         HR.util.Busy.setBusyOff();
		        that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
		    });
	    }
        else if((this.status === "saved") || (this.status === "copy")){
            var workItemId = oEvent.getParameter("arguments").workItemId;
            var url;
            if(this.status==="saved"){
                url = HR.i18n.URL.EmployeeDataChangeDetails.employeeDataChangeForm(workItemId);
            }
            else if (this.status==="copy"){
                url = HR.i18n.URL.MyRequests.onCopy(workItemId);
               
            }
            HR.util.Busy.setBusyOn(true); //Showing busy indicator before the form is loaded
            $.getJSON( url, function (data) {
                loadForm(data, that);
                that.setSavedDetails(data, that,this.status);
                HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
            }).error(function(err) { 
                HR.util.Busy.setBusyOff();
                that._router._myNavBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
            });
        }
	},	
	
	setSavedDetails: function(data,that){
	        HR.util.Control.setValue("comments", that, data.d.HrasrCurrentNote);
            that.openPanel(that, "organizationAssignment", data.d.ManagerIDNew!=="" || data.d.PeopleMngrNew!=="" || data.d.I0001KostlNew!=="");
            HR.util.Control.setValue("manager", that, data.d.ManagerPersonIdNew+" "+ data.d.ManagerNameNew, "edit");
            if(HR.util.Control.getValue("manager",that, "id")!==undefined) that.afterManagerSelection(that, data.d.ManagerIDNew);
            
            if(data.d.PeopleMngrCurr!=="Yes") HR.util.Control.setValue("becomingAPeopleManager", that, data.d.PeopleMngrNew, "edit");
            HR.util.Control.setValue("costCenter", that, data.d.I0001KostlNew+" "+data.d.I0001KostlNameNew, "edit");
            that.openPanel(that, "location", data.d.I0001BtrtlNew!=="");
            HR.util.Control.setValue("officeLocation", that, data.d.I0001BtrtlNew, "edit");
		    that.openPanel(that, "job", data.d.I0001PtextNew!=="" || (data.d.I0001StellNew!=="" && data.d.I0001StellNew!=="00000000"));
		    if(data.d.I0001StellNew!=="00000000"){
		        HR.util.Control.setValue("jobCode", that, data.d.I0001StellNew+" "+ data.d.I0001ShortNew, "edit");
		    }
            HR.util.Control.setValue("jobTitle", that, data.d.I9002ZjobtitleNew, "edit");
            HR.util.Control.setValue("positionTitle", that, data.d.I0001PtextNew, "edit");
            HR.util.Control.setValue("jobLevel", that, data.d.I1051JcodeNameNew, "edit");
            HR.util.Control.setValue("managerLevel", that, data.d.I1010HilfmNew+" "+data.d.I1010HilfmDescrNew, "edit");
                
            that.openPanel(that, "pay", HR.util.Formatter.getMoney(data.d.NewAnsal)!=="0"||HR.util.Formatter.getMoney(data.d.NewCommision)!=="0"||  data.d.I0761RsuNew!=="0" ||  data.d.I0761StockNew!=="");
            HR.util.Control.setValue("annualSalary", that, HR.util.Formatter.getNumber(data.d.NewAnsal), "edit");
            if(HR.util.Formatter.getMoney(data.d.NewCommision)!="0")
            HR.util.Control.setValue("targetCommission", that, HR.util.Formatter.getNumber(data.d.NewCommision), "edit");
            if(data.d.I0761RsuNew!=="0")
            HR.util.Control.setValue("rsu", that, data.d.I0761RsuNew, "edit");
            HR.util.Control.setValue("stockOption", that, data.d.I0761StockNew, "edit");
                
            that.openPanel(that, "sdssSdsmOnly", data.d.I0001ZzldridNew!=="" ||  data.d.I9034DirectNew!=="");
            HR.util.Control.setValue("leader", that, data.d.I0001ZzldridNew +" " +data.d.I0001ZzldridNameNew, "edit");
            HR.util.Control.setValue("laborClassification", that, data.d.LaborClassNew, "edit");
            
           
            HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
	},
	
    validations: function(evt){
           
       //If effective date changes - blank out the fields manager and cost center
        if(evt!==undefined && evt.getSource().sId.indexOf('effectiveDate')>-1 ){
            if(this.getView().byId("effectiveDate").getDateValue()!==that.initialEffectiveDate){
            this.getView().byId("manager").setValue("");
            this.managerPernrNew ="";
            this.getView().byId("costCenter").setValue("");
            that.initialEffectiveDate = this.getView().byId("effectiveDate").getDateValue();
            }
            return;
        }
        if(this.changes.validations == undefined){
            this.changes.validations = [];
        }
        //check for same values - current and proposed
        var controls = ["manager", "costCenter", "officeLocation", "jobCode", "positionTitle","laborClassification"];
        var arrayLength = controls.length;
        for (var i = 0; i < arrayLength; i++) {
        var proposedValue= HR.util.Control.getValue(controls[i], this);   
        var currentValue= HR.util.Control.getValue(controls[i]+"-old", this);   
        if(controls[i]=="officeLocation") currentValue = HR.util.Control.getValue(controls[i]+"-old", this,"id");
        if(HR.util.Control.getValue(controls[i], this)!==undefined && currentValue=== proposedValue){
            HR.util.Control.setValueState(controls[i],this,"Error");
            this.changes.validations[controls[i]]= HR.i18n.Messages.EmployeeDataChange.errors.sameValue;
        }
        else HR.util.Control.setValueState(controls[i],this,"None");
        }
        // ends here
        this.validateEffectiveDate();
        this.validateBecomingAPeopleManager();
        this.validateAmount("annualSalary");
        
        if(this.isEmployee && HR.i18n.User.isSalesRelated(this.SalesEmpNew))
            this.validateAmount("targetCommission");

        if( this.isEmployee && HR.i18n.User.isRsuApplicable(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I1010HilfmCurr"))){
              this.validate("rsu");
        }
        if(this.isEmployee && HR.i18n.User.isVpOrAbove(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I1010HilfmCurr"))){
              this.validate("stockOption");
        }
        this.validateLeader();
        
    },
    validateLeader: function(){
        var leader = HR.util.Control.getValue("leader", this, "id");
        var leaderOld = HR.util.Control.getValue("leader-old", this, "id");
        var laborClassification = HR.util.Control.getValue("laborClassification", this);
        var existingJobType= sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0008TartxCurr");
        var manager= HR.util.Control.getValue("manager", this, "id");
        var managerName = HR.util.Control.getValue("manager", this);

        if(manager==undefined){ // IF new manager is undefined, show the leaders under old manager
            manager= HR.util.Control.getValue("manager-old", this, "id");
            managerName = HR.util.Control.getValue("manager-old", this);
        }
        if(leader!==undefined && manager!==this.managerPernrForLeader){  // If user selects the leader and then deletes the new manager afterwards
            var flag;
            var oldManagerLeaders =  sap.ui.getCore().getModel("oldManagerLeaders").getData().d.results;
            for(var count=0; count<oldManagerLeaders.length;count++){
                if(leader!==oldManagerLeaders[count].PersonId){ // Validating selected leader against old manager
                    flag=false; // if old manager doesn't have selected leader in his pool
                }
                else{
                    flag=true; // if old manager also have selected leader in his pool
                    break;
                }
                
            }
            if(flag==false){ 
                    HR.util.Control.setValueState("leader",this,"Error");
                    this.changes.validations["leader"]= HR.i18n.Messages.EmployeeDataChange.errors.leader(managerName);
            }
            else{
                 HR.util.Control.setValueState("leader",this,"None");
            }
           
        }
        else if (leader!==undefined && leader===leaderOld){
            HR.util.Control.setValueState("leader",this,"Error");
            this.changes.validations["leader"]= HR.i18n.Messages.EmployeeDataChange.errors.sameValue;
        }
        else{
            HR.util.Control.setValueState("leader",this,"None");
        }
    },
    validate: function(id){
        var element=this.getView().byId(id);
        var value=element.getValue();
        if(HR.util.General.isValidNumber(value)){
            currentValue = HR.util.Control.getValue(id+"-old", this);
            if(value!==undefined && currentValue===value){
                HR.util.Control.setValueState(id,this,"Error");
                this.changes.validations[id]= HR.i18n.Messages.EmployeeDataChange.errors.sameValue;
            }    
            else HR.util.Control.setValueState(id,this,"None");
        }
        else{
            HR.util.Control.setValueState(id,this,"Error");
            this.changes.validations[id]= HR.i18n.Messages.EmployeeDataChange.errors.number;
        }
    },
    validateAmount: function(id){
        var element=this.getView().byId(id);
        var value=element.getValue();
        var formatValue= this.currencyDecimal?HR.util.General.isValidAmount(value):HR.util.General.isValidNumber(value);
        if(formatValue){
            proposedValue = HR.util.Formatter.getMoney(value);
            currentValue = HR.util.Control.getValue(id+"-old", this,"id");
            if(proposedValue!=="0" && currentValue===proposedValue){
                HR.util.Control.setValueState(id,this,"Error");
                this.changes.validations[id]= HR.i18n.Messages.EmployeeDataChange.errors.sameValue;
            } 
            else HR.util.Control.setValueState(id,this,"None");
        }
        else{
            HR.util.Control.setValueState(id,this,"Error");
            if(this.currencyDecimal)
                this.changes.validations[id]= HR.i18n.Messages.EmployeeDataChange.errors.amount;
            else 
                this.changes.validations[id]= HR.i18n.Messages.EmployeeDataChange.errors.currencyNumber;
        }
    },
    validateEffectiveDate:function(){
        var element=this.getView().byId("effectiveDate");
        var plus2Months =HR.util.General.getDate();
        plus2Months.setDate(plus2Months.getDate() + 60); 
        var minus2Months =HR.util.General.getDate();
        minus2Months.setDate(minus2Months.getDate() - 60); 
        var value=element.getValue();
        var error =false;
        
        var beginDate = HR.util.Formatter.getNormalDateDefault(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0000Begda"));
        if(beginDate){
            beginDate.setHours(0); beginDate.setMinutes(0);beginDate.setSeconds(0); beginDate.setMilliseconds(0);
        }
        if(value===undefined){
           error=HR.i18n.Messages.EmployeeDataChange.errors.effectiveDateNull;
        }
        else if(HR.util.Control.getValue("effectiveDate", this) <= beginDate){
            error= HR.i18n.Messages.EmployeeDataChange.futureAction;            
        } 
        else if(HR.util.Control.getValue("effectiveDate", this) > plus2Months || HR.util.Control.getValue("effectiveDate", this)<minus2Months){
            error=HR.i18n.Messages.EmployeeDataChange.errors.twoMonths;
        }
        else if(new Date(value)=="Invalid Date"){
           error=HR.i18n.Messages.EmployeeDataChange.errors.date;
        }
        if(error===false){
            HR.util.Control.setValueState("effectiveDate",this,"None");
        }
        else{
            HR.util.Control.setValueState("effectiveDate",this,"Error");
            this.changes.validations.effectiveDate=error;
        }
    
    },

    error:function(evt){
        if(this.changes.validations!==null || this.changes.validations!==undefined)
            sap.m.MessageToast.show(this.changes.validations[evt.getSource().data("id")]);
    },
	validateBecomingAPeopleManager: function(evt){
	    var error=false;
	    var element=this.getView().byId("becomingAPeopleManager");
        var value=HR.util.Control.getValue("becomingAPeopleManager", this, "key");
	    if(value==="Yes"){
        	        if(HR.util.Control.getValue("laborClassification", this)==="DL" || 
        	            (HR.util.Control.getValue("laborClassification", this)==="" &&
        	            HR.util.Control.getValue("laborClassification-old", this)==="DL")){
        	            error=HR.i18n.Messages.EmployeeDataChange.errors.BecomingAPeopleManager.laborClassification;
        	        }
        	        if(HR.util.Control.getValue("leader", this, "id")!== undefined || HR.util.Control.getValue("leader-old", this, "id")!== undefined){
        	            error=HR.i18n.Messages.EmployeeDataChange.errors.BecomingAPeopleManager.leader;
        	        }
	    }
        if(error===false){
            HR.util.Control.setValueState("becomingAPeopleManager", this, "None");
        }
        else{
            HR.util.Control.setValueState("becomingAPeopleManager", this, "Error");
            this.changes.validations.becomingAPeopleManager=error;
        }
	    
	},
	openDialog: function (sType) {
        if (!this[sType]) {
          this[sType] = sap.ui.xmlfragment("HR.view.Dialog." + sType, this);
          this.getView().addDependent(this[sType]);
        }
        this[sType].open();
    },
	cancelEmployeeDataChange: function(evt){
        this.openDialog('Cancel');
    },
    cancelNo: function (oEvent) {
        this[oEvent.getSource().data("dialogType")].close();
    },
    cancelYes: function () {
        this._router.navTo("EmployeeSearch",{pageNum:1});
    },
    backendReview: function() {
      this.validations(); // do validations
      try{
        if(this.changes.validations == undefined){
            this.changes.validations = [];
        }
        var NewAnsal = ""; 
        var I0761RsuNew="";
        var I0761StockNew="";
        var I0001StellNew  = "";
        var NewCommision = "";
        var ManagerIDNew = "";
        var I0001BtrtlNew = "";
        var Pernr = this.employeeId;
        var EffectiveDate =  HR.util.Formatter.getDateTimeFormat(this.changes.effectiveDate);
        if(this.changes.annualSalary !== undefined) NewAnsal = this.changes.annualSalary;
        if(this.changes.rsu !==undefined) I0761RsuNew = this.changes.rsu;
        if(this.changes.stockOption !==undefined) I0761StockNew = this.changes.stockOption;
        if(this.changes.jobCode !==undefined) I0001StellNew = this.changes.jobCode;
        if(this.changes.targetCommission!==undefined) NewCommision = this.changes.targetCommission;
        if(this.changes.managerPernr!==undefined) ManagerIDNew = this.changes.managerPernr;
        if(this.changes.officeLocation!==undefined) I0001BtrtlNew =  this.changes.officeLocation;
        if(this.changes.annualSalary === undefined && this.changes.rsu ===undefined && this.changes.stockOption===undefined && this.changes.jobCode===undefined && this.changes.managerPernr===undefined && this.changes.targetCommission===undefined)
            return; 
        if(!$.isEmptyObject(that.changes.validations)) return;   
        var oModel = new sap.ui.model.json.JSONModel();
        HR.util.Busy.setBusyOn(true);
        oModel.loadData(HR.i18n.URL.EmployeeDataChange.getBackendReview(Pernr, EffectiveDate, NewAnsal, I0761RsuNew, I0761StockNew, I0001StellNew, NewCommision, ManagerIDNew,I0001BtrtlNew), null, false);
        for(i=0;i<oModel.getData().d.results.length;i++)
        {
            if(oModel.getData().d.results[i].MsgType =="W") {
               this.changes.warnings.push(oModel.getData().d.results[i].Message) ;
            }    
            else if (oModel.getData().d.results[i].MsgType =="E") {
               this.changes.validations.push(oModel.getData().d.results[i].Message);
            }
        }
        HR.util.Busy.setBusyOff();
      }
      catch(err){
        console.log(err);
      }
    },
	warnings: function(){
        this.changes.warnings=[];
        var getDate = HR.util.General.getDate();
        if (this.changes.effectiveDate < getDate){ //effective date is in the past
            this.changes.warnings.push(HR.i18n.Messages.EmployeeDataChange.errors.pastEffectiveDate);
        }
        var obj= this.getView().byId("officeLocation").getModel().getData().d.results;
        var isRemoteLocation =function(officeLocation){
            var RemoFlag = "";
            if(officeLocation==="" || officeLocation===undefined) return true;
            for (var i = 0; i < obj.length; i++){
              if (obj[i].Btrtl == officeLocation){
                RemoFlag= obj[i].RemoFlag;
                break;
              }
            }
            return HR.i18n.User.isRemoteLocation(RemoFlag);
        }
        
       var remoteToRegularLocation = 
       isRemoteLocation(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0001BtrtlCurr")) 
       && !isRemoteLocation(HR.util.Control.getValue("officeLocation", this));
       
       var regularToRemoteLocation = 
       !isRemoteLocation(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0001BtrtlCurr")) 
       && isRemoteLocation(HR.util.Control.getValue("officeLocation", this));

        var targetCommission = false;
        
        if(HR.util.Control.getValue("jobCode", this, "id")!==undefined)         
            targetCommission =  this.isEmployee && HR.i18n.User.isSalesRelated(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/SalesEmp")) && !HR.i18n.User.isSalesRelated(this.SalesEmpNew); 
        
        if(HR.util.Control.getValue("officeLocation", this, "id")!==undefined &&remoteToRegularLocation){
            this.changes.warnings.push(HR.i18n.Messages.EmployeeDataChange.warnings.officeLocation);
        }
        if(HR.util.Control.getValue("officeLocation", this, "id")!==undefined &&regularToRemoteLocation){
            this.changes.warnings.push(HR.i18n.Messages.EmployeeDataChange.warnings.officeLocation2);
        }
        if(targetCommission){
            this.changes.warnings.push(HR.i18n.Messages.EmployeeDataChange.warnings.targetCommission);
        }
        if(HR.util.Control.getValue("costCenter", this, "id")!==undefined && this.getManagerProfitCenter("Owned").indexOf(this.costCenters_profitCenter_forValidation) < 0){
            this.changes.warnings.push(HR.i18n.Messages.EmployeeDataChange.warnings.costCenter);
        }
    },
	hide: function(){
	    HR.util.Control.hide("effectiveDate-error", this);
	    HR.util.Control.hide("manager", this);
	    HR.util.Control.hide("becomingAPeopleManager", this);
	    HR.util.Control.hide("costCenter", this);
	    HR.util.Control.hide("officeLocation", this);
	    HR.util.Control.hide("jobCode", this);
	    HR.util.Control.hide("jobTitle", this);
	    HR.util.Control.hide("positionTitle", this);
	    HR.util.Control.hide("jobLevel", this);
	    HR.util.Control.hide("managerLevel", this);
	    HR.util.Control.hide("annualSalary", this);
	    HR.util.Control.hide("targetCommission", this);
	    HR.util.Control.hide("rsu", this);
	    HR.util.Control.hide("stockOption", this);	 
	    HR.util.Control.hide("leader", this);
	    HR.util.Control.hide("laborClassification", this);
	    
	    HR.util.Control.enable("jobTitle", this, false);
	    HR.util.Control.enable("jobLevel", this, false);
	    HR.util.Control.enable("managerLevel", this, false);
	},
	clearForm:function(){
	    HR.util.Control.clear("effectiveDate", this);
	    HR.util.Control.clear("manager", this);
	    HR.util.Control.clear("becomingAPeopleManager", this);
	    HR.util.Control.clear("costCenter", this);
	    HR.util.Control.clear("officeLocation", this);
	    HR.util.Control.clear("jobCode", this);
	    HR.util.Control.clear("jobTitle", this);
	    HR.util.Control.clear("positionTitle", this);
	    HR.util.Control.clear("jobLevel", this);
	    HR.util.Control.clear("managerLevel", this);
	    HR.util.Control.clear("annualSalary", this);
	    HR.util.Control.clear("targetCommission", this);
	    HR.util.Control.clear("rsu", this);
	    HR.util.Control.clear("stockOption", this);	 
	    HR.util.Control.clear("leader", this);
	    HR.util.Control.clear("laborClassification", this);
        HR.util.Control.clear("comments", this);
	    this.changes={};
	},
	
	edit: function (evt) {
	    if(evt.getSource().data("id")==="jobCode"){
	         HR.util.Control.edit("jobTitle", this);
	         HR.util.Control.edit("jobLevel", this);
	         HR.util.Control.edit("managerLevel", this);
	    }
        HR.util.Control.edit(evt.getSource().data("id"), this);
        
        if(evt.getSource().data("id")==="annualSalary"){
            if(this.partTimeEmployee){
                HR.util.Control.setValue("annualSalaryPartTime", this, HR.i18n.Messages.EmployeeDataChange.annualSalaryPartTime);
                HR.util.Control.show("annualSalaryPartTime", this);
                this.getView().byId("annualSalary").setVisible(false);
            }
            else{
                HR.util.Control.hide("annualSalaryPartTime", this);
                this.getView().byId("annualSalary").setVisible(true);
            }
        }  
    },
    cancel : function (evt) {
        if(evt.getSource().data("id")==="jobCode"){
             HR.util.Control.hide("jobTitle", this);
	         HR.util.Control.hide("jobLevel", this);
	         HR.util.Control.hide("managerLevel", this);
	         HR.util.Control.clear("jobTitle", this);
	         HR.util.Control.clear("jobLevel", this);
	         HR.util.Control.clear("managerLevel", this);
	         HR.util.Control.clear("positionTitle", this);
             this.showTargetCommission(this, sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/SalesEmp"), true);
             this.showRsu(this, sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I1010HilfmCurr"), true);
             this.showStockOption(this, sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I1010HilfmCurr"), true);
	    }
	    else if(evt.getSource().data("id")==="manager")
	     this.managerPernrNew="";
        HR.util.Control.cancel(evt.getSource().data("id"), this );
    },

    review: function(evt){
        this.submit(evt);   
    },
    close: function(page){
        this.getChanges(); //get the changes
            if(HR.util.General.objectLength(this.changes)===1) {  
                this._router.navTo("EmployeeSearch",{pageNum:1}); 
                return; 
            }
        var that=this;
        var successFn = function(data, object){
            HR.util.Busy.setBusyOff();
            that._router.navTo("EmployeeSearch",{pageNum:1});
            sap.m.MessageToast.show(HR.i18n.Messages.EmployeeDataChange.formSave, {closeOnBrowserNavigation: false});
            object.WiID=data.d.WiID;
        }; 
        this.go(successFn,"SAVE_DRAFT","Save", HR.i18n.Messages.EmployeeDataChange.saveConfirm);
    },

    submit: function(){
        var that=this;
        var successFn = function(data){
            HR.util.Busy.setBusyOff();//bug fix 6/5/2015
            that._router.navTo("EmployeeSearch",{pageNum:1});
			var oLayout = new sap.ui.layout.VerticalLayout();
			oLayout.addContent(new sap.m.Text({text: HR.i18n.Messages.EmployeeDataChange.submitSuccess}));
			sap.m.MessageBox.show(oLayout, sap.m.MessageBox.Icon.INFORMATION, "Information");
        };
        this.go(successFn,"SEND","Submit", HR.i18n.Messages.EmployeeDataChange.submit,this.status);
    },
    getChanges:function() { 
        this.changes={};
        this.changes.effectiveDate = HR.util.Control.getValue("effectiveDate", this);
        this.changes.manager= HR.util.Control.getValue("manager", this, "id");
        if(this.managerPernrNew!=="") this.changes.managerPernr= this.managerPernrNew; 
        this.changes.managerDesc= HR.util.Control.getValue("manager", this, "desc");
        
        this.changes.becomingAPeopleManager = HR.util.Control.getValue("becomingAPeopleManager", this);
        
        this.changes.costCenter= HR.util.Control.getValue("costCenter", this, "id");
        this.changes.costCenterDesc= HR.util.Control.getValue("costCenter", this, "desc");
        this.changes.officeLocation= HR.util.Control.getValue("officeLocation", this, "id");
        this.changes.officeLocationDesc= HR.util.Control.getValue("officeLocation", this, "desc");
        
        this.changes.jobCode= HR.util.Control.getValue("jobCode", this, "id");
        this.changes.radfordCode= HR.util.Control.getValue("jobCode", this, "desc");
        
        
        this.changes.jobTitle = HR.util.Control.getValue("jobTitle", this, "value");
        this.changes.positionTitle= HR.util.Control.getValue("positionTitle", this, "value");
        this.changes.jobLevel = HR.util.Control.getValue("jobLevel", this,"id");
        this.changes.jobLevelDesc = HR.util.Control.getValue("jobLevel", this);
        this.changes.managerLevel= HR.util.Control.getValue("managerLevel", this, "id");
        this.changes.managerLevelDesc= HR.util.Control.getValue("managerLevel", this, "desc");
        
        this.changes.annualSalary= HR.util.Control.getValue("annualSalary", this, "amount");
        this.changes.targetCommission= HR.util.Control.getValue("targetCommission", this, "amount");
        this.changes.rsu = HR.util.Control.getValue("rsu", this, "number");
        this.changes.stockOption= HR.util.Control.getValue("stockOption", this, "number");
        this.changes.leader = HR.util.Control.getValue("leader", this, "id");
        this.changes.leaderDesc = HR.util.Control.getValue("leader", this, "desc");
        
        this.changes.laborClassification= HR.util.Control.getValue("laborClassification", this);
        this.changes.comments= HR.util.Control.getValue("comments", this);
	},
	setParameters: function(action){
	    this.parameters={};
        this.parameters =new sap.ui.getCore().getModel("employeeDataChange").getData();
       
        if(this.changes.effectiveDate !==undefined)  this.parameters.d.EffectiveDate=HR.util.Formatter.getODataDate(this.changes.effectiveDate);
        else this.parameters.d.EffectiveDate="";
        if(this.changes.manager!==undefined)  this.parameters.d.ManagerPersonIdNew=this.changes.manager;
        else this.parameters.d.ManagerPersonIdNew="";
        if(this.changes.managerPernr!==undefined)  this.parameters.d.ManagerIDNew=this.changes.managerPernr;
        else this.parameters.d.ManagerIDNew="";
        if(this.changes.managerDesc!==undefined)  this.parameters.d.ManagerNameNew=this.changes.managerDesc;
        else this.parameters.d.ManagerNameNew="";
        if(this.changes.becomingAPeopleManager !==undefined)  this.parameters.d.PeopleMngrNew=this.changes.becomingAPeopleManager ;
        else this.parameters.d.PeopleMngrNew="";
        if(this.changes.costCenter!==undefined)  this.parameters.d.I0001KostlNew=this.changes.costCenter;
        else this.parameters.d.I0001KostlNew=""; 
        if(this.changes.costCenterDesc!==undefined)  this.parameters.d.I0001KostlNameNew=this.changes.costCenterDesc;
        else this.parameters.d.I0001KostlNameNew=""; 
        if(this.changes.officeLocation!==undefined)  this.parameters.d.I0001BtrtlNew=this.changes.officeLocation;
        else this.parameters.d.I0001BtrtlNew=""; 
        if(this.changes.officeLocationDesc!==undefined)  this.parameters.d.I0001BtrtlNameNew=this.changes.officeLocationDesc;
        else this.parameters.d.I0001BtrtlNameNew=""; 
        if(this.changes.jobCode!==undefined)  this.parameters.d.I0001StellNew=this.changes.jobCode;
        else {
            this.parameters.d.I0001StellNew="00000000"; 
            this.parameters.d.SalesEmpNew = this.salesEmp;
        }    
        if(this.changes.radfordCode!==undefined)  this.parameters.d.I0001ShortNew=this.changes.radfordCode;
        else this.parameters.d.I0001ShortNew="";
        if(this.changes.jobTitle !==undefined)  this.parameters.d.I9002ZjobtitleNew=this.changes.jobTitle ;
        else this.parameters.d.I9002ZjobtitleNew="";
        if(this.changes.positionTitle!==undefined)  this.parameters.d.I0001PtextNew=this.changes.positionTitle;
        else this.parameters.d.I0001PtextNew="";
        if(this.changes.jobLevel !==undefined)  this.parameters.d.I1051JcodeNew=this.changes.jobLevel ;
        else this.parameters.d.I1051JcodeNew="";
        if(this.changes.jobLevelDesc !==undefined)  this.parameters.d.I1051JcodeNameNew=this.changes.jobLevelDesc ;
        else this.parameters.d.I1051JcodeNameNew="";
        if(this.changes.managerLevel!==undefined)  this.parameters.d.I1010HilfmNew=this.changes.managerLevel;
        else this.parameters.d.I1010HilfmNew="";
        if(this.changes.managerLevelDesc!==undefined)  this.parameters.d.I1010HilfmDescrNew=this.changes.managerLevelDesc;
        else this.parameters.d.I1010HilfmDescrNew="";
        if(this.changes.annualSalary!==undefined)  this.parameters.d.NewAnsal=this.changes.annualSalary;
        else this.parameters.d.NewAnsal="";
        if(this.changes.targetCommission!==undefined)  this.parameters.d.NewCommision=this.changes.targetCommission;
        else this.parameters.d.NewCommision="";
        if(this.changes.rsu !==undefined)  this.parameters.d.I0761RsuNew=this.changes.rsu ;
        else this.parameters.d.I0761RsuNew="0";
        if(this.changes.stockOption!==undefined)  this.parameters.d.I0761StockNew=this.changes.stockOption;
        else this.parameters.d.I0761StockNew="";
        if(this.changes.leader !==undefined)  this.parameters.d.I0001ZzldridNew=this.changes.leader ;
        else this.parameters.d.I0001ZzldridNew="";
        if(this.changes.leaderDesc !==undefined)  this.parameters.d.I0001ZzldridNameNew=this.changes.leaderDesc ;
        else this.parameters.d.I0001ZzldridNameNew="";
        if(this.changes.laborClassification!==undefined)  this.parameters.d.LaborClassNew=this.changes.laborClassification;
        else this.parameters.d.LaborClassNew="";
        if(this.changes.comments!==undefined)  this.parameters.d.HrasrCurrentNote=this.changes.comments;
        else this.parameters.d.HrasrCurrentNote="";
        this.parameters.d.WiID= this.WiID;
        this.parameters.d.InitiatorRole =  HR.i18n.User.Roles.find(sap.ui.getCore().getModel("employeeDataChange").getData().d.Pernr);
    },
    getMessageBoxLayout: function(text){ 
        var oLayout = new sap.ui.layout.VerticalLayout();
        oLayout.addContent(new sap.m.Label({text: text}));
        oLayout.addContent(new sap.m.Label({text: ""}));
        if(this.changes.warnings.length>0){
                oLayout.addContent(new sap.m.ObjectStatus({text: "Warnings:", state: "Warning", icon:"sap-icon://alert"}));
                for (var num in this.changes.warnings) {
                    oLayout.addContent(new sap.m.Text({text: this.changes.warnings[num]}));
                }
        }
    	var data = [];
    	var fields=["manager","becomingAPeopleManager","costCenter","officeLocation","jobCode","jobTitle","positionTitle","jobLevel","managerLevel","annualSalary","targetCommission","rsu","stockOption","leader","laborClassification"];
    	for(var i=0; i<fields.length;i++)
    	if(this.changes[fields[i]]!==undefined){
    	    var value=HR.util.Control.getValue(fields[i], this,"value");
    	    if(fields[i]==="annualSalary" || fields[i]==="targetCommission")
    	        value = HR.util.Formatter.getMoney(value) + " "+sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0008Waers");
    	    data.push({
    	        field : HR.util.Control.getValue(fields[i]+"-title", this), 
    	        currentValue : HR.util.Control.getValue(fields[i]+"-old", this), 
    	        proposedValue : value
    	    });
    	    
        }
    	if(data.length>0){
            	var aColumns = [
            		new sap.m.Column({width:'30%', header : new sap.m.Label({text : "Field"})}),
            		new sap.m.Column({width:'35%', header : new sap.m.Label({text : "Current Value"}),minScreenWidth : "Tablet",demandPopin : true}),
            		new sap.m.Column({width:'35%',header : new sap.m.Label({text : "Proposed Value"}),minScreenWidth : "Tablet",demandPopin : true}),
            	];
            	var oTemplate = new sap.m.ColumnListItem({
            		cells : [
            			new sap.m.Text({text: "{field}"}),
            			new sap.m.Text({text: "{currentValue}"}), 
            			new sap.m.Text({text: "{proposedValue}"})
            		]
            	});
                var oTable = new sap.m.Table({columns : aColumns}).addStyleClass( "sapUiSizeCompact");    
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({tableData: data});
                oTable.setModel(oModel);
    	        oTable.bindItems("/tableData", oTemplate);
    	        oLayout.addContent(new sap.m.Label({text: ""}));
    	        oLayout.addContent(oTable);
    	}
        return  oLayout;   
    }, 
    go: function(successFn, action, msgBoxTitle, msgBoxMsg,status){
        try{
            this.getChanges(); //get the changes
            if(HR.util.General.objectLength(this.changes)===1) { 
                if(msgBoxTitle==="Submit"){
                    sap.m.MessageToast.show(HR.i18n.Messages.EmployeeDataChange.noChangesSubmit, {closeOnBrowserNavigation: false});
                    return; 
                }
            } 
                this.warnings(); //assign warning messages
                if(msgBoxTitle==="Submit") {
                     this.backendReview();
                }
                var oLayout = this.getMessageBoxLayout(msgBoxMsg);
                var that=this;
                that.action=action;
                var update = function(){
                    that.setParameters(); 
                    if((that.status==="copy")||(that.status==="saved")) {
                        that.parameters.d.__metadata.type = "ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV.ZECDSEND";
                        if(that.parameters.d.ZSHOWAPPROVALSet){
                             delete that.parameters.d.ZSHOWAPPROVALSet;
                        }
                    }
                    that.parameters.d.Event=that.action;
                    if(that.changes.jobCode!==undefined){ // if job code is changed and new job code is sales
                        that.parameters.d.SalesEmpNew = that.SalesEmpNew;
                    }
                    else{ // if job code is not changed - check the old job code
                        that.parameters.d.SalesEmpNew = that.salesEmp;
                    }
                    HR.util.General.ajaxWrite(HR.i18n.URL.EmployeeDataChange.saveSubmit.entity, HR.i18n.URL.EmployeeDataChange.saveSubmit.link(that.status), that.parameters, successFn, that);
                }
                //Action buttons for Close and Review
                if(msgBoxTitle==="Save") { 
                    var yesButton= new sap.m.Button({
                        text:"Yes",
                        press:function() {
                            that.validations(); // do validations
                            if($.isEmptyObject(that.changes.validations)){
                            update();
                            }
                            else{ 
                            sap.m.MessageToast.show(HR.i18n.Messages.EmployeeDataChange.validationFailed+" "+that.changes.validations.toString());
                            }
                        }
                    });
                    var cancelButton= new sap.m.Button({
                            text:"Cancel",
                            press:function() {
                                that.closePopUp.close();
                            }
                    });
                    //If the dialog is not in context
                    if(!this.closePopUp){ 
                            var noButton= new sap.m.Button({
                                    text:"No",
                                    press:function() {
                                        that._router._myNavBack();
                                    }
                            });
                            this.closePopUp = sap.ui.xmlfragment("SaveDialog","HR.view.Dialog.Close",this );
                            this.closePopUp.addButton(yesButton);
                            this.closePopUp.addButton(noButton);
                            this.closePopUp.addButton(cancelButton);
                            this.closePopUp.setTitle("Save");
                            this.getView().addDependent(this.closePopUp);
                    }  
                    
                    else{
                       this.closePopUp.destroyContent(oLayout); //Destrop the content which is already present in the dialog
                    }
                    
                    this.closePopUp.addContent(oLayout);
                    this.closePopUp.open();   
                    HR.util.PopupDrag.draggable("SaveDialog");
                } 
              else if(msgBoxTitle==="Submit"){
                    if($.isEmptyObject(this.changes.validations)){
                    //If the dialog is not in context
                    if(!this.reviewPopup){ 
                        var yesButton= new sap.m.Button({
                        text:"Yes",
                        press:function() {
                            update();
                        }
                        });
                        var noButton= new sap.m.Button({
                                text:"No",
                                press:function() {
                                that.reviewPopup.close(); 
                                }
                        });
                        this.reviewPopup = sap.ui.xmlfragment("SubmitDialog","HR.view.Dialog.Close",this );
                        this.reviewPopup.addButton(yesButton);
                        this.reviewPopup.addButton(noButton);
                        this.reviewPopup.setTitle("Submit");
                        this.getView().addDependent(this.reviewPopup);
                    }  
                    
                    else{
                       this.reviewPopup.destroyContent(oLayout); //Destroythe content which is already present in the dialog
                    }
                    
                    this.reviewPopup.addContent(oLayout);
                    this.reviewPopup.open(); 
                    HR.util.PopupDrag.draggable("SubmitDialog");
                }
                else{ 
                sap.m.MessageToast.show(HR.i18n.Messages.EmployeeDataChange.validationFailed+" " +this.changes.validations.toString());
                }
              }
        }
        catch(err){
            console.log(err);
        }
    },
    
    // Setting data in manager and leader search based on search Input
    validateSearchInput: function(evt,sValue,role) 
    {   var oFilter;
        if(sValue.length>=3){
                if(role=='Manager'){
                    this.getManagerDetails(sValue)  ;
                    this._valueHelpDialogManagerSearch.setModel(sap.ui.getCore().getModel("managerSearch"));
                }
                
                if(role=='Leader'){
                    this._valueHelpDialogLeaderSearch.setModel(sap.ui.getCore().getModel("leaderSearch"));
                    if(isNaN(sValue)){
                         oFilter = new sap.ui.model.Filter("FirstName",sap.ui.model.FilterOperator.Contains, sValue);
                    }
                    else{
                         oFilter = new sap.ui.model.Filter("PersonId",sap.ui.model.FilterOperator.Contains, sValue);
                    }
                    evt.getSource().getBinding("items").filter([oFilter]);
                }
                
            }
        if(sValue.length==0){
            HR.util.Busy.setBusyOff();
            
            if(role=='Leader'){
                evt.getSource().getBinding("items").filter([]);
            }
            else{
                evt.getSource().getBinding("items").filter([oFilter]);
            }
        }
    },
    
    handleNavButtonPress : function (oEvent) {
		this._router.navTo("EmployeeSearch",{pageNum:1});
	},
	
    costCenterPopup : function (oController) { 
        this.inputId = oController.oSource.sId;
        if (!this._CostCenterDialog) {
          this._CostCenterDialog = sap.ui.xmlfragment("CostCenterSearchDialog","HR.view.Dialog.CostCenter",this );
          this.getView().addDependent(this._CostCenterDialog);
        }
          sap.ui.core.Fragment.byId("CostCenterSearchDialog", "costCenter").setValue();
       	  sap.ui.core.Fragment.byId("CostCenterSearchDialog", "CostCenterForm").setModel(sap.ui.getCore().getModel("profitCenter"));
       	  sap.ui.core.Fragment.byId("CostCenterSearchDialog", "Company").setText(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0001Bukrs"));

       	  if(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0032Prctr")!=="") { 
       	    sap.ui.core.Fragment.byId("CostCenterSearchDialog", "ProfitCenter").setSelectedKey(this.costCenters_profitCenter_forValidation);
       	    sap.ui.core.Fragment.byId("CostCenterSearchDialog", "CostCenterSearchTable").setModel(sap.ui.getCore().getModel("costCenter"));
       	    sap.ui.core.Fragment.byId("CostCenterSearchDialog", "CostCenterSearchTable").setVisible(true);
       	    this._profitCenterChange();
       	  }
        this._CostCenterDialog.open();
        HR.util.PopupDrag.draggable("CostCenterSearchDialog")
    },
    _profitCenterChange :  function () {
        var companyCode = sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0001Bukrs");
        var profitCenter = sap.ui.core.Fragment.byId("CostCenterSearchDialog", "ProfitCenter").getSelectedKey();
        var costCenter = sap.ui.core.Fragment.byId("CostCenterSearchDialog", "costCenter").getValue();
        this.getCostCenter(companyCode, profitCenter, costCenter); 
        sap.ui.core.Fragment.byId("CostCenterSearchDialog", "CostCenterSearchTable").setModel(sap.ui.getCore().getModel("costCenter"));
        sap.ui.core.Fragment.byId("CostCenterSearchDialog", "CostCenterSearchTable").setVisible(true);
    },
    _costCenterPopupClose : function () {
       if(this._CostCenterDialog){
        this._CostCenterDialog.close();
       }
    },
    _costCenterSelected : function (evt) {
        var obj = evt.getSource().getBindingContext();
        var selectedRow = sap.ui.core.Fragment.byId("CostCenterSearchDialog", "CostCenterSearchTable").getModel().getProperty(null, obj);
        this.getView().byId("costCenter").setValue(selectedRow.Kostl+" "+selectedRow.Ltext);
        this.validations();
        this._costCenterPopupClose();
    },
    //Manager search code starts here
    managerSearchPopup : function (oController) {
       
        if(!this._valueHelpDialogManagerSearch) {
            this._valueHelpDialogManagerSearch = sap.ui.xmlfragment("ManagerSearchDialog","HR.view.Dialog.ManagerSearch",this );
            this.getView().addDependent(this._valueHelpDialogManagerSearch);
        }
        
        //for subsequent times
        if(this._valueHelpDialogManagerSearch){
            // setting the dialog to a blank model so that initially search list is empty
            if(sap.ui.getCore().getModel("managerSearch")) {
                this._valueHelpDialogManagerSearch.setModel(sap.ui.getCore().getModel("blankModel"));
            }
        }
        this._valueHelpDialogManagerSearch.open();
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
        HR.util.PopupDrag.draggable("ManagerSearchDialog");
    },
    _managerSearchPopupSearch : function (evt) {
        var role = "Manager";
        var sValue = evt.getParameter("value");
        this.validateSearchInput(evt,sValue,role); // to validate the search input and get the data based on that
    },
    afterManagerSelection: function(that, managerPernr){
        var oModel = new sap.ui.model.json.JSONModel();
    	sap.ui.getCore().setModel(oModel, "managerProfitCenter");
        oModel.loadData(HR.i18n.URL.EmployeeDataChange.getManagerProfitCenter(managerPernr),  null, false);
        that.getCostCenter(sap.ui.getCore().getModel("employeeDataChange").getProperty("/d/I0001Bukrs"), that.getManagerProfitCenter("Assigned"));
    },
    _managerSearchPopupConfirm : function (evt) {
        if(evt.getParameters().selectedContexts!==undefined){
            var obj = HR.util.General.objectPath( new sap.ui.getCore().getModel("managerSearch").getData() , evt.getParameters().selectedContexts[0].sPath);
            HR.util.Control.setValue("manager", this, (obj.PersonId+" "+obj.FirstName));
            this.managerPernrNew = obj.EmployeeNo;
            this.validations();
            this.afterManagerSelection(this, obj.EmployeeNo);
        }
    },
    
    jobCodeSearchPopup : function (oController) {
        this.inputId = oController.oSource.sId;
        if (!this._Dialog) {
            this._Dialog = sap.ui.xmlfragment("JobCodeSearchDialog","HR.view.Dialog.JobCodeSearch",this );
            this.getView().addDependent(this._Dialog);
        }
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCodeSearchForm").setModel(sap.ui.getCore().getModel("jobGroup"));
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobGroup").setSelectedKey("");
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobTrack").setModel(sap.ui.getCore().getModel("JobTrack"));//Setting up Model for Job Track
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobFamily").setModel(sap.ui.getCore().getModel("JobFamily"));//Setting up Model for Job Family
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCode").setValue();
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCodeSearchTable").setVisible(false);
        this._Dialog.open();
        HR.util.PopupDrag.draggable("JobCodeSearchDialog");
    },

    _jobCodeListDisplay : function () {
        sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCodeSearchTable").setVisible(true);
        
        var psaCode = sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobGroup").getSelectedKey();
        var jobCode = sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCode").getValue();
        var jtrack = sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobTrack").getSelectedKey();//Creating Var for Job Track
        var jfamily = sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobFamily").getSelectedKey();//Creating Var for Job Family
        var oModel = new sap.ui.model.json.JSONModel();
        HR.util.Busy.setBusyOn(true); //showing busy indicator
        oModel.loadData(HR.i18n.URL.EmployeeDataChange.getJobCode(jobCode, psaCode, jtrack, jfamily),  null, false);
        HR.util.Busy.setBusyOff(); 

     	if(oModel.getData().d.results.length === 0)
     	   sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCodeSearchTable").setShowNoData(true);
     	   sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCodeSearchTable").setModel(oModel);
    },
    _jobCodeSearchPopupClose : function () {
       if(this._Dialog){
        this._Dialog.close();
       }
    },
    _jobCodeSelected : function (evt) {
        var obj = evt.getSource().getBindingContext();
        var selectedRow = sap.ui.core.Fragment.byId("JobCodeSearchDialog", "JobCodeSearchTable").getModel().getProperty(null, obj);
        HR.util.Control.setValue("jobCode", this, (selectedRow.JobCode+" "+selectedRow.JobAbbr));
        HR.util.Control.setValue("jobTitle", this, selectedRow.JobTitle);
        HR.util.Control.setValue("positionTitle", this, selectedRow.PositionTitle, "edit");
        HR.util.Control.setValue("jobLevel", this, (selectedRow.JobLevel+" "+selectedRow.JobLevelText));
        HR.util.Control.setValue("managerLevel", this, (selectedRow.EmployeeLvl+" "+selectedRow.EmployeeLvltxt));
        this.SalesEmpNew = selectedRow.Sales; 
        this.showTargetCommission(that, this.SalesEmpNew);
        this.showRsu(that, selectedRow.EmployeeLvl);
        this.showStockOption(that, selectedRow.EmployeeLvl);
        if(this._Dialog){
        this._Dialog.close();
        } 
    },
    
    //Leader Search Pop up code starts here
    leaderSearchPopup : function (oController) {
        this.getOldManagerLeaders(HR.util.Control.getValue("manager-old", this, "id"));  // Getting data for old manager and keep it ready 
        var that = this;
        if (!this._valueHelpDialogLeaderSearch) {
            this._valueHelpDialogLeaderSearch = sap.ui.xmlfragment("LeaderSearchDialog","HR.view.Dialog.LeaderSearch",this );
            this.getView().addDependent(this._valueHelpDialogLeaderSearch);
        }
        this._valueHelpDialogLeaderSearch.open();
        $("input[type=search]").attr("placeholder",HR.i18n.Messages.EmployeeDataChange.search);
        HR.util.PopupDrag.draggable("LeaderSearchDialog")
        //If new manager is selected and its not same as old manager
        if(HR.util.Control.getValue("manager", this, "id")!==undefined && HR.util.Control.getValue("manager", this, "id")!==HR.util.Control.getValue("manager-old", this, "id")){
            this.getLeaderDetails(this.getManagerPernrForLeader(),that); 
        }
        
        else{ // If no new manager is selected OR old and new managers are same
           this._valueHelpDialogLeaderSearch.setModel(sap.ui.getCore().getModel("oldManagerLeaders")); 
        }
       
    },
    
    // On click of Search button of the pop up
    _leaderSearchPopupSearch : function (evt) {
        var role = "Leader";
        var sValue = evt.getParameter("value");
        this.validateSearchInput(evt,sValue,role); // to validate the search input and get the data based on that
    },
    
    // After user make selection
    _leaderSearchPopupConfirm : function (evt) {
        if(evt.getParameters().selectedContexts!==undefined){
            var obj = HR.util.General.objectPath( evt.getSource().getModel().getData() , evt.getParameters().selectedContexts[0].sPath);
            HR.util.Control.setValue("leader", this, (obj.PersonId+" "+obj.FirstName));
            this.validations();
        }
    }
});