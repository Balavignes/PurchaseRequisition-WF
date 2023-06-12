sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("workflowuimodule.controller.MyTaskUI", {
            onAfterRendering: function () {
                console.log("init called");    
                // var odataModel = new sap.ui.model.odata.v2.ODataModel("https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/backend/sap/opu/odata/sap/ZGW_SCP_PRWF_HIST_SRV/OutTabSet");//CORS error
                // if(this.getOwnerComponent().getModel("context").getData().PurchaseReq.logs && !this.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.length) {
                this.getView().setModel(this.getOwnerComponent().getModel("context"), "PRdata");
                var taskModel = this.getOwnerComponent().getModel("task");
                this.getView().setModel(taskModel, "taskdata");
                var imageModel = this.getOwnerComponent().getModel("imageModel");
                this.getView().setModel(imageModel, "imageModel");                
            },

            onIconSelect: function(oEvent) {
                var plantData = this.callPlants();
                if(plantData.length) {
                    this.Destination = plantData[0].DESTINATION;
                }
                this.commentsModel = new sap.ui.model.json.JSONModel();
                this.logsModel = new sap.ui.model.json.JSONModel();
                this.readECCData();
                this.readCommentsData();
            },

            callPlants: function () {
                console.log("plants API called");
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/plant";
                var plantData = {
                    plant : this.getOwnerComponent().getModel("context").getData().PurchaseReq.Plant
                }
                jQuery.ajax({
                    url: url,
                    type: 'GET',
                    contentType: 'application/json',
                    async: false,
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                    },
                    data: plantData,
                    success: function(result) {
                        console.log("*****************Inside success PL "+result);
                        plantData = result;
                     },
                    error: function(e) {
                        // log error in browser
                        console.log("app history failed :" +e.message);
                    }
                 });
                return plantData;
            }, 

            readCommentsData: function () {
                console.log("Read Comments");
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/getComments";
                // Get comments from context
                var comments = this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments ? JSON.parse(JSON.stringify(this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments )): [];
                this.commentsModel.setData(comments);
                this.getView().setModel(this.commentsModel, "commentsModel");
                var that = this;
                var approvalBody = {
                    prId : that.getOwnerComponent().getModel("context").getData().PurchaseReq.PurchaseRequisition.trim(),
                    ItemNr: that.getOwnerComponent().getModel("context").getData().PurchaseReq.PrItemNumber,
                    Destination : that.Destination
                  }
                jQuery.ajax({
                    url: url,
                    type: 'GET',
					contentType: 'application/json',
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                    },
                    data: approvalBody,
					success: function(result) {
                        // that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments = that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments ? that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments : [];
                        // that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs = that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.concat(result);
                        // Get comments from ECC
                        for(var i in result) {
                            that.commentsModel.getData().push ({
                                user : result[i].User,
                                comments : result[i].Comment
                              });
                        }
                        that.byId("idCommentsList").getBinding("items").refresh()
						console.log("*****************Inside success comments "+result);
					},
					error: function(e) {
						// log error in browser
						console.log("comment failed :" +e.message);
					}
                });
            },

            readECCData: function () { 
                console.log("Read approval history");
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/getapprovalHistory";
                //Get logs from context
                var logs = this.getOwnerComponent().getModel("context").getData().PurchaseReq.logs ? JSON.parse(JSON.stringify(this.getOwnerComponent().getModel("context").getData().PurchaseReq.logs)): [];
                this.logsModel.setData(logs);
                this.getView().setModel(this.logsModel, "logsModel");
                var that = this;
                var approvalBody = {
                    prId : that.getOwnerComponent().getModel("context").getData().PurchaseReq.PurchaseRequisition.trim(),
                    ItemNr: that.getOwnerComponent().getModel("context").getData().PurchaseReq.PrItemNumber,
                    Destination : that.Destination
                  }
                jQuery.ajax({
                    url: url,
                    type: 'GET',
					contentType: 'application/json',
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                    },
                    data: approvalBody,
					success: function(result) {
                        // that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs = that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs ? that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs : [];
                        // that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs = that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.concat(result);
                        for(var i in result) {
                            that.logsModel.getData().push({
                                approver : result[i].Zuser,
                                level : result[i].Step,
                                timestamp : new Date(parseInt(result[i].PostingDate.substr(6))).toString().substr(0,15),
                                from: "SAP"
                              });
                        }
                        that.byId("idLogsTable").getBinding("items").refresh()
						console.log("*****************Inside success app history "+result);
					},
					error: function(e) {
						// log error in browser
						console.log("app history failed :" +e.message);
					}
                });
            },

            DateConversion: function(date) {
                var date = new Date(parseInt(date.substring(6,19)));
                return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
            },

            AccAssign: function(AccAssignCatDesc, AccAssignCat) {
                if(AccAssignCat == ""){
                    var accAssignment = "General Stock(GS)"
                } else {
                    var accAssignment = AccAssignCatDesc + "(" + AccAssignCat + ")";
                }
                return accAssignment;
            },

            trimItemNumber: function(itemnumber) {
                return parseInt(itemnumber);
            },

            navToDetails: function(oEvent) {
                console.log("press function called");
                var oSelObj = oEvent.getSource().getBindingContext("Itemsdata").getObject();
                this.getOwnerComponent().getModel("taskDetails").setData(oSelObj);
                this.getOwnerComponent().getRouter().navTo("RouteMyTaskDetails");
            },
            onPost: function(oEvent) {                
                var userInfo = sap.ushell.Container.getService("UserInfo");
                // this.commentsModel.setData(this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments);
                this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments = this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments ? this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments : [];
                this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments.push({
                    user : userInfo.getFullName(),
                    comments : oEvent.getParameter("value")
                });
                //store comments in comments model for integrating both ecc and context data
                this.commentsModel.getData().push ({
                    user : userInfo.getFullName(),
                    comments : oEvent.getParameter("value")
                  });
                this.byId("idCommentsList").getBinding("items").refresh();
                // this.readCommentsData();
                this.getView().getModel("PRdata").setData( this.getOwnerComponent().getModel("context").getData());
                this.getView().getModel("PRdata").refresh();  
                var that = this;      
                jQuery.ajax({
                    url: that.getOwnerComponent()._getTaskInstancesBaseURL(),
                    method: "GET",
                    contentType: "application/json",
                    async: false,
                    headers: {
                      "X-CSRF-Token": that.getOwnerComponent()._fetchToken(),
                    },
                    success: function(data){
                        that.updateContext(data);
                    },
                    error: function(xhr, error){
                        MessageBox.error("Approval or Rejection of PR failed.")
                    }
                });
            },

            updateContext: function(data) {
                var that = this;
                jQuery.ajax({
                    url: that.getOwnerComponent()._getWorkflowRuntimeBaseURL() + "/workflow-instances/" + data.workflowInstanceId + "/context" ,
                    method: "PUT",
                    contentType: "application/json",
                    async: false,
                    data: JSON.stringify(that.getOwnerComponent().getModel("context").getData()),
                    headers: {
                      "X-CSRF-Token": that.getOwnerComponent()._fetchToken(),
                    },
                    success: function(data){},
                    error: function(xhr, error){
                        MessageBox.error("Approval or Rejection of PR failed.")
                    }
                });
            } 
        });
    });
