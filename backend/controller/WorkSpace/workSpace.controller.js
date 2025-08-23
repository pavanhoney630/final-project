// controllers/WorkSpace.controller.js
const Workspace = require("../../models/WorkSpaceModel/workSpace.model");
const User = require("../../models/UserModel/UserAuth.model");
const nodemailer = require("nodemailer");

/**
 * Create workspace for user at login (only one allowed)
 */
const createWorkspaceOnLogin = async (req, res) => {
  try {

    const { userId } = req.params; // userId passed from login
    const user = await User.findById(userId);


    if (!req.user || !req.user.id) {
  return res.status(404).json({ message: "User not found" });
}


    // Check if workspace already exists
    let workspace = await Workspace.findOne({ owner: user._id });
    if (workspace) {
      return res.status(200).json({
        message: "Workspace already exists for this user",
        workspace,
      });
    }

    // Create new workspace with username
    workspace = new Workspace({
      workspaceName: user.username +"'s workspace", // 👈 workspace name from username
      owner: user._id,
      folders: [],
      members: [],
    });

    await workspace.save();
    return res.status(201).json({ Success:true, message: "Workspace created", workspace });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Failed to Create Workspace" });
  }
};


const getAllWorkspaces = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    // Get the logged-in user from DB
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: "Logged-in user not found" });

    // Fetch workspaces where user is owner OR member (shared)
    const workspaces = await Workspace.find({
      $or: [
        { owner: currentUser._id }, // owned workspaces
        { "members.user": currentUser._id }, // shared workspaces
        { "members.email": currentUser.email } // fallback by email if userId not set
      ],
    }).populate("owner", "username email");

    res.status(200).json({
      success: true,
      message: "All accessible workspaces fetched successfully",
      workspaces,
    });

  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces" });
  }
};


const shareWorkspace = async (req, res) => {
  try {
    // ✅ Fix req.user check
    if (!req.user.id|| req.user._id) {
      return res.status(404).json({ message: "User not found" });
    }

    const { workspaceId } = req.params;
    const { email, access } = req.body;

    if (!["read", "write"].includes(access)) {
      return res.status(400).json({ message: "Invalid access type" });
    }

    const workspace = await Workspace.findById(workspaceId).populate("owner", "username email");
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // check if already shared with this email
    const existingMember = workspace.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (existingMember) {
      existingMember.access = access; // update access if exists
    } else {
      // find user if registered
      const targetUser = await User.findOne({ email });
      workspace.members.push({
        user: targetUser ? targetUser._id : null,
        email,
        access,
      });
    }

    await workspace.save();

    // ✅ Send Email Notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Use frontend link so user can login and view shared workspace
    const workspaceLink = `https://final-project-api-dun.vercel.app/workspaces/${workspace._id}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Workspace Shared: ${workspace.workspaceName}`,
      html: `
        <p>Hello,</p>
        <p><b>${workspace.owner.username}</b> has shared the workspace 
        <b>${workspace.workspaceName}</b> with you.</p>
        <p>You have been given <b>${access}</b> access.</p>
        <p>Click below to open the workspace:</p>
        <a href="${workspaceLink}" target="_blank">Open Workspace</a>
        <br/><br/>
        <p>Thank you,<br/>Workspace Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
        success:true,
      message: "Workspace shared successfully and email sent",
      workspace 
    });

  } catch (error) {
    console.error("Error sharing workspace:", error);
    res.status(500).json({ message: "Failed to share Workspace" });
  }
};

const workspaceById = async (req, res) => {
  try {
    if (!req.user.id|| req.user._id) {
      return res.status(404).json({ message: "User not found" });
    }

    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "username email");
      // .populate("folders.forms"); // optional

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Get logged-in user from DB
    const currentUser = await User.findById(req.user);
    if (!currentUser) {
      return res.status(404).json({ message: "Logged-in user not found in database" });
    }

    // Determine access
    let access = null;
    if (workspace.owner._id.toString() === req.user) {
      access = "write"; // owner always has write
    } else {
      const member = workspace.members.find(
        (m) => m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (member) access = member.access; // read or write
    }

    if (!access) {
      return res.status(403).json({ message: "You do not have access to this workspace" });
    }

    res.status(200).json({
      success: true,
      message: "Workspace fetched successfully",
      access,
      workspace,
    });

  } catch (error) {
    console.error("Error fetching workspace by ID:", error);
    res.status(500).json({ message: "Failed to fetch workspace" });
  }
};

const addWorkspaceToUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { targetUserId, access } = req.body; // access: "read" or "write"

    if (!req.user) return res.status(404).json({ message: "User not found" });
    if (!["read", "write"].includes(access)) {
      return res.status(400).json({ message: "Invalid access type" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only owner can add workspace to another user
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can add this workspace to another user" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    // Check if already added
    const existingMember = workspace.members.find(
      (m) => m.user && m.user.toString() === targetUserId
    );

    if (existingMember) {
      existingMember.access = access; // update access if already added
    } else {
      workspace.members.push({
        user: targetUser._id,
        email: targetUser.email,
        access,
      });
    }

    await workspace.save();

    res.status(200).json({
      success: true,
      message: `Workspace added to user ${targetUser.username} successfully`,
      workspace,
    });

  } catch (error) {
    console.error("Error adding workspace to user:", error);
    res.status(500).json({ message: "Failed to add workspace to user" });
  }
};




module.exports = {
  createWorkspaceOnLogin,
  getAllWorkspaces,
  shareWorkspace,
  workspaceById,
  addWorkspaceToUser
};
