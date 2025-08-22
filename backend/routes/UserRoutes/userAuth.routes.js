const express = require('express');
const router = express.Router();

// Import authentication controller functions
const { signup, login, updateUser} = require('../../controller/UserController/userAuth.controller');
//middleware
const {authToken} = require("../../middleware/authMiddleware")

// Register route
router.post('/register', signup);

// Login route
router.post('/login', login);

// Update User
router.put('/updateUser',authToken,updateUser)

module.exports = router