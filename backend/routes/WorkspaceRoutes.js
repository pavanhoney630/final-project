const express = require('express');
const Workspaces = require('../models/Workspaces');
const authenticate = require('../middleware/authMiddleware');  // Authentication middleware
const router = express.Router();  // Express Router instance

// Fetch workspaces for the authenticated user
// Example route in backend to fetch user profile (assuming 'userName' is part of the user data)


router.get('/workspaces', authenticate, async (req, res) => {
  const userId = req.userId; // userId set by the authentication middleware

  try {
    // Find all workspaces where the user is a member
    const userWorkspaces = await Workspaces.find({ users: userId });

    if (userWorkspaces.length === 0) {
      return res.status(404).json({ message: 'No workspaces found for this user.' });
    }

    // Return all workspaces
    res.status(200).json({
      message: 'Workspaces fetched successfully.',
      workspaces: userWorkspaces, // Return all workspaces without pagination
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
});

// POST route for creating a new workspace
router.post('/signup', authenticate, async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }
  try {
    const newWorkspace = new Workspaces({
      name,
      description,
      users: [req.userId],  // The user creating the workspace is the first member
    });
    await newWorkspace.save();
    res.status(201).json({ message: 'Workspace created successfully.', workspace: newWorkspace });
  } catch (err) {
    res.status(500).json({ message: 'Error creating workspace', error: err.message });
  }
});

module.exports = router;  // Exporting the router to be used in the main app
