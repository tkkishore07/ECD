jQuery.sap.declare("HR.i18n.User");
HR.i18n.User = {
    Roles:{
        Manager: "HRASRB",
        HRBP: "ZHRBP",
        HRIS: "ZHRIS",
        Compensation: "ZCOMP",
        VP: "ZVP",
        ExecutiveAdmin: "ZEA",
        WestValley: "ZWV",
        HRAdmin: "HRADMIN",
        Contractor: "C",
        Intern: "I",
        Employee: "R",
        TemporaryWorker: "T",
        OutsideServices: "U",
        Consultant: "L",
        ProvisionalWorker: "P", 
        BatchOnly: "B",
        PaidIntern: "IP",
        
        order: function(){
                var returnValue=[]; 
                var loginDetails= sap.ui.getCore().getModel("loggedUser").getData(); // fetching the logged in user details
                var roles=[];
                
                for(var roleCount=0; roleCount<loginDetails.d.results.length; roleCount++){
                    roles.push(sap.ui.getCore().getModel("loggedUser").getData().d.results[roleCount].InitiatorRole);
                }
                if($.inArray(HR.i18n.User.Roles.Manager, roles) !=-1){ 
                    returnValue.push(HR.i18n.User.Roles.Manager);
                }
                if ($.inArray(HR.i18n.User.Roles.HRBP, roles) != -1){ 
                    returnValue.push(HR.i18n.User.Roles.HRBP);
                }
                if ($.inArray(HR.i18n.User.Roles.HRIS, roles) != -1){ 
                    returnValue.push(HR.i18n.User.Roles.HRIS);
                }
                if ($.inArray(HR.i18n.User.Roles.HRAdmin, roles) != -1){ 
                    returnValue.push(HR.i18n.User.Roles.HRAdmin);
                }
                if ($.inArray(HR.i18n.User.Roles.ExecutiveAdmin, roles) != -1){ 
                    returnValue.push(HR.i18n.User.Roles.ExecutiveAdmin);
                }
                if ($.inArray(HR.i18n.User.Roles.Compensation, roles) != -1){ 
                    returnValue.push(HR.i18n.User.Roles.Compensation);
                }
                if ($.inArray(HR.i18n.User.Roles.WestValley, roles) != -1){ 
                    returnValue.push(HR.i18n.User.Roles.WestValley);
                }
                return returnValue;
        },
        find: function(employeeID){ 
            var oModelLoginDetails = new sap.ui.model.json.JSONModel();
            try{ //check if the model is present, or else load the model //bug fix 6/5/2015 //senthil
                sap.ui.getCore().getModel("loggedUser").getData();
            }
            catch(err){
                oModelLoginDetails.loadData(HR.i18n.URL.EmployeeSearch.getLoginDetails,null,false,"GET",false,false,null);
                sap.ui.getCore().setModel(oModelLoginDetails ,"loggedUser");
            }

            var roles = HR.i18n.User.Roles.order(roles);
            
            if(employeeID==undefined) return roles; //for App.js file
            var returnValue;    
            for(var roleCount=0; roleCount<roles.length; roleCount++){            
                if(roles[roleCount]===HR.i18n.User.Roles.Manager){ //checking if the employee is a direct reportee, then return "Manager"
                    var directReportees = sap.ui.getCore().getModel("directReportees").getData().d.results;
                    for (var count=0; count<directReportees.length; count++){
                       if(directReportees[count].Pernr.replace(/^0+/, '')== employeeID.replace(/^0+/, '')) {
                            return HR.i18n.User.Roles.Manager;
                        }
                    }
                }
                else{
                    if(sap.ui.getCore().getModel("EmployeeSearch")!==undefined){
                        var searchResults = sap.ui.getCore().getModel("EmployeeSearch").getData(); 
                        for (var count=0; count<searchResults.length; count++){
                           if(searchResults[count].Pernr.replace(/^0+/, '')== employeeID.replace(/^0+/, '') && searchResults[count].Indirect!=="X") {
                                return searchResults[count].Role;
                            }
                        }
                    }
                    else{
                        var resultData;
                        $.ajax({
                              url: HR.i18n.URL.EmployeeSearch.getSearchedReportees(sap.ui.getCore().getModel("loggedUser").getData().d.results[0].Pernr,roles[roleCount],employeeID),
                              dataType: 'json',
                              async: false,
                              success: function(data) {
                                resultData=data;
                              },
                              error: function(err){
                                  HR.util.General.error(err.responseJSON.error.message.value);
                              }
                        });    
                        if(resultData.d.results.length>0 && resultData.d.results[0].Indirect!=="X") return roles[roleCount];
                    }
                }
            }
            return;
        }
    },
    Locations:{ 
        isIsrael: function(I0001Btrtl){
            if(I0001Btrtl!=="" && I0001Btrtl!=="undefined" && I0001Btrtl.substring(0,2)=='IL')
                return true;
            return false;    
        },
        isSdssSdsm:function(I0001BtrtlCurr){
            if(I0001BtrtlCurr!=="" && I0001BtrtlCurr!=="undefined" && I0001BtrtlCurr.substring(0,2)=='MY' || I0001BtrtlCurr.substring(0,2)=='CN')
                return true;
            return false;    
        }
    },
    VoluntaryTerminations: ["04", "06", "08", "09", "11", "14", "17", "34"],
    isManagerOrAbove: function(I1010Hilfm){
        try{ if(parseInt(I1010Hilfm)>=2) return true; } catch(err){return false;}
        return false;
    },
    isVpOrAbove: function(I1010Hilfm){
        try{ if(I1010Hilfm==="00B" || parseInt(I1010Hilfm)>=8) return true; } catch(err){return false;}
        return false;
    },
    isSalesRelated: function(SalesEmp ){
        if(SalesEmp=="X") return true;
        return false;
    },
    isPartTimeEmployee: function(PartTimeEmp ){
        if(PartTimeEmp=="X") return true;
        return false;
    },
    isRsuApplicable: function(I1010Hilfm){
        try{ if( I1010Hilfm==="00A" || I1010Hilfm==="00B" || parseInt(I1010Hilfm)>=5) return true; } catch(err){return false;}
        return false;
    },
    isRemoteLocation: function(RemoFlag){
        if(RemoFlag=="X")
            return true;
        return false; 
    },
    checkRSU: function(data){
        if(data.d.I1051JcodeNew!==""){ // if job code has changed
            if(data.d.I1010HilfmNew!==""){ // if new employee level is available
                return HR.i18n.User.isRsuApplicable(data.d.I1010HilfmNew);
            }
        }
        else{ // if no change in job code
            return HR.i18n.User.isRsuApplicable(data.d.I1010HilfmCurr);
        }
    },
    checkStocksOptions:  function(data){
        if(data.d.I1051JcodeNew!==""){ // if job code has changed
            if(data.d.I1010HilfmNew!==""){ // if new employee level is available
                return HR.i18n.User.isVpOrAbove(data.d.I1010HilfmNew);
            }
        }
        else{ // job code not changed
                return HR.i18n.User.isVpOrAbove(data.d.I1010HilfmCurr);
        }
    }
    
};
