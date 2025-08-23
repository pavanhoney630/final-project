const express = require('express');

const router = express.Router();

const {updateTheme,getTheme} = require('../../controller/FormsController/theme.controller')

const {authToken} = require('../../middleware/authMiddleware')

router.patch('/updatetheme/:formId',authToken,updateTheme);

router.get('/getTheme/:formId',authToken,getTheme)

module.exports = router;
