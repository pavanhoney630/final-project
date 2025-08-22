const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();


const authToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No valid token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed, invalid token.' });
  }
};


module.exports = {authToken};
