const express = require('express');
const router = express.Router();

const {createResponse,markStarted,submitResponse,exportResponses} = require('../../controller/FormsController/formResponse.controller')

const {authToken} = require('../../middleware/authMiddleware')

//create response for view count
router.post('/create/response/:formId',createResponse)

//mark as started
router.patch('/start/:responseId',markStarted);

//Track submitted answers
router.patch('/submitanswers/:responseId',submitResponse);

router.get('/exportResponses/:responseId',authToken,exportResponses)

module.exports = router;