const oauthClient = require("client-oauth2");
const express = require("express");
const request = require("request-promise");
const env = require("dotenv").config(); 
const e = require("express");
const axios = require('axios');
const xenv = require('@sap/xsenv');
const hdbext = require('@sap/hdbext');
let hanasrv = xenv.getServices({ hana: { tag: 'hana' } });
// let base="https://p001-comau-dev.authentication.eu10.hana.ondemand.com";
// const CLIENT_ID = "sb-clone-8b8c952a-77ac-4989-a110-cddc03175625!b21758|workflow!b10150";
// const APP_SECRET = "afcd46fe-2a6f-481c-a16f-9acc1854be4b$qlpE2gKfmhQkbANgBOtO5HookKy4n-5Iwsfb6GHnmYg=";

const app = express();
const PORT = process.env.PORT || 3000;

// const SERVICE_URL = "https://gwaas-vsin78dhk3.eu2.hana.ondemand.com/sap/opu/odata/sap/ZGW_SCP_STAGING_SRV/StagingSet?$filter=ProductionOrder%20eq%20%2730006191%27&$format=json";

// const VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
// const XSUAA_CLIENTID = VCAP_SERVICES.xsuaa[0].credentials.clientid;
// const XSUAA_CLIENTSECRET = VCAP_SERVICES.xsuaa[0].credentials.clientsecret;
// const XSUAA_URL = VCAP_SERVICES.xsuaa[0].credentials.url;
const dest_service = xenv.getServices({ dest: { tag: 'destination' } }).dest;
const uaa_service = xenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa;
const sUaaCredentials = dest_service.clientid + ':' + dest_service.clientsecret;


app.use(hdbext.middleware(hanasrv.hana));
app.use(express.json());
app.use(express.static(__dirname));

app.get('/plant', async(req, res) => {
	try{
		console.log("Plant API called");
		console.log("request body" + JSON.stringify(req.query));
		var hanaConfig = xenv.cfServiceCredentials({ tag: 'hana' });
		console.log("***Get Query***");
		hdbext.createConnection(hanaConfig, function(error, client) {
		if(error) {
			return console.error("error while creating connection :" + error);
		}  
		client.exec('SELECT * FROM "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PLANT" WHERE "PLANT" = ?', 
		    [req.query.plant],
			(err, result) => {
			   if (err) {
					console.log("error on get:" + err);
				} else {
					console.log(result);
				}
				res.status(200).json(result)
			});
		});
	} catch(err){
		console.log(err);
	}
})

app.post('/storeapprover', async(req, res) => { 
	try{
		console.log("Approval API called");
		var hanaConfig = xenv.cfServiceCredentials({ tag: 'hana' });
        var wfInstance = "";
		console.log("***Update Query***");
		hdbext.createConnection(hanaConfig, function(error, client) {
		if(error) {
			return console.error("error while creating connection :" + error);
		}  
		console.log("Approve body :" + JSON.stringify(req.body));
        // This query should give us the latest workflow instance created in this table for this PRid and Item nr
        client.exec('SELECT * FROM "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" WHERE "PURCHASEREQUISITION" = ? AND "ITEMNUMBER" = ? AND "REL_IND" = ? AND "REJ_IND" = ? AND "CHANGE_IND" = ? AND "CANCEL_IND" = ?',
        [req.body.PRId, parseInt(req.body.ItemNr), "", "", "", ""],
        (err, result) => {
           if (err) {
                console.log("error on get:" + err);
            } else {
                console.log("result to update" + JSON.stringify(result));
                wfInstance = result[0].INSTANCE_ID;
                relInd = req.body.approver == "" ? "X" : "";
                console.log("The potential latest workflow instance is " + wfInstance);
                client.exec('UPDATE "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" SET "CURRENTAPPROVER" = ?, "CURRENTLEVEL" = ?, "REL_IND" = ? WHERE "PURCHASEREQUISITION" = ? AND "ITEMNUMBER" = ? AND "INSTANCE_ID" = ?',
                    [req.body.approver, req.body.level, relInd, req.body.PRId, req.body.ItemNr, wfInstance],
                    (err) => {
                       if (err) {
                            console.log("error on update:" + err);
                        }
                    });
                }
            });
		});
		res.sendStatus(200);
	} catch(err){
		console.log(err);
	}
})

