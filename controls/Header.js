$.sap.declare("HR.controls.Header");
$.sap.require("HR.util.General");
$.sap.includeStyleSheet([$.sap.getResourcePath("HR"), "controls/Header.css"].join("/"));
$.sap.require("sap.m.Table");
HR.controls.Header = sap.ui.core.Control.extend("HR.controls.Header", {

    // the control API:
    metadata: {
        properties: { //automatically getter setter are created
            name: {
                type: "string"
            },
            title: {
                type: "string"
            },
            employeeID: {
                type: "string"
            },
            showMoreDetails: {
                type: "boolean"
            },
            manager: {
                type: "string"
            },
            workerType: {
                type: "string"
            },
            costCenter: {
                type: "string"
            },
            countryLegalEntity: {
                type: "string"
            },
            officeLocation: {
                type: "string"
            },
            showOfficeDetails: {
                type: "boolean"
            },
            localTime: {
                type: "string"
            },
            email: {
                type: "string"
            },
            office: {
                type: "string"
            },
            mobile: {
                type: "string"
            },
            where_I_sit:  {
                type: "string"
            },
        }
    },

    renderer: {

        render: function(oRm, oControl) {
          if(oControl.getProperty("name") !==undefined){ // this is to prevent first rendering when the data is not loaded
            var mainColumns = [
                new sap.m.Column({
                    width: "8em",
                    hAlign: "Center"
                }),
                new sap.m.Column({
                    minScreenWidth: "800px",
                    demandPopin: true
                })
            ];

            var mainTable = new sap.m.Table({
            columns: mainColumns,
            backgroundDesign: "Solid"
            });

            var employeePic = new sap.m.Image({ height: "100px" });
            HR.util.General.loadPicture(oControl.getProperty("employeeID"), employeePic);


            var detailCells1 = new sap.m.VBox({
                items: [
                    new sap.m.ObjectIdentifier({
                        title: oControl.getProperty("name")
                    }),
                    new sap.m.Label({
                        text: oControl.getProperty("title")
                    }),
                    new sap.m.Label({
                        text: "Employee ID: " + oControl.getProperty("employeeID")
                    })
                ]
            });
            var detailColumnListItem = new sap.m.ColumnListItem({
                cells: [detailCells1]
            });

            if (oControl.getProperty("showMoreDetails")) {
                var detailCells2 = new sap.m.VBox({
                    items: [
                        new sap.m.Label({
                            text: "Manager: " + oControl.getProperty("manager")
                        }),
                        new sap.m.Label({
                            text: "Worker Type: " + oControl.getProperty("workerType")
                        }),
                        new sap.m.Label({
                            text: "Cost Center: " + oControl.getProperty("costCenter")
                        }),
                        new sap.m.Label({
                            text: "Country/Legal Entity: " + oControl.getProperty("countryLegalEntity")
                        }),
                        new sap.m.Label({
                            text: "Office Location: " + oControl.getProperty("officeLocation")
                        })
                    ]
                });
                detailColumnListItem.addCell(detailCells2);
            }
            if (oControl.getProperty("showOfficeDetails")) {
                
                
                detailCells1.addItem(
                            new sap.m.Label({
                            text: "Local Time: " + oControl.getProperty("localTime")
                            })
                        );
                var detailCells3 = new sap.m.VBox({
                    items: [
                        new sap.m.HBox({
                    				items:[
                    					new sap.m.Label({
                                            text: "Email:"+"\u00a0"
                                        }),
                                       
                    					new sap.m.Link({
                                            text:HR.util.Formatter.checkIfEmpty(oControl.getProperty("email")),
                                            href:"mailto:"+oControl.getProperty("email") 
                                        })
                    				]
                        }),
                        new sap.m.Label({
                            text: "Office: " + HR.util.Formatter.checkIfEmpty(oControl.getProperty("office"))
                        }),
                        new sap.m.Label({
                            text: "Mobile: " + HR.util.Formatter.checkIfEmpty(oControl.getProperty("mobile"))
                        }),
                        new sap.m.HBox({
                    				items:[
                    					new sap.m.Label({
                                            text: "Where I sit:"+ "\u00a0"
                                        }),
                    					new sap.m.Link({
                                            text: oControl.getProperty("where_I_sit"),
                                            target:"_blank",
                                            href: "http://sandisk-prod.rsc2lc.com/spaceview_locator/floorplan/floorplan.php?empno="+oControl.getProperty("employeeID")
                                        })
                    				]
                        }),
                    ]
                });
                detailColumnListItem.addCell(detailCells3);
            }

            var detailTable = new sap.m.Table({
                backgroundDesign: "Transparent",
                columns: [
                    new sap.m.Column(),
                    new sap.m.Column({
                        minScreenWidth: "1024px",
                        demandPopin: true
                    })
                ],
                items: [detailColumnListItem]
            });
            var row = new sap.m.ColumnListItem({
                cells: [
                    employeePic, detailTable
                ]
            });

            mainTable.addItem(row);
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("header");
            oRm.writeClasses();
            oRm.write(">");

            //content
            oRm.renderControl(mainTable);
            oRm.write("</div>");
          }    
        }
    }
});