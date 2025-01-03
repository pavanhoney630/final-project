const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Assuming Bearer token
  if (!token) return res.status(403).send("Token is missing");

  const JWT_SECRET = process.env.JWT_SECRET;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Error decoding token:", err);
      return res.status(403).send("Invalid token");
    }
    
    console.log("Decoded JWT:", decoded);  // Log decoded token for debugging

    // Assuming 'id' is directly in the decoded token, not in 'payload'
    req.userId = decoded.id; // Access the 'id' from the decoded object directly
    next();
  });
};

module.exports = verifyToken;