app.post('/RejectTask', async(req, res) => { 
	try{
		console.log("Reject API Called");
		var hanaConfig = xenv.cfServiceCredentials({ tag: 'hana' });
        var wfInstance = "";
		console.log("***Update Query for reject***");
		hdbext.createConnection(hanaConfig, function(error, client) {
		if(error) {
			return console.error("error while creating connection :" + error);
		}  
		console.log("Approve body :" + JSON.stringify(req.body));
        // This query should give us the latest workflow instance created in this table for this PRid and Item nr
        client.exec('SELECT * FROM "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" WHERE "PURCHASEREQUISITION" = ? AND "ITEMNUMBER" = ? AND "REL_IND" = ? AND "REJ_IND" = ? AND "CHANGE_IND" = ? AND "CANCEL_IND" = ?',
        [req.body.PRId, parseInt(req.body.ItemNr), "", "", "", ""],
        (err, result) => {
            if (err) {
                console.log("error on get:" + err);
            } else {
                console.log("result to update" + JSON.stringify(result));
                wfInstance = result[0].INSTANCE_ID;
                console.log("The potential latest workflow instance is " + wfInstance);
                client.exec('UPDATE "COMAUCLOIL_QAS"."SAP_COM_COMAU_ENTITIES_PURCHASEREQUISITION" SET "REJ_IND" = ? WHERE "PURCHASEREQUISITION" = ? AND "ITEMNUMBER" = ? AND "INSTANCE_ID" = ?',
                    ["X", req.body.PRId, parseInt(req.body.ItemNr), wfInstance],
                    (err) => {
                       if (err) {
                            console.log("error on update:" + err);
                        }
                    });        
                }
            });
		});
		res.sendStatus(200);
	} catch(err){
		console.log(err);
	}
})

