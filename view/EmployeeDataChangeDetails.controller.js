sap.ui.controller("HR.view.EmployeeDataChangeDetails", {

    onInit: function (evt) {
        this._router = sap.ui.core.UIComponent.getRouterFor(this);
        this._router.getRoute("Details").attachPatternMatched(this._routePatternMatched, this);
    },
    _routePatternMatched: function(evt){
        
        //Getting reference of i18n model
        i18nModel = sap.ui.getCore().getModel("i18n");
        //Model to hold request details
        oModelRequestDetails = new sap.ui.model.json.JSONModel();
        this.setProperties();
        that = this;
        
        // getting all the parameters from url
        this.employeeId = evt.getParameters().arguments.id;
        this.formName= evt.getParameters().arguments.ECDName;
        this.workItemId = evt.getParameters().arguments.WorkItemId;  
        this.requestFromPage =  evt.getParameters().arguments.formName;
        
        // Setting the title of the details page
        this.getView().byId("EmployeeDataChangeDetails").setTitle("ECD:" + this.workItemId);
        
        //If url has returned formName and workItemId
        if(this.formName!==undefined && this.workItemId!==undefined){ 
        
            if(this.formName == i18nModel.getResourceBundle().getText("EDCValue")){ // If the detail page opened for ECD request
                this.url =  HR.i18n.URL.EmployeeDataChangeDetails.employeeDataChangeForm(this.workItemId);
            }
            else if (this.formName == i18nModel.getResourceBundle().getText("ContractExtensionValue")){ // If the detail page opened for Contract request
                this.url = HR.i18n.URL.EmployeeDataChangeDetails.contractExtensionForm(this.workItemId);
            }
            else if (this.formName == i18nModel.getResourceBundle().getText("TerminationValue")){ // If the detail page opened for Termination request
                this.url =HR.i18n.URL.EmployeeDataChangeDetails.terminationForm(this.workItemId);
            }
            HR.util.Busy.setBusyOn(true); 
            //Fetch the request details from backend
            $.getJSON(this.url, function (data) {
                oModelRequestDetails.setData(data);
                // Setting the properties with data fetched from backend
                that.employeeType= data.d.I0001Persg;
                that.paidIntern =  data.d.I0001Persk;
                that.salesEmpNew = data.d.SalesEmpNew; // For Target Commission if employee is sales employee or his job code has changes to Sales emp
                that.RSUapplicableNew = HR.i18n.User.checkRSU(data) ; // To check if RSU is applicable for the user
                that.StocksApplicableNew =  HR.i18n.User.checkStocksOptions(data);  // To check if Stock options are applicable for the user
		        loadForm(data, that);
		        HR.util.Busy.setBusyOff(); //Hiding busy indicator after the form is loaded
		    }).error(function(err) { 
		        HR.util.Busy.setBusyOff();
		        that.goBack();
                sap.m.MessageToast.show(err.responseJSON.error.message.value, {closeOnBrowserNavigation: false});
		    });
        }
        
        // Binding data with the view 
        var loadForm = function(data,that){
            var headerModel = new sap.ui.model.json.JSONModel();
            //Setting data in the model for the header details
            headerModel.setData(data);
        // For EDC request details
        if(that.formName == i18nModel.getResourceBundle().getText("EDCValue")){
            that.getView().byId("edits-contract").setVisible(false);
            that.getView().byId("edits-termination").setVisible(false);
            that.getView().byId("edits-ecd").setVisible(true);
            that.setECDFieldsVisible(); 
            that.getView().byId("processSteps").setModel(headerModel) ;
        }
        
        //For Contractor/Extension request details
        if(that.formName == i18nModel.getResourceBundle().getText("ContractExtensionValue")){
            that.getView().byId("edits-ecd").setVisible(false);
            that.getView().byId("edits-termination").setVisible(false);
            that.getView().byId("edits-contract").setVisible(true);
            that.setContractFieldsVisible();
            that.getView().byId("processSteps").setModel(headerModel);
        }
        
        // For Termination request details
        else if(that.formName == i18nModel.getResourceBundle().getText("TerminationValue")){
            that.getView().byId("edits-ecd").setVisible(false);
            that.getView().byId("edits-contract").setVisible(false);
            that.getView().byId("edits-termination").setVisible(true);
            that.setTerminationFieldsVisible();
            that.getView().byId("processSteps").setModel(headerModel);
        }
        if((that.setHeaderInfo(headerModel,that.formName, that.workItemId))==true){
             //bind data to edits table
             that.setEditsInfo(headerModel, that.formName, that.workItemId); 
        }
        }
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
    checkRole: function(){
        var results = sap.ui.getCore().getModel("loggedUser").getData().d.results ;
        for(var count=0 ; count<results.length; count++){
            if(results[count].InitiatorRole===HR.i18n.User.Roles.ExecutiveAdmin){
               return false;
            }
        }
        return true;
    },
    //Set all the ECD fields visible by default and hide whenever required
    setECDFieldsVisible : function(){
        this.getView().byId("ManagerField").setVisible(true);
        this.getView().byId("PeopleManagerField").setVisible(true);
        this.getView().byId("CostCenterField").setVisible(true);
        this.getView().byId("OfficeField").setVisible(true);
        this.getView().byId("JobCodeField").setVisible(true);
        this.getView().byId("JobTitleField").setVisible(true);
        this.getView().byId("PositionTitleField").setVisible(true);
        this.getView().byId("JobLevelField").setVisible(true);
        this.getView().byId("AnnSalaryField").setVisible(false);
        this.getView().byId("TargetCommField").setVisible(false);
        this.getView().byId("RSUField").setVisible(false);
        this.getView().byId("StockOptionField").setVisible(false);
        this.getView().byId("LeaderField").setVisible(true);
        this.getView().byId("LaborClassField").setVisible(true);
    },
    
    //Set all the Contractor fields visible by default and hide whenever required
    setContractFieldsVisible: function(){
        this.getView().byId("ContractTypeField").setVisible(true);
        this.getView().byId("ContractEndDateField").setVisible(true);
    },
    
    //Set all the Termination fields visible by default and hide whenever required
    setTerminationFieldsVisible: function(){
        this.getView().byId("TerminationReasonField").setVisible(true);
        this.getView().byId("TerminationDateField").setVisible(true);  
        this.getView().byId("LastDayWorkedField").setVisible(true); 
        this.getView().byId("RehireEligibilityField").setVisible(true);  
        this.getView().byId("NotificationDateField").setVisible(true);  
    },
    
    //Setting details in the header
    setHeaderInfo: function(model,formName,wiID)
    {
        this.getView().byId("header").setModel(model); 
        this.getView().byId("edits-contract").setVisible(false);
        this.getView().byId("edits-ecd").setVisible(false);
        this.getView().byId("edits-termination").setVisible(false);
        
        if(model.getData()) // If model contains data
        {  
            if(formName == i18nModel.getResourceBundle().getText("EDCValue")){
                this.getView().byId("processSteps").setVisible(true);
                this.getView().byId("edits-ecd").setVisible(true);
                //For EDC form show only name, designation and id - set showMoredetails false
                this.getView().byId("header").setProperty("showMoreDetails",false); 
                //Binding respective properties name and title with ECD data
                this.getView().byId("header").bindProperty("title","/d/I0001PtextCurr");
                this.getView().byId("header").bindProperty("name","/d/EmployeeName") ;
            }
            else if(formName == i18nModel.getResourceBundle().getText("ContractExtensionValue")){
                //For Contrator show more details will be true
                this.getView().byId("header").setProperty("showMoreDetails",true);
                //Bind respective properties name and title with contractor data
                this.getView().byId("header").bindProperty("title","/d/I0001Ptext");
                this.getView().byId("header").bindProperty("name","/d/I0001Ename") ;
                //Hide Process steps for the Contractor and Termination forms
                this.getView().byId("processSteps").setVisible(true);
                //Show Contrator's Edits info table 
                this.getView().byId("edits-contract").setVisible(true);
            }
            else if(formName == i18nModel.getResourceBundle().getText("TerminationValue")){
                 //For Contrator show more details will be true
                this.getView().byId("header").setProperty("showMoreDetails",true);
                //Bind respective properties name and title with contractor data
                this.getView().byId("header").bindProperty("title","/d/I0001Ptext");
                this.getView().byId("header").bindProperty("name","/d/I0001Ename") ;
                //Hide Process steps for the Contractor and Termination forms
                this.getView().byId("processSteps").setVisible(true);
                //Show Termination's edit info table
                this.getView().byId("edits-termination").setVisible(true);
            }
        }
        return true;
    },
    
    setEditsInfo: function(editsModel, formName,workItemId)
    {
        //Comparisons for EDC edits table
        if(formName == i18nModel.getResourceBundle().getText("EDCValue")){
            
            if(editsModel.getData().d)
            {  
            var results = editsModel.getData().d;
            // if manager's current and proposed value is same or the proposed value is empty
            if((results.ManagerPersonIdCurr===results.ManagerPersonIdNew)||(results.ManagerPersonIdNew=="")){
                    this.getView().byId("ManagerField").setVisible(false);
            }
            // If the proposed value doesn't exist for people manager
            if(results.PeopleMngrNew==""){
                    this.getView().byId("PeopleManagerField").setVisible(false);
            }
            // if cost center's current and proposed value is same or the proposed value is empty
            if((results.I0001KostlCurr==results.I0001KostlNew) || (results.I0001KostlNew=="")){
                    this.getView().byId("CostCenterField").setVisible(false);
            }
            // If the proposed value doesn't exist for office location
            if(results.I0001BtrtlNew==""){
                    this.getView().byId("OfficeField").setVisible(false);
            }
            //If the job code is not changed
            if((results.I0001StellCurr==results.I0001StellNew)|| (results.I0001StellNew=="00000000")){
                    this.getView().byId("JobCodeField").setVisible(false);
                    this.getView().byId("JobTitleField").setVisible(false);
                    this.getView().byId("JobLevelField").setVisible(false);
                    this.getView().byId("ManagerLevelField").setVisible(false);
                    //if position title is changed - then only display
                    if((results.I0001PtextCurr!==results.I0001PtextNew) && (results.I0001PtextNew!=="")){
                        this.getView().byId("PositionTitleField").setVisible(true);
                    }
                    else{
                        this.getView().byId("PositionTitleField").setVisible(false);
                    }
            }
            //if job code is changed
            if((results.I0001StellCurr!==results.I0001StellNew) && (results.I0001StellNew!=="00000000")){
                    this.getView().byId("JobCodeField").setVisible(true);
                    this.getView().byId("JobTitleField").setVisible(true);
                    this.getView().byId("JobLevelField").setVisible(true);
                    this.getView().byId("ManagerLevelField").setVisible(true);
                    
                    //if position title is changed - then only display
                    if((results.I0001PtextCurr!==results.I0001PtextNew) && (results.I0001PtextNew!=="")){
                        this.getView().byId("PositionTitleField").setVisible(true);
                    }
                    else{
                        this.getView().byId("PositionTitleField").setVisible(false);
                    }
            }
            //Check if annual salary is applicable
            
            if(this.roleCheck()==true && (that.isEmployee || that.employeeType!==HR.i18n.User.Roles.ProvisionalWorker ||(that.employeeType===HR.i18n.User.Roles.Intern && that.paidIntern===HR.i18n.User.Roles.PaidIntern))){
                    this.getView().byId("AnnSalaryField").setVisible(true);
                    if((results.CurrAnsal==results.NewAnsal)|| (results.NewAnsal==" ") || (results.NewAnsal==0)){ // If annual salary is not changed
                        this.getView().byId("AnnSalaryField").setVisible(false);
                    }
                    
                    //If employee is sales employee or his job code is changed to a sales job code salesEmpNew will be X - show the TC field
                    if(that.salesEmpNew=="X" && results.NewCommision!=="") {  
                        this.getView().byId("TargetCommField").setVisible(true);
                    }
                    //If RSU is applicable and is changes to some defined value - show the RSU field
                    if (that.RSUapplicableNew == true && results.I0761RsuNew!=0.00){
                         this.getView().byId("RSUField").setVisible(true);
                    }
                    //If Stock options are applicable and changed to some defined value - show the Stocks field
                    if (that.StocksApplicableNew == true && results.I0761StockNew!=0.00){
                         this.getView().byId("StockOptionField").setVisible(true);
                    }
            }
            
            // If leader is not changed
            if((results.I0001ZzldridCurr==results.I0001ZzldridNew) || (results.I0001ZzldridNew=="")){
                    this.getView().byId("LeaderField").setVisible(false);
            }
            
            // If Labor Class field is empty
            if((results.I9034DirectNew=="") && (results.I9034IndirectNew=="")) {
                    this.getView().byId("LaborClassField").setVisible(false);
            }
             //If Direct Curr or New is returning true set Labor Classification as DL
            if(results.I9034DirectNew!==""){
                    this.getView().byId("labourClass-new").setProperty("text","DL");
            }
            //If Indirect Cuu or new is returing true set Labor class as IDL
            else if(results.I9034IndirectNew!==""){
                    this.getView().byId("labourClass-new").setProperty("text","IDL");
            }
            } // end of comparisons
            
            // Bind edited data to ECD edits table
            this.getView().byId("edits-ecd").setModel(editsModel);
        
        }// end of edc edits
        
        //IF form type is contractor - apply validations
        else if (formName == i18nModel.getResourceBundle().getText("ContractExtensionValue")){
            if(editsModel.getData().d)  // If some data is changed
            { 
                var results = editsModel.getData().d;
            //Check If contract type field is changed - show the field if yes
            if((results.I0016CttypCurr==results.I0016CttypNew) || (results.I0016CttypCurr=="") || (results.I0016CttypNew=="") ||(results.I0016CttypCurr==0)|| (results.I0016CttypNew==0)){
                    this.getView().byId("ContractTypeField").setVisible(false);
            }
            //Check if contract date field is changed - show the field if yes
             if((results.I0016CtedtCurr==results.I0016CtedtNew) || (results.I0016CtedtCurr=="") || (results.I0016CtedtNew=="") ||(results.I0016CtedtCurr==0)|| (results.I0016CtedtNew==0)){
                    this.getView().byId("ContractEndDateField").setVisible(false);
            }
            }
            //Bind the edited data to Contractor edits table
            this.getView().byId("edits-contract").setModel(editsModel);  
        }
        
        else{ //Check for the Termination data changes
            if(editsModel.getData().d){ //If data is defined
                var results = editsModel.getData().d;
                //If some field is null - hide the field
                if(results.Massg==null){
                    this.getView().byId("TerminationReasonField").setVisible(false);
                }  
                if(results.TermDate==null){  
                    this.getView().byId("TerminationDateField").setVisible(false);  
                }
                if(results.LastDayWorked==null){
                    this.getView().byId("LastDayWorkedField").setVisible(false);  
                }
                if(results.RehireEligibility==null){
                    this.getView().byId("RehireEligibilityField").setVisible(false);  
                }
                if(results.IlNoticeDate==null){
                    this.getView().byId("NotificationDateField").setVisible(false);  
                }
            this.getView().byId("edits-termination").setModel(editsModel);   
            }
        }
    },
    setProperties: function(){
            this.employeeType= "";
            this.isEmployee= false;
            this.paidIntern = "";
            this.salesEmpNew = "";  
            this.RSUapplicableNew = false;
            this.StocksApplicableNew = false; 
	},
    goBack: function()
    {
        //When user clicks Ok button, navigate back to My Requests page
        if(this.requestFromPage==="MyRequests"){
            this._router.navTo("MyRequests");
        } 
        else if (this.requestFromPage==="StatusReports"){
           this._router.navTo("StatusReport",{flag:true});
        }
        else if(this.requestFromPage==="EcdHistory"){
            window.history.back();
        } 
    }
});