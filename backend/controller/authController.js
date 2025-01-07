const bcrypt = require('bcrypt');
const User = require('../models/User')
const jwt = require('jsonwebtoken');



const signup = async (req, res) => {

  const { username, email, password,confirmPassword } = req.body;

   

  
    // Check if all fields are provided
    if (!username || !email || !password ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
  
    try {
      // Check if user already exists
      const isUserExist = await User.findOne({ email });
      if (isUserExist) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password before saving it to the database
     
      const hashedPass = await bcrypt.hash(password, 10);
  
      // Create a new user with the provided details
      const user = await User.create({
        username,
        email,
        password: hashedPass,
      });
       await user.save()
      // Return a success message along with user details
      res.status(201).json({
        message: 'User created successfully!',
        username: user.username,
        email: user.email,
      });
      
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong.', error: error.message });
    }
}

const login = async (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Wrong username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Wrong username or password' });
    }

    const payload = {
      id: user._id,  // You could add more user info here as needed
      email: user.email,
      username:user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

module.exports = {
  signup,
  login,
};
