sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/ui/model/resource/ResourceModel",
    "workflowuimodule/model/models",
  ],
  function (UIComponent, Device, MessageBox, ResourceModel, models) {
    "use strict";
    return UIComponent.extend(
      "workflowuimodule.Component",
      {
        metadata: {
          manifest: "json",
        },
        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
          // call the base component's init function
          UIComponent.prototype.init.apply(this, arguments);
          // enable routing
          this.getRouter().initialize();
          // set the device model
          this.setModel(models.createDeviceModel(), "device");
          this.taskDetailsModel = new sap.ui.model.json.JSONModel();
          this.setModel(this.taskDetailsModel, "taskDetails");
          this.setTaskModels();
          this.getInboxAPI().addAction(
            {
              action: "APPROVE",
              label: "Approve",
              type: "accept", // (Optional property) Define for positive appearance
            },
            function () {
              var plantData = this.callPlants();
              if(plantData.length) {
                  this.Destination = plantData[0].DESTINATION;
              }
              this.completeTask(true);
            },
            this
          );
          this.getInboxAPI().addAction(
            {
              action: "REJECT",
              label: "Reject",
              type: "reject", // (Optional property) Define for negative appearance
            },
            function () {
              this.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover = ""
              var plantData = this.callPlants();
              if(plantData.length) {
                  this.Destination = plantData[0].DESTINATION;
              }
              this.completeTask(false);
            },
            this
          );
          // this.getInboxAPI().addAction(
          //   {
          //     action: "FORWARD",
          //     label: "Forward"
          //   },
          //   function () {
          //     console.log("called inside forward");
          //   },
          //   this
          // );
          var oRootPath = sap.ui.require.toUrl("workflowuimodule/Logo-COMAU_NO-BALL.png"); 
          var oImageModel = new sap.ui.model.json.JSONModel({
                  path : oRootPath,
                });
          this.setModel(oImageModel, "imageModel");
        },
        callPlants: function () {
          console.log("plants API called");
          var appId = this.getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);
          var url = appModulePath + "/plant";
          var plantData = {};
          var that = this;
          jQuery.ajax({
              url: url,
              type: 'GET',
              contentType: 'application/json',
              async: false,
              headers: {
                  "X-CSRF-Token": this._fetchToken(),
              },
              data: {
                  // "plant": "0201"
                  "plant": that.getModel("context").getData().PurchaseReq.Plant
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
        setTaskModels: function () {
          // set the task model
          var startupParameters = this.getComponentData().startupParameters;
          var taskData = startupParameters.taskModel.getData();
          taskData.CreatedByName = "";
          taskData.CreatedBy = "";
          startupParameters.taskModel.setData(taskData);
          this.setModel(startupParameters.taskModel, "task");
          // set the task context model
          var taskContextModel = new sap.ui.model.json.JSONModel(
            this._getTaskInstancesBaseURL() + "/context"
          );
          this.setModel(taskContextModel, "context");
        },
        _getTaskInstancesBaseURL: function () {
          return (
            this._getWorkflowRuntimeBaseURL() +
            "/task-instances/" +
            this.getTaskInstanceID()
          );
        },
        _getWorkflowRuntimeBaseURL: function () {
          var appId = this.getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);
          return appModulePath + "/bpmworkflowruntime/v1";
        },
        getTaskInstanceID: function () {
          return this.getModel("task").getData().InstanceID;
        },
        getInboxAPI: function () {
          var startupParameters = this.getComponentData().startupParameters;
          return startupParameters.inboxAPI;
        },
        completeTask: function (approvalStatus) {
        var that = this;
        var userInfo = sap.ushell.Container.getService("UserInfo");
        try{ 
           that.getModel("context").getData().PurchaseReq.logs = that.getModel("context").getData().PurchaseReq.logs ? that.getModel("context").getData().PurchaseReq.logs : [];
          //  that.getModel("context").getData().PurchaseReq.approvalStatus = approvalStatus;
           if(approvalStatus){ 
              // On approve add the approver name to log and update the level in BTP DB
              that.getModel("context").getData().PurchaseReq.logs.push({
                approver : userInfo.getFullName(),
                level : that.getModel("context").getData().PurchaseReq.approvalLevel.toString(),
                timestamp : new Date(Date.now()).toString().substr(0,15),
                from: "APP"
              });
              that.getModel("context").getData().PurchaseReq.approvalLevel = that.getModel("context").getData().PurchaseReq.approvalLevel + 1;
              var nextApprover = that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover?that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover:'';
              console.log(nextApprover);
              that.storeApproverLevel(that.getModel("context").getData().PurchaseReq, nextApprover);
           } else {
              // On reject update rej indicator in BTP DB
              that.RejectTask(that.getModel("context").getData().PurchaseReq);
           }
            // that.getModel("context").getData().PurchaseReq.approvalLevel = that.getModel("context").getData().PurchaseReq.approvalLevel + 1;
            // that.getModel("context").getData().PurchaseReq.dbUpdate = true;
            that.getModel("context").setProperty("/approved", approvalStatus);
            // var nextApprover = that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover?that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover:'';
            var approvalBody = {
              approvalStatus : approvalStatus,
              nextApprover : nextApprover,
              prId : that.getModel("context").getData().PurchaseReq.PurchaseRequisition.trim(),
              ItemNr: that.getModel("context").getData().PurchaseReq.PrItemNumber,
              Level: that.getModel("context").getData().PurchaseReq.approvalLevel - 1,
              Destination : that.Destination,
              UserId : userInfo.getEmail()
            }
            that._callECC(approvalBody);
            if(!approvalStatus){
              MessageBox.success("The workflow for this Purchase Requisition is Rejected", {
                onClose:function() {
                  that._patchTaskInstance();
                  that._refreshTaskList();
                }
              });
            }
            else if(that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover=="") {
              MessageBox.success("The workflow for this Purchase Requisition is completed",{
                onClose:function() {
                  that._patchTaskInstance();
                  that._refreshTaskList();
                }
              });
            }  
            else {
              MessageBox.success("Step completed new approver will be " + nextApprover,{
                onClose:function() {
                  that._patchTaskInstance();
                  that._refreshTaskList();
                }
              });
            }
        } catch(e) {
            console.log("APPROVAL or REJECT FAILED");
        }
        },
        _callECC: function(approvalBody) {
            console.log("Approver of reject");
            var appId = this.getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var url = appModulePath + "/ApproveReject"
            // var url = appModulePath + "/backend/sap/opu/odata/sap/ZRMM_F_IFC_REJPR_SD_SRV";
            jQuery.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json',
                data: approvalBody,
                headers: {
                  "X-CSRF-Token": this._fetchToken(),
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
        storeApproverLevel: function(PRPostdata, approver) {
          console.log("update approver and its level");
          var appId = this.getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);
          var url = appModulePath + "/storeapprover";
          jQuery.ajax({
              url: url,
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                  "approver" : approver,
                  "level" : PRPostdata.approvalLevel,
                  "PRId" : PRPostdata.PurchaseRequisition,
                  "ItemNr" : PRPostdata.PrItemNumber
                  // "WorkflowInstance" : PRPostdata.wfInstance
              }),
              headers: {
                  "X-CSRF-Token": this._fetchToken(),
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
        RejectTask: function(PRPostdata) {
          console.log("reject task");
          var appId = this.getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);
          var url = appModulePath + "/RejectTask";
          jQuery.ajax({
              url: url,
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                  "PRId" : PRPostdata.PurchaseRequisition,
                  "ItemNr" : PRPostdata.PrItemNumber
                  // "WorkflowInstance" : PRPostdata.wfInstance
              }),
              headers: {
                  "X-CSRF-Token": this._fetchToken(),
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

        _patchTaskInstance: function () {
          var data = {
            status: "COMPLETED",
            context: this.getModel("context").getData()
          };
          // data.context = this.getModel("context").getData();
          jQuery.ajax({
            url: this._getTaskInstancesBaseURL(),
            method: "PATCH",
            contentType: "application/json",
            async: false,
            data: JSON.stringify(data),
            headers: {
              "X-CSRF-Token": this._fetchToken(),
            },
            success: function(){
              
            },
            error: function(xhr, error){
                MessageBox.error("Approval or Rejection of PR failed.")
            }
          });
        },
        _fetchToken: function () {
          var fetchedToken;
          jQuery.ajax({
            url: this._getWorkflowRuntimeBaseURL() + "/xsrf-token",
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success(result, xhr, data) {
              fetchedToken = data.getResponseHeader("X-CSRF-Token");
            },
          });
          return fetchedToken;
        },
        _refreshTaskList: function () {
          this.getInboxAPI().updateTask("NA", this.getTaskInstanceID());
        },
      }
    );
  }
);
