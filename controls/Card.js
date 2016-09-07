$.sap.declare("HR.controls.Card");
$.sap.require("sap.suite.ui.commons.GenericTile");
$.sap.includeStyleSheet([$.sap.getResourcePath("HR"), "controls/Card.css"].join("/"));
$.sap.require("sap.ui.commons.layout.MatrixLayout");


sap.ui.core.Control.extend("HR.controls.Card", {
    metadata: {
        properties: {
            name: {
                type: "string"
            },
            title: {
                type: "string"
            },
            employeeID: {
                type: "string"
            },
            pernrID: {
                type: "string"
            }
        },
        aggregations: {
            genericTile: {
                type: "sap.suite.ui.commons.GenericTile",
                multiple: false,
                visibility: "hidden"
            }
        },
        events: {
            press: {
                enablePreventDefault: true
            }
        }
    },    
    // set up the inner controls
    init: function() {
        var oGenericTile = new sap.suite.ui.commons.GenericTile({
            frameType: "TwoByOne",
            press: function(oEvent) {}
        });
        this.setAggregation("genericTile", oGenericTile);
    },


    // render a composite with a wrapper div
    renderer: function(oRm, oControl) {
        oRm.write("<div ");
        oRm.writeControlData(oControl);
        oRm.write("class=\"card\">");


        var genericTile = oControl.getAggregation("genericTile");
        genericTile.attachPress(
            function(oEvent) {
                oControl.firePress({
                    pernrID: oControl.getProperty("pernrID")
                });
            }
        );

        var matrixLayout = new sap.ui.commons.layout.MatrixLayout();
        var matrixLayoutCell1 = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [new sap.m.Label({
                text: oControl.getProperty("title")
            })]
        });
        var matrixLayoutCell2 = new sap.ui.commons.layout.MatrixLayoutCell({
            content: [new sap.m.Label({
                text: "EE #" + oControl.getProperty("employeeID")
            })]
        });
        matrixLayout.createRow(matrixLayoutCell1);
        matrixLayout.createRow(matrixLayoutCell2);


        var businessCard = new sap.suite.ui.commons.BusinessCard({
                    secondTitle: oControl.getProperty("name"),
                    width: "300px",
                    content: [matrixLayout]
                });
        HR.util.General.loadPicture(oControl.getProperty("employeeID"), businessCard, "businessCard");
          
            
        var content = new sap.suite.ui.commons.TileContent({
            content: [businessCard]
        });
        genericTile.insertTileContent(content);
        oRm.renderControl(genericTile);
        oRm.write("</div>");
    }
});