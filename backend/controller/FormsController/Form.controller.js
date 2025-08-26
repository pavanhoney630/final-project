const Form = require("../../models/FormModel/form.model");
const Workspace = require("../../models/WorkSpaceModel/workSpace.model");
const nodemailer = require('nodemailer')

// --- Create Form inside a Folder of a Workspace ---
const createForm = async (req, res) => {
  try {
    const { workspaceId, folderId } = req.params;
    const { formName, bubbles, inputs } = req.body;

    if (!formName) {
      return res.status(400).json({ message: "Form name is required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // --- Prepare bubbles ---
    const bubblesArray = Array.isArray(bubbles) ? bubbles : bubbles ? [bubbles] : [];
    const bubbleCounts = {};
    const formattedBubbles = bubblesArray.map(bubble => {
      bubbleCounts[bubble.type] = (bubbleCounts[bubble.type] || 0) + 1;

      let defaultContent = "";
      switch (bubble.type) {
        case "text": defaultContent = "Default text message"; break;
        case "image": defaultContent = "https://via.placeholder.com/300x200.png?text=Image"; break;
        case "video": defaultContent = "https://www.w3schools.com/html/mov_bbb.mp4"; break;
        case "gif": defaultContent = "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif"; break;
      }

      return {
        type: bubble.type,
        label: `${bubble.type.charAt(0).toUpperCase() + bubble.type.slice(1)} ${bubbleCounts[bubble.type]}`,
        content: bubble.content || defaultContent,
      };
    });

    // --- Prepare inputs ---
    const inputsArray = Array.isArray(inputs) ? inputs : inputs ? [inputs] : [];
    const inputCounts = {};
    const formattedInputs = inputsArray.map(input => {
      inputCounts[input.type] = (inputCounts[input.type] || 0) + 1;
      return {
        type: input.type,
        label: `${input.type.charAt(0).toUpperCase() + input.type.slice(1)} ${inputCounts[input.type]}`,
        placeholder: input.placeholder || `Enter ${input.type}`,
        options: input.options || [],
      };
    });

    // --- Find workspace and members ---
    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "_id email")
      .populate("members.user", "_id email");

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isOwner = workspace.owner._id.toString() === req.user.id;
    const isMember = workspace.members.some(
      m => (m.user && m.user._id.toString() === req.user.id) || m.email === req.user.email
    );

    if (!isOwner && !isMember) return res.status(403).json({ message: "No access to this workspace" });

    const folder = workspace.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found in workspace" });

    // --- Initialize empty answers structure based on form inputs ---
    const createEmptyAnswers = () => {
      const obj = {};
      formattedInputs.forEach(input => {
        switch(input.type) {
          case "text":
          case "email":
          case "phone":
          case "date":
          case "button":
            obj[input.label] = ""; break;
          case "number":
          case "rating":
            obj[input.label] = 0; break;
          default:
            obj[input.label] = null;
        }
      });
      return obj;
    };

    // --- Initialize responses for each member ---
    const responses = workspace.members.map(m => ({
      user: m.user ? m.user._id : null,
      answers: createEmptyAnswers(),
      completed: false
    }));

    // Include owner as well
    responses.push({ user: workspace.owner._id, answers: createEmptyAnswers(), completed: false });

    // --- Create the form ---
    const newForm = new Form({
      formName,
      bubbles: formattedBubbles,
      inputs: formattedInputs,
      owner: req.user.id,
      responses,
      views: 0,
      starts: 0,
      completionRatio: 0
    });

    await newForm.save();

    // --- Add form to folder ---
    folder.forms.push(newForm._id);
    await workspace.save();

    return res.status(201).json({
      success: true,
      message: "Form created successfully inside folder",
      form: newForm
    });

  } catch (error) {
    console.error("Error creating form:", error);
    return res.status(500).json({ success: false, message: "Failed to create form" });
  }
};

// --- Get Forms inside selected folder
const getFormsInFolder = async (req, res) => {
  try {
    const { workspaceId, folderId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // --- Find workspace and populate forms ---
    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "_id email")
      .populate("members.user", "_id email")
      .populate({
        path: "folders.forms",
        model: "Form",
        select: "formName bubbles inputs owner createdAt" // ✅ only fetch what you need
      });

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isOwner = workspace.owner._id.toString() === req.user.id;
    const isMember = workspace.members.some(
      m => (m.user && m.user._id.toString() === req.user.id) || m.email === req.user.email
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "No access to this workspace" });
    }

    const folder = workspace.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found in workspace" });

    // --- Return forms inside the folder ---
    return res.status(200).json({
      success: true,
      message: "Forms fetched successfully",
      forms: folder.forms // this already contains formName, bubbles, inputs
    });

  } catch (error) {
    console.error("Error fetching forms in folder:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch forms" });
  }
};

