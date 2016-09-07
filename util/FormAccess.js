jQuery.sap.declare("HR.util.FormAccess");
HR.util.FormAccess = {
        EmployeeDataChange: function(role, employeeType, I0016Kontx){
            if(role===undefined) return false;
            if(
               role==HR.i18n.User.Roles.Manager ||
               role==HR.i18n.User.Roles.ExecutiveAdmin ||
               role==HR.i18n.User.Roles.HRBP ||
               role==HR.i18n.User.Roles.HRIS ||
               role==HR.i18n.User.Roles.Compensation
            ){
                return true;
            }
            else if(role===HR.i18n.User.Roles.WestValley && employeeType=="I"){
                return true;
            }
            else if(role===HR.i18n.User.Roles.WestValley && employeeType!=="I" && (I0016Kontx==="West Val"||I0016Kontx===HR.i18n.User.Roles.WestValley)) return true;
            return false;
        },
        Termination:{
            noPermissionToAccess: function(role){ 
                if(role===undefined) return true;
                if(role==HR.i18n.User.Roles.Manager || role ==HR.i18n.User.Roles.HRIS || role == HR.i18n.User.Roles.HRBP || role ==HR.i18n.User.Roles.ExecutiveAdmin || role==HR.i18n.User.Roles.WestValley){
                    return false;
                }
                return true;
            },
            onlyWestValley: function(role, employeeType, I0016Kontx){
                if(role===undefined) return false;
                else if(role===HR.i18n.User.Roles.WestValley && employeeType=="I"){
                    return true;
                }
                else if(role===HR.i18n.User.Roles.WestValley &&  employeeType!=="I" && (I0016Kontx!=="West Val"&& I0016Kontx!==HR.i18n.User.Roles.WestValley))
                    return false;
                return true;
            }
        },
        ContractInternExtension:{
            onlyContractorsInterns: function(role, employeeType){
                if(role===undefined) return false;
                if(role===HR.i18n.User.Roles.Manager || role ===HR.i18n.User.Roles.HRIS || role === HR.i18n.User.Roles.HRBP || role ===HR.i18n.User.Roles.ExecutiveAdmin){
                    if(!(employeeType==HR.i18n.User.Roles.Contractor || employeeType==HR.i18n.User.Roles.Intern || employeeType==HR.i18n.User.Roles.WestValley || 
                       employeeType==HR.i18n.User.Roles.TemporaryWorker || employeeType==HR.i18n.User.Roles.OutsideServices || 
                       employeeType==HR.i18n.User.Roles.Consultant || employeeType==HR.i18n.User.Roles.BatchOnly || employeeType==HR.i18n.User.Roles.ProvisionalWorker)){
                        return false;
                    }
                }
               return true; 
            },
            onlyWestValley: function(role, employeeType, I0016Kontx){
                if(role===undefined) return false;
                else if(role===HR.i18n.User.Roles.WestValley && employeeType=="I"){
                    return true;
                }
                else if(role===HR.i18n.User.Roles.WestValley && employeeType!=="I" && (I0016Kontx!=="West Val"&& I0016Kontx!==HR.i18n.User.Roles.WestValley))
                    return false;
                return true;
            }
        }
       
};



