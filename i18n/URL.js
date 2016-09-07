jQuery.sap.declare("HR.i18n.URL");
HR.i18n.URL = {
    EmployeeSearch:{
        getLoginDetails:"/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_SEARCH_SRV/ZMGRROLESET?$filter=PersonId eq ''&$format=json",
        
        getDirectReportees: function(managerPernr)
        {
           return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_SEARCH_SRV/ZMGRDIRREPORTEESET?$filter=ManagerPernr eq '"+managerPernr+"'&$format=json";
        },
        getSearchedReportees: function(managerPernr,initiatorRole,sValue) {
             return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_SEARCH_SRV/ZMGRREPSEARCHSET?$filter=ManagerPernr eq '"+managerPernr+"' and Role eq '"+initiatorRole+"' and Search eq '"+sValue+"'";
        }
    },
    MyRequests: {
        getRequestDetails: function(toDate,fromDate,managerPernr) {
             return  "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_REQUESTS_SRV/ZMYREQUESTSET/?$filter=ToDate eq datetime'"+toDate+"' and FromDate eq datetime'"+fromDate+"' and Pernr eq '"+managerPernr+"'&$format=json";
        },
        
        onWithdrawOrDiscard:   {
            entity: "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_REQUESTS_SRV",
            link: function(wiID,event)
            {
               return "/ZMYREQEVENTSET(WiID='"+wiID+"',Event='"+event+"')";
            }
        },
        
        onCopy: function(wiID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_REQUESTS_SRV/ZMYREQCOPYECDSET(WiID='"+wiID+"')";
        }
    },
    
    EmployeeDataChangeDetails: {
        
        employeeDataChangeForm:  function(wiID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZECDEVENTSET(WiID='"+wiID+"')/?$expand=ZSHOWAPPROVALSet&$format=json"
        },
        contractExtensionForm : function(wiID){
             return "/sap/opu/odata/sap/ZHCM_NECD_GW_CONTRACT_EXTN_SRV/ZCONTRACTEVENTSET(WiID='"+wiID+ "')/?$expand=ZSHOWAPPROVALSet&$format=json";
        },
        
        terminationForm: function(wiID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_TERMINATION_SRV/ZTERMIEVENTSET(WiID='"+wiID+"')/?$expand=ZSHOWAPPROVALSet&$format=json";
        },
    },
    EmployeeDataChange:{
        getDetails : function(employeeID, InitiatorRole){ //should tell job code, manager level or not, remote location or not..
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZECDSENDSET(Pernr='"+employeeID+"',InitiatorRole='"+InitiatorRole+"')/?$format=json";
        },
        getDetailsSavedForm : function(ecdID,initiatorRole){
           // return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZECDSENDSET(Pernr='7391',InitiatorRole='HRASRB')/?$format=json";
           return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZECDSENDSET(Pernr='"+ecdID+"',InitiatorRole='"+initiatorRole+"')/?$format=json";
        },
        saveSubmit: {
            entity:"/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV",
            link: function(status){
                if(status==="new") return '/ZECDSENDSET';
                else if(status==="saved") return '/ZECDSENDSET';
                else if(status==="copy") return '/ZECDSENDSET';
            } 
        },
        getManager: function(sValue,effdate){ 
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZMGRDETAILSET?$filter=Input eq '"+sValue+"' and Effdate eq datetime'"+effdate+"'&$format=json";
        },
        getCostCenter: function(Bukrs, Prctr, Kostl, effdate){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZCOSTCNTRSET?$filter=Kostl eq '"+Kostl+"' and Bukrs eq '"+Bukrs+"' and Prctr eq '"+Prctr+"'  and Effdate eq datetime'"+effdate+"'&$format=json";
        },
        getProfitCenter:function(I0001Bukrs){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZPROFITCENTERSET?$filter=Bukrs eq '"+I0001Bukrs+"'&$format=json";
        },
        getManagerProfitCenter:function(managerPernr){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZMNGRPROFITCENTERSET?$filter=MngrID eq '"+ managerPernr +"'&$format=json";
        },
        getOfficeLocations: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZPERSSUBAREASET?$filter=Persa eq '*'",
        getLeader: function(managerNumber)
        {
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZMGRREPORTEESET?$filter=ManagerNumber eq '"+managerNumber+"'&$format=json";
        },
        getJobTrack: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZECDTRACKSET",
        getJobFamily: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZJOBFAMILYSET",
        getJobGroup: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZFUNCTIONSET",
        getJobCode: function(jobCode, jobGroup, jobTrack, jobFamily) {
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZJOBCODSET?$filter=JobGrp eq '"+jobGroup+"' and JobAbbr eq '"+jobCode+"'and JobTrack eq '"+jobTrack+"' and JobFamily eq '"+jobFamily+"'";
        },
        getApprovalPath: function(refNum){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZSHOWAPPROVALSET?$filter=RefNum eq '"+refNum+"'&$format=json";
        },
        getBackendReview: function(Pernr, EffectiveDate, NewAnsal, I0761RsuNew, I0761StockNew, I0001StellNew, NewCommision, ManagerIDNew,I0001BtrtlNew ){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMPLOYEE_CHANGE_SRV/ZREVIEWSET?$filter=Pernr eq '"+Pernr+"' and EffectiveDate eq datetime'"+EffectiveDate+"' and NewAnsal eq '"+NewAnsal+"' and I0761RsuNew eq '"+I0761RsuNew+"' and I0761StockNew eq '"+I0761StockNew+"' and I0001StellNew eq'"+I0001StellNew+"' and NewCommision eq '"+NewCommision+"' and ManagerIDNew  eq '"+ManagerIDNew+"' and I0001BtrtlNew eq '"+I0001BtrtlNew +"'";
        }
    },
    
    ContractInternExtension:{
        getDetails : function(employeeID, InitiatorRole){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_CONTRACT_EXTN_SRV/ZCONTRACTSENDSET(Pernr='"+employeeID+"',InitiatorRole='"+InitiatorRole+"')/?$format=json";
        },
        getDetailsSavedForm : function(wiID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_CONTRACT_EXTN_SRV/ZCONTRACTEVENTSET(WiID='"+wiID+"')/?$format=json";
        },
        saveSubmit: {
            entity:"/sap/opu/odata/sap/ZHCM_NECD_GW_CONTRACT_EXTN_SRV",
            link: function(status){
                if(status==="new") return '/ZCONTRACTSENDSET';
                else if(status ==="saved") return '/ZCONTRACTEVENTSET';
            } 
        }
    },
    Termination:{
        getDetails : function(employeeID, InitiatorRole){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_TERMINATION_SRV/ZTERMISENDSET(Pernr='"+employeeID+"',InitiatorRole='"+InitiatorRole+"')/?$format=json";
        },
        getDetailsSavedForm : function(wiID) {
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_TERMINATION_SRV/ZTERMIEVENTSET(WiID='"+wiID+"')/?$format=json";
        },
        saveSubmit: {
            entity:"/sap/opu/odata/sap/ZHCM_NECD_GW_TERMINATION_SRV",
            link: function(status){
                if(status==="new") return '/ZTERMISENDSET';
                else if(status ==="saved") return '/ZTERMIEVENTSET';
            } 
        },
        getTerminationReason: function(employeeID, employeeType, InitiatorRole){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_TERMINATION_SRV/ZTERMIREASONSET?$filter=Pernr eq '"+employeeID+"' and Persg eq '"+employeeType+"' and InitiatorRole eq '"+InitiatorRole+"'&$format=json";
        }
    },
    ViewProfile:{
        getProfileDetails: function(employeeID){
             return "/sap/opu/odata/sap/ZHCM_NECD_GW_VIEW_PROFILE_SRV/ZEMPPROFILESET(EmpID='"+employeeID+"')?$format=json";
        },
        getJobDetails: function(employeeID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_VIEW_PROFILE_SRV/ZEMPJOBDETAILSET?$filter=Pernr eq '"+employeeID+"'&$format=json"
        },
        getPayDetails: function(employeeID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_VIEW_PROFILE_SRV/ZEMPPAYDETAILSET?$filter=Pernr eq '"+employeeID+"'&$format=json"
        },
        getECDHistory: function(fromDate,toDate,employeeID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_VIEW_PROFILE_SRV/ZEMPECDHISTORYSET?$filter=Pernr eq '"+employeeID+"' and FromDate eq datetime'"+fromDate+"' and ToDate eq datetime'"+toDate+"'&$format=json";
        }
        
    },
    MyApproval:{
        getAllApprovalRequests: function(employeeID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV/ZAPPROVALLISTSET?$filter=PersonID eq'"+employeeID+"'&$format=json";
        },
        showEDCData: function(WiID){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV/ZSHOWEDCDATASET(WiID='"+WiID+"')/?$expand=ZAPPROVALHISTORYSet&$format=json";
        },
        processEDCForm:{
            entity: "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV",
            links: function(WiID){
            return "/ZSHOWEDCDATASET(WiID='"+WiID+"')";
            }
        },
        getPendingApprovalCount: function(){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV/ZPENDINGAPPROVALCOUNTSET(PersonID='')";
        },
        getForwards:  function(sValue){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV/ZEMPLOYEESET?$filter=Input eq '"+sValue+"'&$format=json";
        },
        getEducationApprovals: function(workitemId){
              return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV/ZSHOWEEDDATASET(WiID='"+workitemId+"')?$format=json"
        }
    },
    EducationData:{
        initialize: function(employeeId){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV/ZEEDINITIALIZESET(Pernr='"+employeeId+"')?$format=json"
        },
        getDegrees: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV/ZCERTIFICATESSET?$format=json",
        getMajors: function(){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV/ZBRANCHESSET?";
        },
        getInstitutions: function(countryCode){
            //countryCode = 'US';
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV/ZINSTITUTESSET?$filter=Land1 eq '"+countryCode+"'";
        },
        getCountries: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV/ZCOUNTRIESSET?$format=json",
        getMajors: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV/ZBRANCHESSET?$format=json",
        submitForm:{
            entity: "/sap/opu/odata/sap/ZHCM_NECD_GW_EMP_EDUCATION_DTL_SRV",
            link: "/ZEEDINITIALIZESET"
        },
        approveOrReject:{
            entity: "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_APPROVALS_SRV",
            link: function(workItem){
                return "/ZSHOWEEDDATASET(WiID='"+workItem+"')"
            }
        }
    },

    StatusReports: {
        getECDDetails: function(InitDateFrom,InitDateTo,EffDateFrom,EffDateTo,MngrID,HrbpID,Process,SelfInvolved,DirectReportee,Status,Pernr){
            
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZSTATUSREPORTSET?$filter=InitDateFrom eq datetime'"+InitDateFrom+"' and InitDateTo eq datetime'"+InitDateTo+"' and EffDateFrom eq datetime'"+EffDateFrom+"' and EffDateTo eq datetime'"+EffDateTo+"' and MngrID eq '"+MngrID+"' and HrbpID eq '"+HrbpID+"' and Process eq '"+Process+"' and SelfInvolved eq '"+SelfInvolved+"' and DirectReportee eq '"+DirectReportee+"' and Status eq '"+Status+"' and Pernr eq '"+Pernr+"'";
        },
        getApprovalHistory: function(WiID){
           return "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZAPPROVALHISTORYSET?$filter=WiID eq '4256513'";
        },
        getManagerDetails: function(sValue){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZMANAGERSET?$filter=Input eq '"+sValue+"'&$format=json"
        },
        getHRBPDetails: "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZHRBPSET?$format=json",
        
        getAffectedEmpDetails: function(sValue)
        {
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZEMPLOYEESET?$filter=Input eq '"+sValue+"'&$format=json"
        },
        getProcessStatus : "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZPROCESSSTATUSSET?$format=json",
        
        withdrawOrForward: {
           entity: "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV",
           link: function(wiID,event,fromManagerId,toManagerId) {
                return "/ZSTATUSPROCESSSET(WorkitemID='"+wiID+"',Event='"+event+"',FromMgrID='"+fromManagerId+"',ToMgrID='"+toManagerId+"')";
            }
        },
        downloadExcel: function(InitDateFrom,InitDateTo,EffDateFrom,EffDateTo,MngrID,HrbpID,Process,SelfInvolved,DirectReportee,Status,Pernr){
                return  "/sap/opu/odata/sap/ZHCM_NECD_GW_STATUS_REPORT_SRV/ZFILEDOWNLOAD(InitDateFrom=datetime'"+InitDateFrom+"',InitDateTo=datetime'"+InitDateTo+"',EffDateFrom=datetime'"+EffDateFrom+"',EffDateTo=datetime'"+EffDateTo+"',MngrID='"+MngrID+" ',HrbpID='"+HrbpID+"',Process='"+Process+"',SelfInvolved='"+SelfInvolved+"',DirectReportee='"+DirectReportee+"',Status='"+Status+"',Pernr='"+Pernr+"')/$value";  
            }
    },
    Delegation: {
        getMyDelegations: function(){ 
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_DELEGATION_SRV/ZMYDELEGATIONSET?$filter=DfPersonID eq ''";
        },
        getDelegateTos: function(svalue){
            return "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_DELEGATION_SRV/ZEMPLOYEESET?$filter=Input eq '"+svalue+"'";
        },
        addDeleteDelegation: {
            entity: "/sap/opu/odata/sap/ZHCM_NECD_GW_MY_DELEGATION_SRV",
            links: function(DfPersonID){
            return "/ZMYDELEGATIONSET(DfPersonID='"+DfPersonID+"')";
            }
        }
    }
};