jQuery.sap.declare("HR.util.General");
HR.util.General = {
        ajaxWrite: function(entity, link, parameters, successFn, object, httpReqType){
            if(httpReqType===undefined) httpReqType='POST';
            HR.util.Busy.setBusyOn(true);
            $.ajax({ 
              url: entity,
              contentType: "application/json",
              dataType: "json",
              beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', 'Fetch')},
              success: function(data, textStatus, request){
                  var header_xcsrf_token = request.getResponseHeader('x-csrf-token')===undefined? request.getResponseHeader('X-CSRF-Token'): request.getResponseHeader('x-csrf-token');
                  $.ajax({ url: entity+link,
                      type: httpReqType,
                      contentType: "application/json",
                      dataType: "json",
                      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', header_xcsrf_token)
                      },
                      data: JSON.stringify(parameters),
                      success: function(data){
                          successFn(data,object);
                          HR.util.Busy.setBusyOff();
                          return true;
                      },
                      error: function(err){
                          HR.util.Busy.setBusyOff();
                          HR.util.General.error(err.responseJSON.error.message.value);
                          return err.responseJSON.error.message.value;
                      }
                    });
              },
              error: function(err){
                 HR.util.Busy.setBusyOff();
                  HR.util.General.error(err.responseJSON.error.message.value);
                  return err.responseJSON.error.message.value;
                }
            });
        },
        error: function(text, moreDetails){
            $.sap.require("sap.ca.ui.message.message");
        	if(moreDetails===null)
        	    sap.ca.ui.message.showMessageBox({
                 type: sap.ca.ui.message.Type.ERROR,
                 message: text
             });
        	else 
        	sap.ca.ui.message.showMessageBox({
                type: sap.ca.ui.message.Type.ERROR,
                message: text,
                details: moreDetails
            });
        },
        objectLength: function(object){
            var length=0;
            $.each(object, function(k, v) {
                if(v!==undefined && v!=="") length+=1;
            });
            return length;
        },
        getDate: function(){
            var dateFull= new Date();
            var date = dateFull.getDate();
            var month = dateFull.getMonth();
            var year = dateFull.getFullYear();
            return new Date(year, month, date);
        },
        objectPath: function(obj, path) {
            var parts = path.split('/');
            return obj[parts[1]][parts[2]][parts[3]];
        },
        introduceNewLineChar:function(str){
            return str.replace(/\n/g, "~!@#$");
        },
        isValidAmount: function(data){
            return data=="" || data.match(/^\d+\.\d{0,2}$/) || data.match(/^\d+$/);
        },
        hasDecimal: function(data){
            return data.indexOf(".")!=-1;
        },
        isValidNumber: function(data){
            return data=="" || data.match(/^\d+$/);
        },
        isInteger:function(data){
            if (data=="" || data === parseInt(data, 10))
                return true;
            else
                return false;
        },
        loadPicture: function(employeeID, element, attribute){
            var image = new Image();
            image.src = HR.util.Formatter.pictureURL(employeeID);
            if(element==undefined) { 
                element=this;
            }
            image.onload = function () {
               if(attribute=="businessCard") element.setIconPath(image.src);
               else element.setSrc(image.src);
            };
            image.onerror = function () {
               var error = [$.sap.getResourcePath("HR"), "i18n/images/default.png"].join("/");
               if(attribute=="businessCard") element.setIconPath(error);
               else element.setSrc(error);
            };
        }
};



