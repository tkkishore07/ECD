jQuery.sap.declare("HR.util.Busy");
HR.util.Busy = {
    _busyIndicator : null,
    
    setBusyOn : function(opacity) {
      if (!this._busyIndicator) {
        this._busyIndicator = new sap.m.BusyDialog();
      }
      this._busyIndicator.open();
      if(opacity===undefined) opacity=0;
      else opacity=0.3;
      $(".sapUiBLy").css('opacity',opacity);
    },
    
    setBusyOff : function() {
      this._busyIndicator.close();
    },
    
};