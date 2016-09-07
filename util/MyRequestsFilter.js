jQuery.sap.declare("HR.util.MyRequestsFilter");

HR.util.MyRequestsFilter = {

  oData : {
    _persoSchemaVersion: "1.0",
       aColumns:[
       {
        id: "myRequests-myRequestsTable-ECDID",
        order: 0,
        text: "ECD ID",
        visible: false
      },
      {
        id: "myRequests-myRequestsTable-EEID",
        order: 1,
        text: "EE ID",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-StartedOn",
        order: 2,
        text: "Started On",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-LastModified",
        order: 3,
        text: "Last Modified",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-ECDName",
        order: 4,
        text: "ECD Name",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-Status",
        order: 5,
        text: "Status",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-EffectiveDate",
        order: 6,
        text: "Effective Date",
        visible: true
      }
    ]
  },

  getPersData : function () {

    var oDeferred = new jQuery.Deferred();
    console.log(oDeferred);
    if (!this._oBundle) {
       this._oBundle = this.oData;
       console.log( this._oBundle);
    }
    var oBundle = this._oBundle;
    oDeferred.resolve(oBundle);
    return oDeferred.promise();
  },

  setPersData : function (oBundle) {
        console.log("setPersData");
    var oDeferred = new jQuery.Deferred();
    this._oBundle = oBundle;
    oDeferred.resolve();
    return oDeferred.promise();
  },
  
  resetPersData : function () {
    console.log("reset");
    var oDeferred = new jQuery.Deferred();
    var oInitialData = {
        _persoSchemaVersion: "1.0",
  aColumns : [
      {
        id: "myRequests-myRequestsTable-ECDID",
        order: 0,
        text: "ECD ID",
        visible: false
      },
      {
        id: "myRequests-myRequestsTable-EEID",
        order: 1,
        text: "EE ID",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-StartedOn",
        order: 2,
        text: "Started On",
        visible: false
      },
      {
        id: "myRequests-myRequestsTable-LastModified",
        order: 3,
        text: "Last Modified",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-ECDName",
        order: 4,
        text: "ECD Name",
        visible: false
      },
      {
        id: "myRequests-myRequestsTable-Status",
        order: 5,
        text: "Status",
        visible: true
      },
      {
        id: "myRequests-myRequestsTable-EffectiveDate",
        order: 6,
        text: "Effective Date",
        visible: true
      }
    ]
    
    };

    //set personalization
    this._oBundle = oInitialData;
    oDeferred.resolve();
    return oDeferred.promise();
  },
  
};