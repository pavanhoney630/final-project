const mongoose = require("mongoose");

// Folder Schema (can hold multiple forms by reference)
const folderSchema = new mongoose.Schema(
  {
    folderName: { type: String, required: true },
    forms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Form" }], // references to Form model
  },
  { timestamps: true }
);

// Member Schema (workspace sharing)
const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    access: {
      type: String,
      enum: ["read", "write"],
      default: "read",
    },
  },
  { _id: false }
);

// Workspace Schema
const workspaceSchema = new mongoose.Schema(
  {
    workspaceName: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folders: [folderSchema], // 👈 multiple folders can be stored here
    members: [memberSchema],
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;
