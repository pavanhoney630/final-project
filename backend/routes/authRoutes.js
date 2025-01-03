const router = require('express').Router();
const authenticate = require('../middleware/authMiddleware'); // Auth middleware
const Form = require('../models/Form.Schema');
const FormResponse = require('../models/FormResponseSchema');
const {signup, login, } = require('../controller/authController');
const {sendEmailInvite, sendFormEmail} = require('../controller/nodeMailer')
// const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator'); // Validation library
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');





router.post('/signup', signup);
router.post('/login', login);

// Fetch User Profile
router.get('/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // Use req.userId instead of req.params.userId
    if (user) {
      res.json({ username: user.username, userEmail: user.email, theme: user.theme });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user profile', error: err.message });
  }
});


const inviterEmail = process.env.EMAIL_USER; // Use the email from the environment

router.post('/send-invite', [
  body('email').isEmail().withMessage('Invalid email address'),
  body('accessType').isIn(['Edit', 'View']).withMessage('Invalid access type'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, accessType } = req.body;

  try {
    await sendEmailInvite(email, accessType, inviterEmail); // Use static inviter email
    res.status(200).json({ message: `Invite sent to ${email}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send invite.', error: error.message });
  }
});



// Generate Access Link
router.post('/generate-link', authenticate, async (req, res) => {
  // Destructure accessType from the request body
  const { accessType } = req.body;

  // Validate if accessType is provided
  if (!accessType) {
    return res.status(400).json({ message: 'Access type is required.' });
  }

  try {
    // Log to ensure accessType is passed correctly
    console.log('Received Access Type:', accessType);

    // Generate the JWT token with the accessType and userId
    const accessToken = jwt.sign(
      { accessType, userId: req.userId }, // Include accessType and userId in the token
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log the secret and generated token for debugging
    console.log('JWT Secret:', process.env.JWT_SECRET);
    console.log('Generated Access Token:', accessToken);

    // Generate the access link including the token
    const accessLink = `http://localhost:3000/profile?token=${accessToken}`;
    console.log('Generated Access Link:', accessLink);

    // Respond with the generated link
    return res.status(200).json({
      message: 'Access link generated successfully.',
      accessLink,
    });
  } catch (error) {
    // Log any errors for debugging
    console.error('Error generating link:', error);
    return res.status(500).json({ message: 'Failed to generate access link.' });
  }
});



// Update User Details
router.put(
  '/update-user',
  authenticate,
  async (req, res) => {
    const { username, email, oldPassword, newPassword } = req.body;
    const userId = req.userId;

    // Validate username, email, and password if provided
    if (username && username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (newPassword && newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if password needs to be updated and if oldPassword is provided
    if (newPassword && !oldPassword) {
      return res.status(400).json({ message: 'Please enter the old password to update the new password.' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // If oldPassword is provided, verify the old password before updating the new password
      if (oldPassword) {
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
          return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        if (newPassword) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);
        }
      }

      // Update username or email if provided
      if (username) user.username = username;
      if (email) user.email = email;

      // Save the updated user details
      await user.save();
      res.status(200).json({ message: 'User details updated successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong.', error: error.message });
    }
  }
);



// Submit form route
router.post('/form/submit', authenticate, async (req, res) => {
  const { name, fields } = req.body;

  if (!name || !fields || !Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ message: 'Form name and valid fields are required.' });
  }

  try {
    // Save the form without requiring recipient email
    const newForm = new Form({
      name,
      fields,
      userId: req.userId,
    });

    await newForm.save();

    res.status(201).json({
      message: 'Form saved successfully.',
      formId: newForm._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save form.', error: error.message });
  }
});



// Fetch Form by ID
// Fetch Form by ID
router.get('/form/:id', async (req, res) => {
  const { id } = req.params;

  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid form ID." });
  }

  try {
    // Fetch form from database
    const form = await Form.findById(id).select('name fields'); // Project only the necessary fields
    
    // Check if form exists
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    // Return form details, including name and field properties
    res.json({
      name: form.name,
      fields: form.fields.map(({ label, type, placeholder }) => ({
        label,
        type,
        placeholder,
      })),
    });
  } catch (error) {
    console.error("Error fetching form:", error); // Log the error for debugging
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
});

// Route to send form URL to a specific emai


router.post(
  '/send-form-email',
  authenticate, // Add the authentication middleware
  [
    // Only validate the email field
    body('email').isEmail().withMessage('Invalid email address'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Retrieve the authenticated user's ID from the middleware
      const userId = req.userId; 
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized access' });
      }

      // Fetch the form associated with the user ID
      const form = await Form.findOne({ userId });
      if (!form) {
        return res.status(404).json({ message: 'Form not found for the user' });
      }

      const formId = form._id; // Extract form ID
      const formUrl = `http://localhost:3000/form/${formId}`; // Generate the form URL

      // Send the form email
      await sendFormEmail(email, formUrl, userId);

      // Respond with a success message
      res.status(200).json({ message: `Form link sent to ${email}` });
    } catch (error) {
      // Handle server errors
      res.status(500).json({ message: 'Failed to send form link.', error: error.message });
    }
  }
);

// authRoutes.js
// authRoutes.js
// In your route handler (authRoutes.js)




router.post('/form/:id/submit', async (req, res) => {
  const { id } = req.params;  // Extract form ID from the URL params
  const formData = req.body;  // This will contain the submitted form data

  // Check if the form ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid form ID." });
  }

  try {
    // Find the form by its ID
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    // Create a new FormResponse document to save the submitted form data
    const formResponse = new FormResponse({
      formId: form._id,
      responses: formData,
    });

    // Save the form response to the database
    await formResponse.save();

    // Send a success response back to the client
    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    // Handle any errors that occur during the request
    console.error(error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
});

router.get('/forms', authenticate, async (req, res) => {
  const userId = req.userId; // Extract userId from authenticated user

  if (!userId) {
    return res.status(401).json({ message: "User ID not found" });
  }

  try {
    // Query the database to find all forms created by the current user
    const forms = await Form.find({ userId });

    // If no forms found, return a message
    if (!forms.length) {
      return res.status(404).json({ message: "No forms found for this user" });
    }

    // Return the forms as JSON
    res.status(200).json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
});


router.post('/form/:id/interact', async (req, res) => {
  const { id } = req.params;
  const { userId, status, responses, progress } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid form ID." });
  }

  try {
    const form = await FormResponse.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    let formResponse = await FormResponse.findOne({ formId: form._id, userId });

    // Handle different actions based on the status field
    switch (status) {
      case 'access': {
        if (formResponse) {
          // If form response already exists, just update the access time
          formResponse.accessedAt = new Date();
          await formResponse.save();
        } else {
          // Create a new form access record
          formResponse = new FormResponse({
            formId: form._id,
            userId,
            accessedAt: new Date(),
          });
          await formResponse.save();
        }
        return res.status(200).json({ message: "Form accessed successfully." });
      }

      case 'start': {
        if (formResponse) {
          // Update the start time and progress if the form is already accessed
          formResponse.startedAt = new Date();
          formResponse.progress = progress;
          await formResponse.save();
        } else {
          // Create a new record when the user starts filling out the form
          formResponse = new FormResponse({
            formId: form._id,
            userId,
            startedAt: new Date(),
            progress,
          });
          await formResponse.save();
        }
        return res.status(200).json({ message: "Form started successfully." });
      }

      case 'submit': {
        if (!responses) {
          return res.status(400).json({ message: "Form responses are required." });
        }
        if (formResponse) {
          // Update the form response with the submitted data and completion time
          formResponse.responses = responses;
          formResponse.completedAt = new Date();
          await formResponse.save();
        } else {
          // Create a new form submission record if it doesn't exist
          formResponse = new FormResponse({
            formId: form._id,
            userId,
            responses,
            completedAt: new Date(),
          });
          await formResponse.save();
        }
        return res.status(200).json({ message: "Form submitted successfully." });
      }

      default:
        return res.status(400).json({ message: "Invalid status." });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
});

// Endpoint to get form response stats
router.get('/form/:id/responses/stats', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid form ID." });
  }

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    const formResponses = await FormResponse.find({ formId: form._id });
    const stats = {
      accessed: 0,
      started: 0,
      submitted: 0,
    };

    formResponses.forEach((response) => {
      if (response.accessedAt) stats.accessed++;
      if (response.startedAt) stats.started++;
      if (response.completedAt) stats.submitted++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
});


router.get('/form/:id/responses', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid form ID." });
  }

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    const formResponses = await FormResponse.find({ formId: form._id });
    res.json(formResponses);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
});



module.exports = router;
