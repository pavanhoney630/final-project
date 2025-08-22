const Workspace = require("../../models/WorkSpaceModel/workSpace.model");

const hasWriteAccess = (workspace, user) => {
  // Convert owner to string
  if (workspace.owner.toString() === user.id.toString()) return true;

  const member = workspace.members.find(
    (m) => m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()
  );

  return member && member.access === "write";
};


const createFolder = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { folderName } = req.body;

    if (!folderName) return res.status(400).json({ message: "Folder name is required" });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (!hasWriteAccess(workspace, req.user)) {
      return res.status(403).json({ message: "You do not have write access to this workspace" });
    }

    const newFolder = { folderName, forms: [] };
    workspace.folders.push(newFolder);

    await workspace.save();

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      folder: workspace.folders[workspace.folders.length - 1],
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};


const getAllFolders = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Any member or owner can view
    const canView = workspace.owner.toString() === req.user.id ||
      workspace.members.some(
        (m) => m.email && req.user.email && m.email.toLowerCase() === req.user.email.toLowerCase()
      );

    if (!canView) return res.status(403).json({ message: "You do not have access to this workspace" });

    res.status(200).json({
      success: true,
      message: "Folders fetched successfully",
      folders: workspace.folders,
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};


const getFolderById = async (req, res) => {
  try {
    const { workspaceId, folderId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate("folders.forms");
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const canView = workspace.owner.toString() === req.user.id ||
      workspace.members.some(
        (m) => m.email && req.user.email && m.email.toLowerCase() === req.user.email.toLowerCase()
      );

    if (!canView) return res.status(403).json({ message: "You do not have access to this workspace" });

    const folder = workspace.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    res.status(200).json({
      success: true,
      message: "Folder fetched successfully",
      folder,
    });
  } catch (error) {
    console.error("Error fetching folder by ID:", error);
    res.status(500).json({ message: "Failed to fetch folder" });
  }
};


const deleteFolder = async (req, res) => {
  try {
    const { workspaceId, folderId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (!hasWriteAccess(workspace, req.user)) {
      return res.status(403).json({ message: "You do not have permission to delete this folder" });
    }

    // Find index of folder
    const folderIndex = workspace.folders.findIndex(f => f._id.toString() === folderId);
    if (folderIndex === -1) return res.status(404).json({ message: "Folder not found" });

    // Remove folder using splice
    workspace.folders.splice(folderIndex, 1);

    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};


module.exports = {
  createFolder,
  getAllFolders,
  getFolderById,
  deleteFolder,
};
