    /*
// read from existing workflow context 
var productInfo = $.context.productInfo; 
var productName = productInfo.productName; 
var productDescription = productInfo.productDescription;

// read contextual information
var taskDefinitionId = $.info.taskDefinitionId;

// read user task information
var lastUserTask1 = $.usertasks.usertask1.last;
var userTaskSubject = lastUserTask1.subject;
var userTaskProcessor = lastUserTask1.processor;
var userTaskCompletedAt = lastUserTask1.completedAt;

var userTaskStatusMessage = " User task '" + userTaskSubject + "' has been completed by " + userTaskProcessor + " at " + userTaskCompletedAt;

// create new node 'product'
var product = {
		productDetails: productName  + " " + productDescription,
		workflowStep: taskDefinitionId
};

// write 'product' node to workflow context
$.context.product = product;
*/
$.context.PurchaseReq.username = "";
var Vocabulary = {};
Vocabulary.PRdata = {};
Vocabulary.PRdata.approvalLevel = $.context.PurchaseReq.approvalLevel;
// Vocabulary.PRdata.plant = "0201";
Vocabulary.PRdata.plant = $.context.PurchaseReq.Plant;
// Vocabulary.PRdata.mail = $.context.PurchaseReq.EmailAddress;
// $.info.startedBy = "";
// new rules af4a5dfeb3774ef3837c645d1b9ea6db
// old-rule 323d5f816ba54e57968b41fa33542de7
var rulesPayload = {
    "RuleServiceId": "af4a5dfeb3774ef3837c645d1b9ea6db",
    "Vocabulary": [Vocabulary]
};
$.context.rulesPayload = rulesPayload; 
$.context.PurchaseReq.title = $.context.PurchaseReq.Purchaserequisition + "-" + $.context.PurchaseReq.ItemNr;
// pr.material = "Car";
// pr.location = "Bangalore";
