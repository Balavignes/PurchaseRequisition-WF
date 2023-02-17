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
                var plantData = this.callPlants();
                if(plantData.length) {
                    this.Destination = plantData[0].DESTINATION;
                }
                // if(this.getOwnerComponent().getModel("context").getData().PurchaseReq.logs && !this.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.length) {
                this.readECCData();
                this.readCommentsData();
                // }
                this.getOwnerComponent().getModel("context").getData().PurchaseReq.dbUpdate = this.getOwnerComponent().getModel("context").getData().PurchaseReq.dbUpdate ? this.getOwnerComponent().getModel("context").getData().PurchaseReq.dbUpdate : false;  
                if(this.getOwnerComponent().getModel("context").getData().PurchaseReq.dbUpdate || this.getOwnerComponent().getModel("context").getData().PurchaseReq.approvalLevel == 1){
                    this.storeApproverLevel(this.getOwnerComponent().getModel("context").getData().PurchaseReq);
                    this.getOwnerComponent().getModel("context").getData().PurchaseReq.dbUpdate = false;
                }
                this.getView().setModel(this.getOwnerComponent().getModel("context"), "PRdata");
                var taskModel = this.getOwnerComponent().getModel("task");
                this.getView().setModel(taskModel, "taskdata");
                var imageModel = this.getOwnerComponent().getModel("imageModel");
                this.getView().setModel(imageModel, "imageModel");                
            },

            callPlants: function () {
                console.log("plants API called");
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/plant";
                var plantData = {};
                jQuery.ajax({
                    url: url,
                    type: 'GET',
					contentType: 'application/json',
                    async: false,
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                      },
                    data: {
                        "plant": "0201"
                        // "plant": this.getOwnerComponent().getModel("context").getData().PurchaseReq.Plant
                    },
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
                var that = this;
                jQuery.ajax({
                    url: url,
                    type: 'GET',
					contentType: 'application/json',
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                    },
                    data: {
                        "destination": this.Destination
                    },
					success: function(result) {
                        that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments = that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments ? that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments : [];
                        // that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs = that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.concat(result);
                        for(var i in result) {
                            that.getOwnerComponent().getModel("context").getData().PurchaseReq.comments.push({
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
                var that = this;
                jQuery.ajax({
                    url: url,
                    type: 'GET',
					contentType: 'application/json',
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                    },
                    data: {
                        "destination": this.Destination
                    },
					success: function(result) {
                        that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs = that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs ? that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs : [];
                        // that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs = that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.concat(result);
                        for(var i in result) {
                            that.getOwnerComponent().getModel("context").getData().PurchaseReq.logs.push({
                                approver : result[i].User,
                                level : result[i].Step,
                                timestamp : new Date(parseInt(result[i].PostingDate.substr(6)))
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

            storeApproverLevel: function(PRPostdata) {
                console.log("update approver and its level");
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/storeapprover";
                jQuery.ajax({
                    url: url,
                    type: 'POST',
					contentType: 'application/json',
                    data: JSON.stringify({
                        "approver" : PRPostdata.username.Result[0].Approvers.Approver,
                        "level" : PRPostdata.approvalLevel,
                        "PRId" : PRPostdata.Purchaserequisition,
                        "ItemNr" : PRPostdata.ItemNr,
                        "WorkflowInstance" : PRPostdata.wfInstance
                    }),
                    headers: {
                        "X-CSRF-Token": this.getOwnerComponent()._fetchToken(),
                      },
                    dataType: 'json',
					success: function(result) {
						console.log("*****************Inside success "+result);
					},
					error: function(e) {
						// log error in browser
						console.log(e.message);
					}
                });
            },
            navToDetails: function(oEvent) {
                console.log("press function called");
                var oSelObj = oEvent.getSource().getBindingContext("Itemsdata").getObject();
                this.getOwnerComponent().getModel("taskDetails").setData(oSelObj);
                this.getOwnerComponent().getRouter().navTo("RouteMyTaskDetails");
            },
            onPost: function(oEvent) {                
                var userInfo = sap.ushell.Container.getService("UserInfo");
                this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments = this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments ? this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments : [];
                this.getOwnerComponent().getModel("context").getData().PurchaseReq.comments.push({
                    user : userInfo.getFullName(),
                    comments : oEvent.getParameter("value")
                });
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
