/*eslint no-console: 0, no-unused-vars: 0, no-use-before-define: 0, no-redeclare: 0, no-undef: 0*/
//To use a javascript controller its name must end with .controller.js
sap.ui.define([
	"teched/odataCreate/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("teched.odataCreate.controller.App", {

		onInit: function() {

			var oConfig = this.getOwnerComponent().getModel("config");
			var userName = oConfig.getProperty("/UserName");

			var urlMulti = "/SYS_DATA.xsodata";
			this.getOwnerComponent().getModel().setProperty("/mPath", urlMulti);
			this.getOwnerComponent().getModel().setProperty("/mEntity1", "SYS_DATA");

		},
		callService: function() {
			var oTable = this.getView().byId("tblPOHeader");

			var mPath = this.getOwnerComponent().getModel().getProperty("/mPath");
			var mEntity1 = this.getOwnerComponent().getModel().getProperty("/mEntity1");

			var oParams = {};
			oParams.json = true;
			oParams.useBatch = false;
			var oModel = new sap.ui.model.odata.v2.ODataModel(mPath, oParams);
			oModel.attachEvent("requestFailed", oDataFailed);

			function fnLoadMetadata() {
				oTable.setModel(oModel);
				oTable.setEntitySet(mEntity1);
				var oMeta = oModel.getServiceMetadata();
				var headerFields = "";
				for (var i = 0; i < oMeta.dataServices.schema[0].entityType[0].property.length; i++) {
					var property = oMeta.dataServices.schema[0].entityType[0].property[i];
					headerFields += property.name + ",";
				}
				oTable.setInitiallyVisibleFields(headerFields);
			}

			oModel.attachMetadataLoaded(oModel, function() {
				fnLoadMetadata();
			});

			oModel.attachMetadataFailed(oModel, function() {
				sap.m.MessageBox.show("Bad Service Definition", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Service Call Error",
					actions: [sap.m.MessageBox.Action.OK],
					styleClass: "sapUiSizeCompact"
				});
			});
		},

		callCreate: function(oEvent) {
			var oTable = this.getView().byId("tblPOHeader");
			var oModel = oTable.getModel();
			
			var oConfig = this.getOwnerComponent().getModel("config");
			var userName = oConfig.getProperty("/UserName");

			var urlMulti = "/SYS_DATA.xsodata";
			var rollout = this.getOwnerComponent().getModel().getProperty("/rollout");
			var phase = this.getOwnerComponent().getModel().getProperty("/phase");
			
			//	var result = this.getView().getModel().getData();
			var oEntry = {};
			oEntry.ROLLOUT = rollout;
			oEntry.PHASE = phase;
			oEntry.CLIENT = "001";
			oEntry.SRC_SYS_ID = "HXE";
			oEntry.S4_SYS_ID = "ABE";
			oEntry.SRC_SYS =  "TST";
			oEntry.SDI_PATH = "/tst";

			oModel.setHeaders({
				"content-type": "application/json;charset=utf-8"
			});
			var mParams = {};
			mParams.success = function() {
				sap.m.MessageToast.show("Create successful");
			};
			mParams.error = this.onErrorCall;
			var mEntity1 = this.getOwnerComponent().getModel().getProperty("/mEntity1");
			oModel.create("/" + mEntity1, oEntry, mParams);
		},


		onErrorCall: function(oError) {
			if (oError.statusCode === 500 || oError.statusCode === 400 || oError.statusCode === "500" || oError.statusCode === "400") {
				var errorRes = JSON.parse(oError.responseText);
				if (!errorRes.error.innererror) {
					sap.m.MessageBox.alert(errorRes.error.message.value);
				} else {
					if (!errorRes.error.innererror.message) {
						sap.m.MessageBox.alert(errorRes.error.innererror.toString());
					} else {
						sap.m.MessageBox.alert(errorRes.error.innererror.message);
					}
				}
				return;
			} else {
				sap.m.MessageBox.alert(oError.response.statusText);
				return;
			}

		}
	});
});