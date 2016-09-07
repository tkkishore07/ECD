sap.ui.controller("HR.view.EmployeeSearch", {	
    count: 12,
    employeeID: null,
    page: undefined,
    onInit: function(evt){
        this._router = sap.ui.core.UIComponent.getRouterFor(this);
        this.totalReporteesData = {results:[]};
        if(sap.ui.core.Core().getModel("directReportees")!=undefined)
            this.totalReporteesData = jQuery.extend({}, new sap.ui.core.Core().getModel("directReportees").getData().d);
        this._router.getRoute("EmployeeSearch").attachPatternMatched(this._routePatternMatched, this);
        this.getView().byId("search").setPlaceholder(HR.i18n.Messages.EmployeeSearch.search);
    },

    _routePatternMatched: function(oEvent) {
            if(this.page===undefined)
		    this.page= parseInt(oEvent.getParameter("arguments").pageNum);
		    this.pagination(0);
	},
    openMenu: function(evt){ //anupriya - start
            var value;
            this.employeeID = evt.getSource().getPernrID();
            var initiatorRole = HR.i18n.User.Roles.find(this.employeeID);
            this.employeeType = this.checkEmployeeType(this.employeeID,initiatorRole);
            var westValley = this.checkEmployeeRole(this.employeeID);
            if(initiatorRole!==undefined){ 
                this.employeeRole = initiatorRole;
            }
            else{
                 this.employeeRole = westValley; 
            }
            if(initiatorRole===undefined) return;
            var oButton = evt.getSource();
            if (!this._actionSheet) {
                this._actionSheet = sap.ui.xmlfragment("HR.view.EmployeeMenu",this );
                var i18nModel = sap.ui.getCore().getModel("i18n");
                this._actionSheet.setModel(i18nModel, "i18n"); 
                this.getView().addDependent(this._actionSheet);
            }
            //reseting the state of buttons on click of new employee
            var buttons = this._actionSheet.getButtons();
            for(var count=0; count<buttons.length;count++)
            {
                if(buttons[count].getVisible()!=true){
                    sap.ui.getCore().byId(buttons[count].sId).setVisible(true);
                }
            }
            if((HR.util.FormAccess.EmployeeDataChange(initiatorRole, this.employeeType, westValley)!==true)){ //if not true hide edc tab
               
                value =sap.ui.getCore().getModel("i18n").getResourceBundle().getText("valueForEDCButton");
                this.hideActionItems(this._actionSheet,value,buttons);
            }  
            if(HR.util.FormAccess.Termination.noPermissionToAccess(initiatorRole) ||
             !HR.util.FormAccess.Termination.onlyWestValley(initiatorRole,this.employeeType, westValley)){
                
                value =sap.ui.getCore().getModel("i18n").getResourceBundle().getText("valueForTerminationButton");
                this.hideActionItems(this._actionSheet,value,buttons);
            }
            if(!HR.util.FormAccess.ContractInternExtension.onlyContractorsInterns(initiatorRole,this.employeeType) ||
               !HR.util.FormAccess.ContractInternExtension.onlyWestValley(initiatorRole,this.employeeType, westValley)){
             
                value =sap.ui.getCore().getModel("i18n").getResourceBundle().getText("valueForContractorButton");
                this.hideActionItems(this._actionSheet,value,buttons);
            }
            
            this._actionSheet.openBy(oButton);
            
    },
    
    //hiding the tabs which should not be shown based on role
    hideActionItems: function(actionSheet,value,buttons) 
    {
        for(var count=0; count<buttons.length;count++)
                {
                    if(buttons[count].getText()== value)
                    {
                        sap.ui.getCore().byId(buttons[count].sId).setVisible(false);
                    }
                }
    },
    
    //checking employeeType of the employee who has been clicked
    checkEmployeeType: function(employeeID,initiatorRole){  
        if(this.totalReporteesData !==null && this.totalReporteesData.results !==null) 
        for (var count=0; count<this.totalReporteesData.results.length; count++){
            if(this.totalReporteesData.results[count].Pernr.replace(/^0+/, '')== employeeID.replace(/^0+/, '')){
               return this.totalReporteesData.results[count].Persg.replace(/^0+/, '');
            }
        }
    }, 
    checkEmployeeRole: function(employeeID){   
        if(this.totalReporteesData !==null && this.totalReporteesData.results !==null) 
        for (var count=0; count<this.totalReporteesData.results.length; count++){
            if(this.totalReporteesData.results[count].Pernr.replace(/^0+/, '')== employeeID.replace(/^0+/, '')){
               return this.totalReporteesData.results[count].Role;
            }
        }

    },

    EmployeeDataChange: function(evt){
            this._router.navTo("EmployeeDataChange", { ID:this.employeeID, status:"new", workItemId: "0" });
    },
    ContractInternExtension: function(evt){
            this._router.navTo("ContractInternExtension", { ID:this.employeeID, status:"new", workItemId: "0" });
    },
    Termination: function(evt){
            this._router.navTo("Termination", { ID:this.employeeID, status:"new",workItemId: "0"  });
    },
    ViewProfile: function(evt){
            this._router.navTo("ViewProfile",{ID: this.employeeID, employeeType: this.employeeType, employeeRole: this.employeeRole} );
    },
	pagination: function(num){
	        this.page=this.page+num;  
            //changing the URL hash
            var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
            var hash = oHashChanger.getHash();
            oHashChanger.setHash(hash.substr(0, 1+hash.lastIndexOf('/'))+this.page);
            var startCount = this.count*(this.page-1);
            var endCount = startCount+this.count;

            var totalCount = this.totalReporteesData.results.length;
            if(endCount>totalCount) endCount=totalCount;
            var newData = this.totalReporteesData.results.slice(startCount,endCount);
            this.getView().byId("container").setModel(new sap.ui.model.json.JSONModel({"results": newData}));
           
           if(this.totalReporteesData.results.length>this.count){
            //displaying the footer info
            if(this.page>1) this.getView().byId("Previous").setVisible(true);
            else this.getView().byId("Previous").setVisible(false);
            if(endCount== totalCount) this.getView().byId("Next").setVisible(false);
            else this.getView().byId("Next").setVisible(true);
            this.getView().byId("Displaying").setVisible(true);
            this.getView().byId("Displaying").setText("Displaying "+(startCount+1)+"-"+(endCount)+" out of "+ totalCount);
            }
            
            else{
                this.getView().byId("Displaying").setVisible(false);
                this.getView().byId("Previous").setVisible(false);
                this.getView().byId("Next").setVisible(false);
            }
    }, //anupriya
    
    onSearch: function(evt)
    {

        var sValue = evt.getSource().getValue();
        var roleResults = sap.ui.core.Core().getModel("loggedUser").getData().d.results;
        roleResults = HR.i18n.User.Roles.order();
        var initiatorRole;
        var personId = sap.ui.core.Core().getModel("loggedUser").getData().d.results[0].PersonId; 
        var managerPernr = sap.ui.core.Core().getModel("loggedUser").getData().d.results[0].Pernr; 
	    var aFilter = [];  // returns what need to be shown on screen
        if(this.page!=1) this.page=1; //to enable search from 2nd page or more
        if(sValue.length==0){
            if(sap.ui.core.Core().getModel("directReportees")!==undefined )
                this.totalReporteesData =jQuery.extend({}, new sap.ui.core.Core().getModel("directReportees").getData().d);
            else this.totalReporteesData = {results:[]};
            this.pagination(0);   
        }
        else if(sValue.length<3){
            sap.m.MessageToast.show(HR.i18n.Messages.EmployeeSearch.min3chars);
        }
        else if(sValue.length>=3) {
            this.roleCount=0; 
            this.roleTotal=roleResults.length; 
            this.getView().byId("busyIndicator").setVisible(true);
            this.getView().byId("container").setVisible(false);
            for(var roleCount=0; roleCount<roleResults.length; roleCount++) {
                        initiatorRole = roleResults[roleCount]; 
                        if(initiatorRole==HR.i18n.User.Roles.Manager) aFilter = this.searchDirectReportees(sValue, aFilter);
                        var that=this;
                        $.ajax({
                          url: HR.i18n.URL.EmployeeSearch.getSearchedReportees(managerPernr,initiatorRole,sValue),
                          dataType: 'json',
                          async: true,
                              success: function(data) {
                                var remoteReporteesData = data.d.results;
                                for (var count=0; count<remoteReporteesData.length; count++){ 
                                    var alreadyPresent=false; //to avoid repetition 
                                    for(var i = 0 ; i< aFilter.length; i++){
                                        if(aFilter[i].Pernr.replace(/^0+/, '')=== remoteReporteesData[count].Pernr.replace(/^0+/, '')){
                                            if(aFilter[i].Indirect==="X"){ //indirect reportee has least precedence over other roles
                                                aFilter[i] = remoteReporteesData[count];
                                            }
                                            alreadyPresent=true;
                                            break;
                                        }
                                    }
                                    if(!alreadyPresent) aFilter.push(remoteReporteesData[count]);
                                }
                              },
                              error: function(err){
                                  HR.util.General.error(err.responseJSON.error.message.value);
                              }
                        }).done(function(){
                            that.roleCount+=1;
                            if(that.roleCount==that.roleTotal){
                                that.getView().byId("container").setVisible(true);
                                that.getView().byId("busyIndicator").setVisible(false);
                                if(aFilter.length==0) {
                                    sap.m.MessageToast.show(HR.i18n.Messages.EmployeeSearch.noSearchResults);
                                }
                                else{
                                    that.totalReporteesData.results=aFilter;
                                    var oModel = new sap.ui.model.json.JSONModel();
                                    oModel.setData(aFilter);
                                    sap.ui.getCore().setModel(oModel, "EmployeeSearch");
                                    that.pagination(0); 
                                }
                            }
                        });
                    
            }
        }
    },
    paginationStr: function(evt){
       this.pagination(parseInt(evt.getSource().data().data));
    },
    
    //anupriya - start
    filterData: function(sValue,data, aFilter) {
            if(sValue.length>=3){  
                for(var count=0; count<data.length; count++){   
                    var value;
                    if(isNaN(sValue)) value = data[count].I0001Ename;
                    else value = data[count].Pernr;
                    if(value.toUpperCase().indexOf(sValue.toUpperCase())>= 0){
                        aFilter.push(data[count]);
                    }
                }
            }
            return aFilter;
	},
   
    
    searchDirectReportees: function(sValue, aFilter)
    {       
            var directReportees = sap.ui.getCore().getModel("directReportees").getData().d.results;  
	        return this.filterData(sValue,directReportees, aFilter); // to filter the directReportees data on basis of sValue
    },
    
    //anupriya - end  
    showMaster: function(){
		this._router.navTo("Menu");
    }
});