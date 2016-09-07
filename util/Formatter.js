$.sap.require("sap.ui.core.format.DateFormat");
$.sap.require("sap.m.GroupHeaderListItem");
jQuery.sap.declare("HR.util.Formatter");
HR.util.Formatter = {
	pictureURL : function(employeeID){
	    if(employeeID!=undefined){
    	    employeeID = employeeID.replace(/^0+/, '');
    	    var photoLink = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("photoLink");
    	    var photoLinkFormat = sap.ui.getCore().getModel("i18n").getResourceBundle().getText("photoLinkFormat");
    		return photoLink+employeeID+photoLinkFormat;
	    }
	},
	getODataDate: function(date){
        if(new Date().getTimezoneOffset()<420){ //if the user is in a timezone greater than PST, add one day
            date.setDate(date.getDate()+1);
        }
		return "/Date(" + date.getTime()+ ")/";
	},
	getNormalDate: function(date){
	    try{
	        date= HR.util.Formatter.getNormalDateDefault(date);
	        if(date!==undefined && date!==null && date!==''){
	            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({style: "medium", strictParsing: true }); 
                return dateFormat.format(date);
	        }
	    }
        catch(err){console.log(err); }
 	},
 	effectiveDate: function(date){
 	    var date = HR.util.Formatter.getNormalDateDefault(date);
 	    var newDate = date.toDateString();
	    var str = newDate.split(' ')[1]+", "+newDate.split(' ')[3];
 	    return str;
 	},
 	getDateTimeFormat: function(date){  //Change to DateTime format 
 	   try{
 	       var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-ddTHH:mm:ss" });     
 	       if(date!==null){
 	            date = dateFormat.format(date);  
 	       } 
 	       else
 	       {
 	           date = "0000-00-00T00:00:00";
 	       }
        return date;
 	   }
 	  catch(err){console.log(err); }
 	},
 	getChangedFormat: function(date){
 	  if(date!==undefined && date!==null){ 
     	    var parts = date.split(",");
     	    var delimiter = ' ';
            var start = 2;
            tokens = parts[0].split(delimiter).slice(start);
            result = parts[0].split(delimiter+tokens);
     	    date = result+" "+tokens;
     	    return date;
 	  }
 	},
 	getFormat: function(date){
 	    try{
	        date= HR.util.Formatter.getNormalDateDefault(date);
	        if(date!==undefined && date!==null && date!==''){
	        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({style: "small", strictParsing: true ,pattern : "MMMM,yyyy"}); 
            return dateFormat.format(date);
	        }
	    }
        catch(err){console.log(err); }
 	},

 	getEmployeeId: function(str){
 	    if(str!==undefined){
     	    var parts = str.split(' ');
     	    return parts[0];
 	    }
 	},	
	getNormalDateDefault: function(date){
	    if(date!==undefined && date!==null && date!==''){
            date = new Date(parseInt(date.replace("/Date(", "").replace(")/", ""), 10));
            date =  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); //the backend has 00-00-00 for hh-mm-ss. we have to display in UTC and avoid timezone conversions
            return date; 
	    }
	},
	getDateInstance: function(date) {
	    try{
    	    var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });  
    	    if(date!==undefined && date!==null && date!==''){
    	        date = dateFormat.format(date);
    	        return date;
    	    }
	    }
	    catch(err){console.log(err); }
	    
	},
	getPendingDays: function(daysPending) {
	    if(parseInt(daysPending)>1){
	        daysPending = daysPending+" days";
	        return daysPending;
	    }
	    else if(parseInt(daysPending) === 1){
	        daysPending = daysPending+" day";
	        return daysPending;
	    }
	    else if(parseInt(daysPending) === 0){
	        daysPending = "Today";
	        return daysPending;
	    }
	},
	getPernr: function(pernr) {
	    
	     if(pernr!==undefined && pernr!==null && pernr!==''&& pernr!==0){
	        return pernr.replace(/^0+/, '');
	     } 
	},
	becomingAPeopleManager: function(PeopleMngrCurr){
	    if(PeopleMngrCurr==="X") return "Already Manager";
	},
	becomingAPeopleManagerNew: function(flag){
	    if(flag=='X') return "Yes"
	},
	getNumber: function(value){
	    if(value!==undefined && value !=="") {
	    return value.replace(".00", "").replace(",", "");
	    }
	},
	getMoney: function(value){
	    if(value!==undefined && value!==0 && value!=="") {
	    
	    var addCommas = function(str) {
            var parts = (str + "").split("."),
                main = parts[0],
                len = main.length,
                output = "",
                i = len - 1;
            while(i >= 0) {
                output = main.charAt(i) + output;
                if ((len - i) % 3 === 0 && i > 0) {
                    output = "," + output
                }
                --i;
            }
            // put decimal part back
            if (parts.length > 1 && parts[1]!=="") {
                output += "." + parts[1];
            }
            return output;
        }
        if (value.trim() !=="" && value.indexOf(',') < 0)
	        value= addCommas(value);
	      return value.replace(".00", "");
	    }
	    else return "0";
	    
	},
	getECDName: function(ecdName){
	    if(ecdName!==null && ecdName!==undefined){ 
	    if(ecdName.indexOf("Process") > -1){ 
	        ecdName = ecdName.replace(" Process","");
	    }
	     if(ecdName.indexOf("form") > -1) { 
	        ecdName = ecdName.replace(" form","");
	    }
	    if(ecdName.indexOf("Employee /Intern") > -1){ 
	       ecdName = ecdName.replace("Employee /Intern ","");
	    }
	    }
	    return ecdName;
	},
	getJsonFormat: function(data) {
	    var formattedData= { d:{ results:[ ] } };
	    var keys = [];
	    keys = Object.keys(data.d.results[0]);
    	for(var keyCounter=1; keyCounter<keys.length; keyCounter++){ 
    	      var obj = {};
    	      for(var count=0; count<data.d.results.length; count++){
        	       var getKey = Object.keys(data.d.results[count])[keyCounter];
        	       obj['effectDate'+count] = data.d.results[count][getKey]; 
        	       obj.key = getKey;
        	  } 
        	  formattedData.d.results.push(obj);
        }
        return formattedData;
	},
	changeStructure: function(data,limit,structure){
	    var formattedData= { d:{ results:[ ] } };
	    if(structure=="tabular"){
    	    for(var count=1; count<=limit; count++){
    	        var obj = {};
    	        if(data.d['Begda'+count]!==null){
    	         obj.startDate = HR.util.Formatter.effectiveDate(data.d['Begda'+count]);
    	        }
    	        else
    	        {
    	             obj.startDate = data.d['Begda'+count];
    	        }
    	        if(data.d['Endda'+count]!==null){
    	             obj.endDate = HR.util.Formatter.effectiveDate(data.d['Endda'+count])
    	        }
    	        else
    	        {
    	             obj.endDate = data.d['Endda'+count];
    	        }
    	        obj.major1 = data.d['Sltp1Desc'+count];
    	        obj.major2 = data.d['Sltp2Desc'+count];
    	        obj.degree = data.d['SlabsDesc'+count];
    	        obj.institution = data.d['Insti'+count];
    	        obj.country = data.d['Landx'+count];
    	        if(obj.startDate===null&& obj.endDate===null&& obj.major1===""&& obj.major2===""&& obj.degree===""&& obj.institution==="")
    	        {
    	            continue;
    	        }
    	        else
    	        {
    	            formattedData.d.results.push(obj);
    	        }
    	    }
    	    return formattedData;
	    }
	    else{
	        var obj = {};
	        
	       for(var count=1; count<=data.length;count++){
	            obj['Begda'+count] = data[count-1].startDate;
	            obj['Endda'+count] = data[count-1].endDate;
	            obj['Sltp1'+count] = data[count-1].major1;
	            obj['Sltp1Desc'+count] = data[count-1].major1Desc;
	            obj['Sltp1'+count] = data[count-1].major1;
	            obj['Sltp2'+count]  = data[count-1].major2;
	            obj['Sltp2Desc'+count] = data[count-1].major2Desc;
	            obj['Slabs'+count] = data[count-1].degree;
	            obj['SlabsDesc'+count] = data[count-1].degreeDesc;
                obj['Insti'+count]= data[count-1].institution;
                obj['Sland'+count] = data[count-1].country
	            obj['Opera'+count] = data[count-1].flag;
	        }
	        return obj;
	    }
	    
	},
    getProcess: function(process){
            if(process.key.toLowerCase()=="employee data change process"){
                process.key = "Employee Data Change";
            }
            else if(process.key.toLowerCase()=="employee education form"){
                process.key = "Education Data"
            }
            return new sap.m.GroupHeaderListItem( {
    				title: process.key,
    				upperCase: false
    			} );
        
    },

	checkIfEmpty: function(value){
	     if(value==""||  value==null || value==undefined){
	     
	         return "--";
	         
	     }
	     else{
	         return value;
	     }
              
	},
	concatData: function(str1, str2,str3){
	    var isStr1=false, isStr2=false, isStr3=false;
	    if (str1!==undefined && str1!=="") isStr1=true;
	    if (str2!==undefined && str2!=="") isStr2=true;
	    if (str3!==undefined && str3!=="") isStr3=true;
	    
	    if(!isStr1 && !isStr2 && !isStr3) return ""; //null, null, null
	    if(!isStr1 && !isStr2) return str3;  //null, null, 3
	    if(!isStr3 && !isStr2) return str1;  //1, null, null
	    if(!isStr1 && !isStr3) return str2;  //null, 2, null
	    
	    if(!isStr1) return str2+"-"+str3; // null, 2-3
	    if(!isStr3) return str1+", "+str2; // 1, 2, null
	    if(!isStr2) return str1+"-"+str3; // 1-3
	    return str1+", "+str2+"-"+str3; //1 ,2-3
	},

	toInteger: function(value){
	    if(value){
	          return parseInt(value);
	    }
	  
	},
	newLineCharacter: function(comments){
	    if(comments!==undefined){
    	    var newline = "\n";
    	    if(comments.indexOf('~')>-1){
    	       comments = comments.replace(/~/g, newline);
    	    }
	    return comments;
	    }
	}
};