app.get('/ApproveReject', async(req, res) => { 
	// if(req.query.destination == "COQ")
    if(req.query.Destination == "COP") {
        var sDestinationName = "SAPCOQBackground";
        var destinationtarget = "backend"; 
    } else if(req.query.Destination == "CAP") {
        var sDestinationName = "SAPCAQBackground";
        var destinationtarget = "CAQ"
    }
    // var sDestinationName = "SAPCOQBackground";
	var histRes = {};
	var Reject = '';
	var Release = '';
	const Status = (req.query.approvalStatus === 'true');
	const LastApproval = (req.query.nextApprover === "");
	console.log("Approval Status :" + req.query.approvalStatus);
	console.log("next approver :" + req.query.nextApprover);
	console.log(LastApproval);
	console.log(Status);
	if(Status && LastApproval) {
		Release = 'X';
		console.log("release");
	} else if(!Status){ 
		Reject = 'X';
		console.log("reject");
	}
    request({
        uri : uaa_service.url + '/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
            'Content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id': dest_service.clientid,
            'grant_type': 'client_credentials'
        }
    }).then((data) => {
        const token = JSON.parse(data).access_token;
        console.log("reached here :" + token);
        return request({
            uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    }).then(async (result)=>{
        console.log("approval reject reached here too");
        var destination = JSON.parse(result);
        console.log("destn confgn " + JSON.stringify(destination.destinationConfiguration));
        var user = destination.destinationConfiguration.User;
        var password = destination.destinationConfiguration.Password
		var PRId = req.query.prId.padStart(10, '0'); //change dynamic
		var ItemNr = req.query.ItemNr; // change to dynamic
        var userId = req.query.UserId;
        var level = req.query.Level;
		var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/" + destinationtarget + "/sap/opu/odata/sap/ZRMM_F_IFC_REJPR_SD_SRV/OutTabSet(Zuserid='" + userId + "',Zpureq='" + PRId + "',Zpureqitem='" + ItemNr + "',Zrelease='" + Release + "',Zreject='" + Reject + "',Znote='"+ level +"')";
		console.log("url:" + URL);
        approvalRes = await axios.get(URL, {  
            auth: {
                username: user,
                password: password
            }
        }).catch(err => {
            console.log("Error on approval or reject:" + err.message);
        });
        if(Release == 'X') {
            Release = ''
            var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/" + destinationtarget + "/sap/opu/odata/sap/ZRMM_F_IFC_REJPR_SD_SRV/OutTabSet(Zuserid='" + userId + "',Zpureq='" + PRId + "',Zpureqitem='" + ItemNr + "',Zrelease='" + Release + "',Zreject='" + Reject + "',Znote='"+ level +"')";
		    console.log("url:" + URL);
            approvalRes = await axios.get(URL, {  
                auth: {
                    username: user,
                    password: password
                }
            }).catch(err => {
                console.log("Error on approval or reject:" + err.message);
            });
        }
		// approvalRes.data.d.results.forEach(element => {
		// 	delete element['__metadata']
		// });
        console.log("Approval or Reject :" + JSON.stringify(approvalRes.data));
		res.send(approvalRes.data);
    });
})



app.get('/approvalHistory', async(req, res) => { 
	if(req.query.Destination == "COP") {
        var sDestinationName = "SAPCOQBackground";
        var destinationtarget = "backend"; 
    } else if(req.query.Destination == "CAP") {
        var sDestinationName = "SAPCAQBackground";
        var destinationtarget = "CAQ"
    }
	var histRes = {};
    request({
        uri : uaa_service.url + '/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
            'Content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id': dest_service.clientid,
            'grant_type': 'client_credentials'
        }
    }).then((data) => {
        const token = JSON.parse(data).access_token;
        console.log("approval hist reached here :" + token);
        return request({
            uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    }).then(async (result)=>{
        // console.log("approval history reached here too");
		// var PRId = "12345"; //make it dynamic
		// var ItemNr = "1";//make it dynamic
        console.log("approval history reached here too");
        var destination = JSON.parse(result);
        console.log("destn confgn " + JSON.stringify(destination.destinationConfiguration));
        var user = destination.destinationConfiguration.User;
        var password = destination.destinationConfiguration.Password
		var PRId = req.query.prId; //change dynamic
		var ItemNr = req.query.ItemNr; // change to dynamic
		var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/" + destinationtarget + "/sap/opu/odata/sap/ZGW_SCP_PRWF_HIST_SRV/OutTabSet?$filter=Zparametr eq '" + "A" + "' and PurchaseRequisition eq '"+ PRId + "' and PrItemNumber eq '" + ItemNr +"'";
		console.log("url:" + URL);
        histRes = await axios.get(URL, {  
            auth: {
                username: user,
                password: password
            }
        }).catch(err => {
            console.log("Error on approval history:" + err.message);
        });
		histRes.data.d.results.forEach(element => {
			delete element['__metadata']
		});
        console.log("Approval History :" + JSON.stringify(histRes.data));
		res.send(histRes.data.d.results);
    });
})

app.get('/Comments', async(req, res) => { 
	// if(req.query.destination == "COQ")
    // var sDestinationName = "SAPCOQ_CLONING";
    if(req.query.Destination == "COP") {
        var sDestinationName = "SAPCOQBackground";
        var destinationtarget = "backend"; 
    } else if(req.query.Destination == "CAP") {
        var sDestinationName = "SAPCAQBackground";
        var destinationtarget = "CAQ"
    }
	var commentRes = {};
    request({
        uri : uaa_service.url + '/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
            'Content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id': dest_service.clientid,
            'grant_type': 'client_credentials'
        }
    }).then((data) => {
        const token = JSON.parse(data).access_token;
        console.log("Comments reached here :" + token);
        return request({
            uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    }).then(async (result)=>{
        // console.log("comment api reached here too");
		// var PRId = "12345";//make it dynamic
		// var ItemNr = "1";//make it dynamic
        console.log("comment api reached here too");
        var destination = JSON.parse(result);
        console.log("destn confgn " + JSON.stringify(destination.destinationConfiguration));
        var user = destination.destinationConfiguration.User;
        var password = destination.destinationConfiguration.Password
		var PRId = req.query.prId; //change dynamic
		var ItemNr = req.query.ItemNr; // change to dynamic
		var URL = "https://p001-prapp-comau-qas.cfapps.eu10.hana.ondemand.com/"+destinationtarget+"/sap/opu/odata/sap/ZGW_SCP_PRWF_HIST_SRV/OutTabSet?$filter=Zparametr eq '" + "C" + "' and PurchaseRequisition eq '"+ PRId + "' and PrItemNumber eq '" + ItemNr +"'";
		console.log("url:" + URL);
        commentRes = await axios.get(URL, {  
            auth: {
                username: user,
                password: password
            }
        }).catch(err => {
            console.log("Error on comment api:" + err.message);
        });
		commentRes.data.d.results.forEach(element => {
			delete element['__metadata']
		});
        console.log("comment api :" + JSON.stringify(commentRes.data));
		res.send(commentRes.data.d.results);
    });
})
app.listen(PORT, console.log(`Listening on port ${PORT}`));