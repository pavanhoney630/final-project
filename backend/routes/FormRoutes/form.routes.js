const express = require("express");

const router = express.Router();

const {createForm,getFormsInFolder,getFormById,editFormById,shareForm,deleteForm} = require("../../controller/FormsController/Form.controller");

const {authToken} = require("../../middleware/authMiddleware")

//create Form
router.post('/createForm/:workspaceId/:folderId',authToken,createForm);

//Get created Forms inside folder\
router.get('/getforms/:workspaceId/:folderId',authToken,getFormsInFolder)

//get Form content created by formId
router.get('/:workspaceId/:folderId/:formId',authToken,getFormById)

//

router.put('/:workspaceId/:folderId/:formId',authToken,editFormById)

//share Form via mail
router.post('/shareform/:formId',authToken,shareForm);

//delete form
router.delete('/deleteform/:formId/:folderId/:workspaceId',authToken,deleteForm);

module.exports = router;