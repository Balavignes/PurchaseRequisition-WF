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
              this.completeTask(false);
            },
            this
          );

          var oRootPath = sap.ui.require.toUrl("workflowuimodule/Logo-COMAU_NO-BALL.png"); 
          var oImageModel = new sap.ui.model.json.JSONModel({
	                path : oRootPath,
                });
          this.setModel(oImageModel, "imageModel");
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
        try{ 
           that.getModel("context").getData().PurchaseReq.logs = that.getModel("context").getData().PurchaseReq.logs ? that.getModel("context").getData().PurchaseReq.logs : [];
           if(approvalStatus){ 
              that.getModel("context").getData().PurchaseReq.logs.push({
                approver : that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.Approver,
                level : that.getModel("context").getData().PurchaseReq.approvalLevel.toString(),
                timestamp : new Date(Date.now())
              });
            } 
            that.getModel("context").getData().PurchaseReq.approvalLevel = that.getModel("context").getData().PurchaseReq.approvalLevel + 1;
            that.getModel("context").getData().PurchaseReq.dbUpdate = true;
            that.getModel("context").setProperty("/approved", approvalStatus);
            var nextApprover = that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover?that.getModel("context").getData().PurchaseReq.username.Result[0].Approvers.NextApprover:'';
            console.log(nextApprover);
            that._callECC(approvalStatus, nextApprover);
            that._patchTaskInstance();
            that._refreshTaskList();
        } catch(e) {
            console.log("APPROVAL or REJECT FAILED");
        }
        },

        _callECC: function(bapprovalStatus, nextApprover) {
            console.log("Approver of reject");
            var appId = this.getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            var url = appModulePath + "/ApproveReject";
            jQuery.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json',
                data: {
                  "approvalStatus": bapprovalStatus,
                  "nextApprover": nextApprover
                },
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
            status: "COMPLETED" 
          };
          data.context = this.getModel("context").getData();

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
