sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("workflowuimodule.controller.taskdetials", {
            onInit: function () {
                this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched,this);
            },

            onRouteMatched: function(){
                var oTaskDetails =  this.getOwnerComponent().getModel("taskDetails");
                this.getView().setModel(oTaskDetails, "taskDetails");
            }
        });
    });
