
$.context.PurchaseReq.username = "";
var Vocabulary = {};
Vocabulary.PRdata = {};
Vocabulary.PRdata.approvalLevel = $.context.PurchaseReq.approvalLevel;
Vocabulary.PRdata.Plant = $.context.PurchaseReq.Plant;
Vocabulary.PRdata.AccAssignCat = $.context.PurchaseReq.AccAssignCat;
Vocabulary.PRdata.CreationIndicator = $.context.PurchaseReq.CreationIndicator;
Vocabulary.PRdata.GlobalTotalAmountMAX = parseInt($.context.PurchaseReq.GlobalTotalAmount);
Vocabulary.PRdata.GlobalTotalAmountMIN = parseInt($.context.PurchaseReq.GlobalTotalAmount);
Vocabulary.PRdata.ItemCatInPurchDoc = $.context.PurchaseReq.ItemCatInPurchDoc;
Vocabulary.PRdata.WbsType = $.context.PurchaseReq.WbsType;
var rulesPayload = {
    "RuleServiceId": "af4a5dfeb3774ef3837c645d1b9ea6db",
    "Vocabulary": [Vocabulary]
};
$.context.rulesPayload = rulesPayload; 
$.context.PurchaseReq.title = $.context.PurchaseReq.PurchaseRequisition + "-" + $.context.PurchaseReq.PrItemNumber;
$.context.PurchaseReq.prContent = $.context.PurchaseReq.PurchaseRequisition + " - " + parseInt($.context.PurchaseReq.PrItemNumber).toString();