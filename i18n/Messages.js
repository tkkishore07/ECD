jQuery.sap.declare("HR.i18n.Messages");
HR.i18n.Messages = {
    
    EmployeeSearch: {
        search: "Employee Search by # or name (min 3 characters)",
        noSearchResults: "No Search result found",
        min3chars: "Please enter atleast 3 characters"
    },
    
    MyRequests: {
        invalidDate: "To Date should be greater than From Date",
        noRequestsFound: "No requests found",
        withdraw: "Do you want to withdraw your ECD order?",
        discardDraft: "Do you want to discard all your changes?",
        draftDiscarded: "Draft has been discarded successfully",
        requestWithdrawn: "Request has been withdrawn successfully"
    },
    
    EmployeeDataChange:{
        onlyContractorsInterns: "Contract/Intern extension Form is for only contractors and interns",
        search: "Enter emp # or name (min 3 characters)",
        notAuthorized: "You are not authorized to access this employee information",
        errorOfficeLocations: "Error in retrieving office locations. Please refresh the page",
        noChanges: "No changes have been made",
        formSave: "Your form has been saved",
        noChangesSubmit: "No changes have been made",
        submitSuccess: "Thank you for submitting the ECD. It is currently in process. It may take up to 15 seconds for the new request to appear under My Request or Status Report.",
        submit: "Do you want to submit the form?",
        saveConfirm: "Do you want to save the current changes?",
        validationFailed: "Please correct the errors before submitting",
        annualSalaryPartTime: "Please contact HR Admin since this is a part-time employee",
        close: "Choose Save Draft to save the form or Cancel to go back to the Main Page ?",
        futureAction: "Future action exist for the selected employee",
        rsuStockText: "Check with HRBP",
        errors:{
            date: "Valid Date format: mm-dd-yyyy",
            effectiveDateNull: "Enter Effective Date",
            leader: function(managerName){
                return "This leader does not report to "+managerName+"";
            },
            pastEffectiveDate: "Effective Date is in the past",
            sameValue : "Current and Proposed values are same",
            twoMonths: "Effective Date should be within 2 months (After/before) from now",
            dlWithoutLeader: "Employee is being classified a Direct Labor but without proper Leader assignment. Please specify Leader or contact HR admin",
            BecomingAPeopleManager: {
                oldJob: "A people manager should be in manager or above level",
                newJob: "A people manager should be in manager or above level",
                laborClassification: "A people manager cannot be a direct labor",
                leader: "A people manager cannot have a leader"
            },
            amount: "Enter amount in valid format without commas(,) and maximum of two decimal places. Example format: 100000.00",
            currencyNumber: "Enter amount in valid format without commas(,). Example format: 100000",
            number: "Enter a valid number without decimal places"
        },
        warnings:{
            officeLocation: "Employee will be moved from a remote work location to a regular office location. System will use office address as work address. If this is incorrect, please contact HR admin after submitting the request.",
            officeLocation2: "Employee will be moved from regular office location to a remote work location. System will use home address as work address. If this is incorrect, please contact HR admin after submitting the request.",
            leaderOld: "Employee is reporting to a new manager. Employee will not be under any leader",
            costCenter: "Employee is moving to a profit center that is not the same as the manager",
            targetCommission: "Employee is moving to a non-sales job. Employee will no longer be eligible for commission"
        }
    },
    ContractInternExtension:{
        onlyContractorsInterns: "Contract/Intern extension Form is for only contractors and interns",
        onlyWestValley: "You can extend only for West Valley contractors",
        errorContractTypes: "Error in retrieving contract types. Please refresh the page",
        noChanges: "No changes have been made",
        formSave: "Your form has been saved",
        noChangesSubmit: "No changes have been made",
        submitSuccess: "Your request has been submitted successfully",
        submit: "Do you want to submit the form?",
        saveConfirm: "Do you want to save your current changes?",
        validationFailed: "Please correct the errors before submitting",
        errors:{
            date: "Valid Date format: mm-dd-yyyy",
            monthContract: "Contract Extension should be for 12 months or less from effective date",
            pastContractEffectiveDate: "Contract Effective Date is in the past",
            pastContractEndDate: "Contract End Date in the past",
            contractEffectiveDateNull: "Enter Contract Effective Date",
            contractEndDateNull: "Enter Contract End Date",
            contractEndDateLess: "Contract End Date should be greater than Contract Effective Date",
            fixedTermContract: "Contract end date needs to be a future date",
            noChangeContractEndDate: "No Change in Contract",
            twoMonths: "Contract Effective Date should be within 2 months (After/before) from now"
        }
    },
    Termination:{
        onlyWestValley: "You can terminate only West Valley contractors",
        noPermissionToAccess: "You don't permissions to terminate people",
        errorTerminationReason: "Error in retrieving termination reasons. Please refresh the page",
        noChanges: "No changes have been made",
        formSave: "Your form has been saved",
        noChangesSubmit: "No changes have been made",
        submitSuccess: "Your request has been submitted successfully",
        submit: "Do you want to submit the form?",
        saveConfirm: "Do you want to save your current changes?",
        validationFailed: "Validation failed: ",
        errors:{
            date: "Valid Date format: mm-dd-yyyy",
            pastTerminationDate: "Termination Date is in the past",
            terminationDateWindow: "Effective Date has be within 3 months (After/before) from today's date",
            terminationDate: "Termination date cannot be earlier than Last Day Worked",
            lastDayWorkedNull: "Enter Last Day Worked",
            terminationDateNull: "Enter Termination Date",
            israelTermNotificationDate: "Enter Israel Term Notification Date",
            terminationReasonNull: "Enter Termination Reason",
            rehireEligibleNull: "Enter rehire eligibility"
        }
    },
    MyApprovals:{
        approveRequest: "Do you want to Approve ?",
        rejectRequest: "Do you want to Reject ?",
        forwardRequest: "Do you want to forward this request to",
        approveSuccess: "EDC Request has been approved",
        rejectSuccess: "EDC Request has been rejected",
        forwardSuccess: "EDC Request has been forwarded",
        commentsRequired: "Comments are mandatory for Rejections"
    },
    StatusReport:{
        withdrawError: "Only Approval Pending/Error requests can be withdrawn",
        forwardError: "Only Approval Pending requests can be forwarded",
        noRequestSelected: "No request is selected",
        submittedDatesBlank:"Submitted dates cannot be left blank"
    },
    Delegation:{
        deleteDelegation: "The delegation has been deleted",
        addDelegation: "The delegation has been added",
        error:{
            period: "A delegation already exists for the chosen dates",
            empty: "Enter all three fields",
            pastDate: "Start Date is in the past",
            endDate: "End date cannot be before Start date"
        }
    }
};