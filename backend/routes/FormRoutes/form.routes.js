const express = require("express");

const router = express.Router();

const {createForm,shareForm,deleteForm} = require("../../controller/FormsController/Form.controller");

const {authToken} = require("../../middleware/authMiddleware")

//create Form
router.post('/createForm/:workspaceId/:folderId',authToken,createForm);

//share Form via mail
router.post('/shareform/:formId',authToken,shareForm);

//delete form
router.delete('/deleteform/:formId/:folderId/:workspaceId',authToken,deleteForm);

module.exports = router;