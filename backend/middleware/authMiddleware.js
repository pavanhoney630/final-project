const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();


const authToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No valid token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch full user
    const User = require("../models/UserModel/UserAuth.model"); // import your User model
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // set req.user as object with id and email
    req.user = {
      id: user._id.toString(),
      email: user.email
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed, invalid token.' });
  }
};



module.exports = {authToken};
