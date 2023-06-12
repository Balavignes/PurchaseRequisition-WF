{
	"contents": {
		"47c6e008-f24f-4741-9548-e43540c84295": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "comau.dev.pr1.comauworkflow",
			"subject": "MyPR-1",
			"customAttributes": [],
			"name": "MyWorkflow",
			"documentation": "my sample PR",
			"lastIds": "62d7f4ed-4063-4c44-af8b-39050bd44926",
			"events": {
				"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
					"name": "StartEvent1"
				},
				"2798f4e7-bc42-4fad-a248-159095a2f40a": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"9c114c1e-ea56-4334-8715-9bbfb6cdafaf": {
					"name": "ScriptTask1"
				},
				"13f2e1bc-5d7e-4765-8862-5ba5edfd88cc": {
					"name": "Purchase Requisition"
				},
				"717d5329-1e13-4eda-b0c5-1c235e102a86": {
					"name": "select task"
				},
				"e9ad2b1e-8a76-43ed-9ebd-27d0e71ad574": {
					"name": "Iterate"
				},
				"1f690e6a-6584-4994-b6cb-2702e4c4abcb": {
					"name": "userselect"
				},
				"baa6b157-1bea-4fcc-a4a3-974e488c2f50": {
					"name": "MailTask3"
				}
			},
			"sequenceFlows": {
				"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
					"name": "SequenceFlow1"
				},
				"63df22a9-c42f-449d-a951-7f51c2329ddc": {
					"name": "SequenceFlow11"
				},
				"b64e6387-1209-43cc-b50d-930c06f40bf4": {
					"name": "SequenceFlow18"
				},
				"e22dc3cf-f2da-45ec-bc86-70e9c9d02bd0": {
					"name": "SequenceFlow19"
				},
				"b38facb9-4621-4c4b-a86e-d545b9630d56": {
					"name": "SequenceFlow29"
				},
				"892f1a5c-f4ce-4e3e-b43e-47894f440048": {
					"name": "SequenceFlow30"
				},
				"df0be7b3-296c-42ec-96f3-bbbfd06d3d60": {
					"name": "SequenceFlow31"
				},
				"943e06f2-dea4-4fe0-afd2-b5d2b34da36d": {
					"name": "SequenceFlow35"
				}
			},
			"diagrams": {
				"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {}
			}
		},
		"11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "StartEvent1",
			"sampleContextRefs": {
				"b029792f-986c-47ef-bc09-07efff34c0d3": {}
			}
		},
		"2798f4e7-bc42-4fad-a248-159095a2f40a": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"9c114c1e-ea56-4334-8715-9bbfb6cdafaf": {
			"classDefinition": "com.sap.bpm.wfs.ScriptTask",
			"reference": "/scripts/MyWorkflow/samplescript1.js",
			"id": "scripttask1",
			"name": "ScriptTask1"
		},
		"13f2e1bc-5d7e-4765-8862-5ba5edfd88cc": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "${context.PurchaseReq.title}",
			"description": "Price value has to come here.",
			"priority": "LOW",
			"isHiddenInLogForParticipant": true,
			"supportsForward": false,
			"userInterface": "sapui5://ComaudevPR-1.workflowuimodule/workflowuimodule",
			"recipientUsers": "${context.PurchaseReq.username.Result[0].Approvers.Approver}",
			"recipientGroups": "",
			"userInterfaceParams": [],
			"customAttributes": [{
				"id": "CustomCreatedBy",
				"label": "CustomCreatedBy",
				"type": "string",
				"value": " ${context.PurchaseReq.AccountAssignmentCategory}"
			}, {
				"id": "CustomObjectAttributeValue",
				"label": "CustomObjectAttributeValue",
				"type": "string",
				"value": "${context.PurchaseReq.MaterialDescription}"
			}, {
				"id": "CustomNumberUnitValue",
				"label": "CustomNumberUnitValue",
				"type": "string",
				"value": "${context.PurchaseReq.CurrencyKey}"
			}, {
				"id": "CustomTaskTitle",
				"label": "CustomTaskTitle",
				"type": "string",
				"value": "${context.PurchaseReq.title}"
			}, {
				"id": "CustomNumberValue",
				"label": "CustomNumberValue",
				"type": "string",
				"value": "${context.PurchaseReq.Amount}"
			}],
			"id": "usertask1",
			"name": "Purchase Requisition",
			"documentation": "Checking where it comes"
		},
		"717d5329-1e13-4eda-b0c5-1c235e102a86": {
			"classDefinition": "com.sap.bpm.wfs.ServiceTask",
			"destination": "BUSINESS_RULES",
			"destinationSource": "consumer",
			"path": "/rest/v2/workingset-rule-services",
			"httpMethod": "POST",
			"requestVariable": "${context.rulesPayload}",
			"responseVariable": "${context.PurchaseReq.username}",
			"id": "servicetask1",
			"name": "select task"
		},
		"e9ad2b1e-8a76-43ed-9ebd-27d0e71ad574": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway2",
			"name": "Iterate",
			"default": "943e06f2-dea4-4fe0-afd2-b5d2b34da36d"
		},
		"1f690e6a-6584-4994-b6cb-2702e4c4abcb": {
			"classDefinition": "com.sap.bpm.wfs.ExclusiveGateway",
			"id": "exclusivegateway3",
			"name": "userselect"
		},
		"baa6b157-1bea-4fcc-a4a3-974e488c2f50": {
			"classDefinition": "com.sap.bpm.wfs.MailTask",
			"destinationSource": "consumer",
			"id": "mailtask3",
			"name": "MailTask3",
			"mailDefinitionRef": "3662f9e5-3760-482a-a713-d035b79f5cdb"
		},
		"c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3",
			"targetRef": "9c114c1e-ea56-4334-8715-9bbfb6cdafaf"
		},
		"63df22a9-c42f-449d-a951-7f51c2329ddc": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"condition": "${context.PurchaseReq.username.Result[0].Approvers.NextApprover != \"\"}",
			"id": "sequenceflow11",
			"name": "SequenceFlow11",
			"sourceRef": "e9ad2b1e-8a76-43ed-9ebd-27d0e71ad574",
			"targetRef": "9c114c1e-ea56-4334-8715-9bbfb6cdafaf"
		},
		"b64e6387-1209-43cc-b50d-930c06f40bf4": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow18",
			"name": "SequenceFlow18",
			"sourceRef": "9c114c1e-ea56-4334-8715-9bbfb6cdafaf",
			"targetRef": "717d5329-1e13-4eda-b0c5-1c235e102a86"
		},
		"e22dc3cf-f2da-45ec-bc86-70e9c9d02bd0": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow19",
			"name": "SequenceFlow19",
			"sourceRef": "717d5329-1e13-4eda-b0c5-1c235e102a86",
			"targetRef": "1f690e6a-6584-4994-b6cb-2702e4c4abcb"
		},
		"b38facb9-4621-4c4b-a86e-d545b9630d56": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow29",
			"name": "SequenceFlow29",
			"sourceRef": "1f690e6a-6584-4994-b6cb-2702e4c4abcb",
			"targetRef": "baa6b157-1bea-4fcc-a4a3-974e488c2f50"
		},
		"892f1a5c-f4ce-4e3e-b43e-47894f440048": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow30",
			"name": "SequenceFlow30",
			"sourceRef": "baa6b157-1bea-4fcc-a4a3-974e488c2f50",
			"targetRef": "13f2e1bc-5d7e-4765-8862-5ba5edfd88cc"
		},
		"df0be7b3-296c-42ec-96f3-bbbfd06d3d60": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow31",
			"name": "SequenceFlow31",
			"sourceRef": "13f2e1bc-5d7e-4765-8862-5ba5edfd88cc",
			"targetRef": "e9ad2b1e-8a76-43ed-9ebd-27d0e71ad574"
		},
		"943e06f2-dea4-4fe0-afd2-b5d2b34da36d": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow35",
			"name": "SequenceFlow35",
			"sourceRef": "e9ad2b1e-8a76-43ed-9ebd-27d0e71ad574",
			"targetRef": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"42fa7a2d-c526-4a02-b3ba-49b5168ba644": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"df898b52-91e1-4778-baad-2ad9a261d30e": {},
				"53e54950-7757-4161-82c9-afa7e86cff2c": {},
				"6bb141da-d485-4317-93b8-e17711df4c32": {},
				"6226ddf2-0cf7-4dde-9056-3cf267cb9810": {},
				"903fcc6a-f155-4d1f-9cf3-3d3bfca11eb2": {},
				"252d12bd-fe79-4682-9314-2b2727000a56": {},
				"3d2247c4-a11a-412f-a4c5-7adecc612e28": {},
				"1370c187-5b77-4224-bcf8-04c079e48db4": {},
				"66bf7d33-7ff1-4018-8989-141f310a688b": {},
				"01b80bcc-f254-4f1c-bb5e-8a18cbf518c0": {},
				"492036f6-e1f0-4433-9e0e-876bc2315b20": {},
				"280088fc-5153-4f84-88fd-265bb21ccafd": {},
				"6466e9a8-1b13-4e50-8475-5dfcb6441eb6": {},
				"693bd0f0-598d-4556-a082-3c420e3c501a": {},
				"0b1759eb-f003-419d-bc13-4ad11117e8b7": {},
				"beb62950-0a29-4ef2-8a8a-b7aab875118b": {}
			}
		},
		"b029792f-986c-47ef-bc09-07efff34c0d3": {
			"classDefinition": "com.sap.bpm.wfs.SampleContext",
			"reference": "/sample-data/MyWorkflow/sampledata.json",
			"id": "default-start-context"
		},
		"df898b52-91e1-4778-baad-2ad9a261d30e": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 22,
			"y": 132.49999970197678,
			"width": 32,
			"height": 32,
			"object": "11a9b5ee-17c0-4159-9bbf-454dcfdcd5c3"
		},
		"53e54950-7757-4161-82c9-afa7e86cff2c": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 123.9999988079071,
			"y": 12,
			"width": 35,
			"height": 35,
			"object": "2798f4e7-bc42-4fad-a248-159095a2f40a"
		},
		"6bb141da-d485-4317-93b8-e17711df4c32": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "54,148.49999970197678 88.99999940395355,148.49999970197678 88.99999940395355,127 123.9999988079071,127",
			"sourceSymbol": "df898b52-91e1-4778-baad-2ad9a261d30e",
			"targetSymbol": "6226ddf2-0cf7-4dde-9056-3cf267cb9810",
			"object": "c6b99f32-5fe6-4ab6-b60a-80fba1b9ae0f"
		},
		"6226ddf2-0cf7-4dde-9056-3cf267cb9810": {
			"classDefinition": "com.sap.bpm.wfs.ui.ScriptTaskSymbol",
			"x": 123.9999988079071,
			"y": 97,
			"width": 102,
			"height": 60,
			"object": "9c114c1e-ea56-4334-8715-9bbfb6cdafaf"
		},
		"903fcc6a-f155-4d1f-9cf3-3d3bfca11eb2": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 747.9999940395355,
			"y": 72.49999970197678,
			"width": 100,
			"height": 60,
			"object": "13f2e1bc-5d7e-4765-8862-5ba5edfd88cc"
		},
		"252d12bd-fe79-4682-9314-2b2727000a56": {
			"classDefinition": "com.sap.bpm.wfs.ui.ServiceTaskSymbol",
			"x": 295.9999976158142,
			"y": 54.5,
			"width": 100,
			"height": 60,
			"object": "717d5329-1e13-4eda-b0c5-1c235e102a86"
		},
		"3d2247c4-a11a-412f-a4c5-7adecc612e28": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 12,
			"y": 40.499999701976776,
			"object": "e9ad2b1e-8a76-43ed-9ebd-27d0e71ad574"
		},
		"1370c187-5b77-4224-bcf8-04c079e48db4": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "54,61.499999701976776 88.99999940395355,61.499999701976776 88.99999940395355,127 123.9999988079071,127",
			"sourceSymbol": "3d2247c4-a11a-412f-a4c5-7adecc612e28",
			"targetSymbol": "6226ddf2-0cf7-4dde-9056-3cf267cb9810",
			"object": "63df22a9-c42f-449d-a951-7f51c2329ddc"
		},
		"66bf7d33-7ff1-4018-8989-141f310a688b": {
			"classDefinition": "com.sap.bpm.wfs.ui.ExclusiveGatewaySymbol",
			"x": 465.9999964237213,
			"y": 63.5,
			"object": "1f690e6a-6584-4994-b6cb-2702e4c4abcb"
		},
		"01b80bcc-f254-4f1c-bb5e-8a18cbf518c0": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "225.9999988079071,127 260.99999821186066,127 260.99999821186066,84.5 295.9999976158142,84.5",
			"sourceSymbol": "6226ddf2-0cf7-4dde-9056-3cf267cb9810",
			"targetSymbol": "252d12bd-fe79-4682-9314-2b2727000a56",
			"object": "b64e6387-1209-43cc-b50d-930c06f40bf4"
		},
		"492036f6-e1f0-4433-9e0e-876bc2315b20": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "395.9999976158142,84.5 465.9999964237213,84.5",
			"sourceSymbol": "252d12bd-fe79-4682-9314-2b2727000a56",
			"targetSymbol": "66bf7d33-7ff1-4018-8989-141f310a688b",
			"object": "e22dc3cf-f2da-45ec-bc86-70e9c9d02bd0"
		},
		"280088fc-5153-4f84-88fd-265bb21ccafd": {
			"classDefinition": "com.sap.bpm.wfs.ui.MailTaskSymbol",
			"x": 577.9999952316284,
			"y": 55.5,
			"width": 100,
			"height": 58,
			"object": "baa6b157-1bea-4fcc-a4a3-974e488c2f50"
		},
		"6466e9a8-1b13-4e50-8475-5dfcb6441eb6": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "507.9999964237213,84.5 577.9999952316284,84.5",
			"sourceSymbol": "66bf7d33-7ff1-4018-8989-141f310a688b",
			"targetSymbol": "280088fc-5153-4f84-88fd-265bb21ccafd",
			"object": "b38facb9-4621-4c4b-a86e-d545b9630d56"
		},
		"693bd0f0-598d-4556-a082-3c420e3c501a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "677.9999952316284,84.5 712.999994635582,84.5 712.999994635582,92.49999970197678 747.9999940395355,92.49999970197678",
			"sourceSymbol": "280088fc-5153-4f84-88fd-265bb21ccafd",
			"targetSymbol": "903fcc6a-f155-4d1f-9cf3-3d3bfca11eb2",
			"object": "892f1a5c-f4ce-4e3e-b43e-47894f440048"
		},
		"0b1759eb-f003-419d-bc13-4ad11117e8b7": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "747.9999940395355,92.49999970197678 712.999994635582,92.49999970197678 712.999994635582,148.49999940395355 542.9999958276749,148.49999940395355 542.9999958276749,140.49999940395355 430.99999701976776,140.49999940395355 430.99999701976776,149.49999940395355 260.99999821186066,149.49999940395355 260.99999821186066,191.99999940395355 88.99999940395355,191.99999940395355 88.99999940395355,61.499999701976776 54,61.499999701976776",
			"sourceSymbol": "903fcc6a-f155-4d1f-9cf3-3d3bfca11eb2",
			"targetSymbol": "3d2247c4-a11a-412f-a4c5-7adecc612e28",
			"object": "df0be7b3-296c-42ec-96f3-bbbfd06d3d60"
		},
		"beb62950-0a29-4ef2-8a8a-b7aab875118b": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "54,61.499999701976776 88.99999940395355,61.499999701976776 88.99999940395355,29.5 123.9999988079071,29.5",
			"sourceSymbol": "3d2247c4-a11a-412f-a4c5-7adecc612e28",
			"targetSymbol": "53e54950-7757-4161-82c9-afa7e86cff2c",
			"object": "943e06f2-dea4-4fe0-afd2-b5d2b34da36d"
		},
		"62d7f4ed-4063-4c44-af8b-39050bd44926": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"timereventdefinition": 1,
			"maildefinition": 3,
			"hubapireference": 1,
			"sequenceflow": 35,
			"startevent": 2,
			"boundarytimerevent": 1,
			"endevent": 1,
			"usertask": 3,
			"servicetask": 3,
			"scripttask": 4,
			"mailtask": 3,
			"exclusivegateway": 3,
			"parallelgateway": 1
		},
		"3662f9e5-3760-482a-a713-d035b79f5cdb": {
			"classDefinition": "com.sap.bpm.wfs.MailDefinition",
			"name": "maildefinition3",
			"to": "${context.PurchaseReq.username.Result[0].Approvers.Approver}",
			"subject": "Purchase Requisition (${context.PurchaseReq.prContent}) Assigned",
			"text": "Hello,\n\nThe Purchase Requisition: ${context.PurchaseReq.prContent} is assigned to your user. Please evaluate it in the Purchase Requisition App.\n\nThanks & Regards,\nworkflow\n\n",
			"id": "maildefinition3"
		}
	}
}