// --- Get single form by ID (with bubbles, inputs, theme, etc.)
const getFormById = async (req, res) => {
  try {
    const { workspaceId, folderId, formId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // --- Find workspace and validate access ---
    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "_id email")
      .populate("members.user", "_id email");

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isOwner = workspace.owner._id.toString() === req.user.id;
    const isMember = workspace.members.some(
      m => (m.user && m.user._id.toString() === req.user.id) || m.email === req.user.email
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "No access to this workspace" });
    }

    // --- Validate folder ---
    const folder = workspace.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found in workspace" });

    // --- Fetch form by ID ---
    const form = await Form.findById(formId).select(
      "formName bubbles inputs theme owner responses views starts completionRatio createdAt updatedAt"
    );

    if (!form) return res.status(404).json({ message: "Form not found" });

    return res.status(200).json({
      success: true,
      message: "Form fetched successfully",
      form
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch form" });
  }
};


const editFormById = async (req, res) => {
  try {
    const { workspaceId, folderId, formId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // --- Find workspace and validate access ---
    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "_id email")
      .populate("members.user", "_id email");

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isOwner = workspace.owner._id.toString() === req.user.id;
    const isMember = workspace.members.some(
      m => (m.user && m.user._id.toString() === req.user.id) || m.email === req.user.email
    );
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "No access to this workspace" });
    }

    // --- Validate folder ---
    const folder = workspace.folders.id(folderId);
    if (!folder) return res.status(404).json({ message: "Folder not found in workspace" });

    // --- Fetch form by ID ---
    const form = await Form.findById(formId).select(
      "formName bubbles inputs theme owner responses views starts completionRatio createdAt updatedAt"
    );

    if (!form) return res.status(404).json({ message: "Form not found" });

    return res.status(200).json({
      success: true,
      message: "Form fetched successfully",
      form
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch form" });
  }
};


const shareForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { email } = req.body; // email of receiver

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Only owner can share
    if (form.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to share this form" });
    }

    const formLink = `https://final-project-api-dun.vercel.app/forms/${formId}`;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Form Shared With You",
      html: `<p>Hello,</p>
             <p>You have been invited to fill a form.</p>
             <p><a href="${formLink}">Click here to open the form</a></p>
             <p>Or copy the link: ${formLink}</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Form shared successfully",
      link: formLink,
    });
  } catch (error) {
    console.error("Error sharing form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to share form",
    });
  }
};

// === Delete Form (remove from DB + Workspace Folder) ===
const deleteForm = async (req, res) => {
  try {
    const { formId, workspaceId, folderId } = req.params;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Only owner can delete
    if (form.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this form" });
    }

    // Remove form from Workspace folder
    const workspace = await Workspace.findById(workspaceId);
    if (workspace) {
      const folder = workspace.folders.id(folderId);
      if (folder) {
        folder.forms = folder.forms.filter((f) => f.toString() !== formId);
        await workspace.save();
      }
    }

    // Delete form itself
    await Form.findByIdAndDelete(formId);

    return res.status(200).json({
      success: true,
      message: "Form deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete form",
    });
  }
};


module.exports = { createForm,getFormsInFolder,getFormById,editFormById,deleteForm,shareForm };
