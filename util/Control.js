jQuery.sap.declare("HR.util.Control");
HR.util.Control = {
        hide : function(controlID, that, edit){
            that.getView().byId(controlID).setVisible(false);
            try{that.getView().byId(controlID+"-table").setVisible(false);} catch(err){}
        	try{that.getView().byId(controlID+"-cancel").setVisible(false);} catch(err){}
        	try{that.getView().byId(controlID+"-error").setVisible(false);} catch(err){}
        	try{
        	    if(edit===undefined) that.getView().byId(controlID+"-edit").setVisible(true);
        	    else that.getView().byId(controlID+"-edit").setVisible(false);
        	} catch(err){}
            
        },
        cancel: function(controlID, that, edit){
            this.hide(controlID, that, edit);
            if(edit===undefined) this.clear(controlID, that, true);
            else this.clear(controlID, that, false);
        },
        clear : function(controlID, that, showAlert){
            var uiControl =that.getView().byId(controlID);
            HR.util.Control.setValueState(controlID,that,"None");
            var value = HR.util.Control.getValue(controlID, that);
            if(uiControl.getMetadata().getName()=="sap.m.DatePicker"){
                uiControl.setValue(); 
                uiControl.setValueState("None"); 
                uiControl.setValueStateText(); 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Select"){
                uiControl.setSelectedKey(""); 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.TextArea"){
                uiControl.setValue(); 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Input"){
                var enabled = uiControl.getEnabled();
                if(!enabled) uiControl.setEnabled(true);
                uiControl.setValue(); 
                if(!enabled) uiControl.setEnabled(false);
            }
            else if(uiControl.getMetadata().getName()=="sap.m.CheckBox"){
                uiControl.setSelected(false);
            }
            if(showAlert && value!==undefined) {
                sap.m.MessageToast.show(that.getView().byId(controlID+"-title").getTitle()+ " is not changed");
            }
        },
        getValue : function(controlID, that, attribute){
            var uiControl =that.getView().byId(controlID);
            if(uiControl.getMetadata().getName()=="sap.m.DatePicker"){
                if(uiControl.getValue()!="") {
                    value =new Date(uiControl.getValue());
                    if(!isNaN(value.getTime()))
                        return value; 
                    else return "Invalid Date";    
                }
                else return;
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Select"){
                if(uiControl.getSelectedKey()!="") {
                    if(attribute=="value") return uiControl.getSelectedItem().getText();
                    else return uiControl.getSelectedKey();
                }
                else return;
            }
            else if(uiControl.getMetadata().getName()=="sap.m.TextArea"){
                if(uiControl.getValue()!="") return uiControl.getValue().replace(/\n/g, "~"); 
                else return;
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Label"){
                var value=(attribute=="id")?uiControl.getText().split(" ")[0]:uiControl.getText();
                if(value.trim()=="") return;
                return value; 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Input"){
                var value=uiControl.getValue();
                if(attribute=="id") value=value.substr(0,value.indexOf(' '));
                if(attribute=="desc") value=value.substr(value.indexOf(' ')+1);
                if(attribute==="amount" && parseFloat(uiControl.getValue())==0) value="";
                if(attribute==="number" && parseInt(uiControl.getValue())==0) value="";
                if(value.trim()=="") return;
                return value; 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Text"){
                var value=(attribute=="id")?uiControl.getText().trim().split(" ")[0]:uiControl.getText();
                if(value.trim()=="") return;
                if(attribute=="date") return new Date(value);
                return value;
            }
            else if(uiControl.getMetadata().getName()=="sap.m.ObjectIdentifier"){
                if(uiControl.getTitle()=="") return;
                return uiControl.getTitle(); 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.CheckBox"){
                if(uiControl.getSelected()) return "Yes";
                else return "No";    
                return;
            }
        },
        modify: function(controlID, that, value){
            var uiControlOld =that.getView().byId(controlID+"-old");
            var uiControlNew =that.getView().byId(controlID);
            if(value!==undefined && value!=="" && value.trim()!=="" && value!=="0"){
               uiControlOld.setState("Warning");
               uiControlOld.setIcon("sap-icon://delete");
               uiControlNew.setVisible(true);
            }
            else{  
               uiControlOld.setState("None");
               uiControlOld.setIcon("");
               uiControlNew.setVisible(false);
            }
        },
        setValue: function(controlID, that, value, attribute){
            var uiControl =that.getView().byId(controlID);
            if(value!==undefined && attribute=="edit" && value!=="" && value.trim()!=="") this.edit(controlID, that);
            if(uiControl.getMetadata().getName()=="sap.m.Input"){
                var enabled = uiControl.getEnabled();
                if(!enabled) uiControl.setEnabled(true);
                uiControl.setValue(value); 
                if(!enabled) uiControl.setEnabled(false);
            }
            else if(uiControl.getMetadata().getName()=="sap.m.DatePicker"){
                if(value!=null && value!="Invalid Date")
                if(attribute==="noConversions")
                    uiControl.setDateValue(value);
                else    
                    uiControl.setDateValue(HR.util.Formatter.getNormalDateDefault(value));
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Text"){
                if(attribute==="date")
                    uiControl.setText(HR.util.Formatter.getNormalDate(value));
                else uiControl.setText(value);     
            }
            else if(uiControl.getMetadata().getName()=="sap.m.Select"){
                uiControl.setSelectedKey(value);
            }
            else if(uiControl.getMetadata().getName()=="sap.m.TextArea"){
                uiControl.setValue(value.replace(/\~/g,'\n'));
            }
            else if(uiControl.getMetadata().getName()=="sap.m.ObjectStatus"){
                if(attribute==="date")
                    uiControl.setText(HR.util.Formatter.getNormalDate(value));
                else uiControl.setText(value); 
            }
            else if(uiControl.getMetadata().getName()=="sap.m.CheckBox"){
                if(value==="Yes")
                    uiControl.setSelected(true);
                else if (value==="No")    
                    uiControl.setSelected(false);
            }
        },
        show: function(controlID, that){
            that.getView().byId(controlID).setVisible(true);
        },
        edit: function(controlID, that, attribute){
            that.getView().byId(controlID).setVisible(true);
            try{that.getView().byId(controlID+"-table").setVisible(true);} catch(err){}
            try{that.getView().byId(controlID+"-edit").setVisible(false);} catch(err){}
            try{that.getView().byId(controlID+"-cancel").setVisible(true);} catch(err){}
            try{if(attribute!=="error") that.getView().byId(controlID+"-error").setVisible(false);} catch(err){}
        },
        enable: function(controlID, that, boolean){
            that.getView().byId(controlID).setEnabled(boolean);
        },
        setValueState: function(controlID, that, attribute){
           var uiControl =that.getView().byId(controlID);
             try{
                 if(uiControl.getMetadata().getName()!=="sap.m.Select"){
                    if(uiControl.getMetadata().getName()!=="sap.m.DatePicker") 
                        uiControl.setShowValueStateMessage(false);
                    if(uiControl.getMetadata().getName()==="sap.m.DatePicker") {
                       uiControl.setValueStateText(" ");
                    }
                 }
             } catch(err){console.log(err);}

            if(attribute==="None"){        
                    try{that.getView().byId(controlID+"-error").setVisible(false);} catch(err){}
                    if(uiControl.getMetadata().getName()=="sap.m.Select") uiControl.removeStyleClass("dropDownError"); 
                    else try{ uiControl.setValueState("None");} catch(err){}
            }
            else if (attribute==="Error"){
                    try{that.getView().byId(controlID+"-error").setVisible(true);} catch(err){}
                    if(uiControl.getMetadata().getName()=="sap.m.Select")uiControl.addStyleClass("dropDownError"); 
                    else uiControl.setValueState("Error");
                    HR.util.Control.edit(controlID, that, "error");
            }
        }
};



