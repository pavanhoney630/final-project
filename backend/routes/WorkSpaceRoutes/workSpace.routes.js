// routes/WorkSpace.routes.js
const express = require("express");
const router = express.Router();

const {authToken} = require('../../middleware/authMiddleware')

const {
  createWorkspaceOnLogin,
  getAllWorkspaces,
  shareWorkspace,
  workspaceById
} = require("../../controller/WorkSpace/workSpace.controller");

// Create workspace on login (only once per user)
router.post("/create-on-login/:userId", authToken,createWorkspaceOnLogin);

// Get all workspaces for dropdown (owned + shared)
router.get("/getAllWorkSpaces/:userId", authToken,getAllWorkspaces);

// Share workspace with another user
router.post("/WorkSpaceshare/:workspaceId", authToken,shareWorkspace);

//WorkSpaceById
router.get('/:workspaceId',authToken,workspaceById)

module.exports = router;
