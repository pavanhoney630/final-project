const express = require('express');

const router = express.Router()

const {getAnalytics} = require('../../controller/FormsController/FormAnalytics.controller')

const {authToken} = require('../../middleware/authMiddleware');


router.get('/getAnalytics/:formId',authToken,getAnalytics);

module.exports = router;