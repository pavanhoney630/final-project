const Form = require("../../models/FormModel/form.model");
const Workspace = require("../../models/WorkSpaceModel/workSpace.model");
const nodemailer = require('nodemailer')

// --- Create Form inside a Folder of a Workspace ---
const createForm = async (req, res) => {
  try {
    const {workspaceId, folderId} = req.params
    const { formName, bubbles, inputs,  } = req.body;

    if (!formName) {
      return res.status(400).json({ message: "Form name is required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // --- Always treat bubbles & inputs as arrays ---
    const bubblesArray = Array.isArray(bubbles) ? bubbles : (bubbles ? [bubbles] : []);
    const inputsArray = Array.isArray(inputs) ? inputs : (inputs ? [inputs] : []);

    // --- Generate labels for bubbles ---
    const bubbleCounts = {};
    const formattedBubbles = bubblesArray.map((bubble) => {
      bubbleCounts[bubble.type] = (bubbleCounts[bubble.type] || 0) + 1;

      let defaultContent = "";
      switch (bubble.type) {
        case "text":
          defaultContent = "Default text message";
          break;
        case "image":
          defaultContent = "https://via.placeholder.com/300x200.png?text=Image";
          break;
        case "video":
          defaultContent = "https://www.w3schools.com/html/mov_bbb.mp4";
          break;
        case "gif":
          defaultContent = "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif";
          break;
      }

      return {
        type: bubble.type,
        label: `${bubble.type.charAt(0).toUpperCase() + bubble.type.slice(1)} ${bubbleCounts[bubble.type]}`,
        content: bubble.content || defaultContent,
      };
    });

    // --- Generate labels for inputs ---
    const inputCounts = {};
    const formattedInputs = inputsArray.map((input) => {
      inputCounts[input.type] = (inputCounts[input.type] || 0) + 1;

      return {
        type: input.type,
        label: `${input.type.charAt(0).toUpperCase() + input.type.slice(1)} ${inputCounts[input.type]}`,
        placeholder: input.placeholder || `Enter ${input.type}`,
        options: input.options || [],
      };
    });
 
    // --- Create the Form ---
    const newForm = new Form({
      formName,
      bubbles: formattedBubbles,
      inputs: formattedInputs,
      owner: req.user.id,
    });

    await newForm.save();

    // --- Attach Form to Workspace Folder ---
    const workspace = await Workspace.findOne({ _id: workspaceId })
  .populate("owner", "_id email")
  .populate("members.user", "_id email");

if (!workspace) {
  return res.status(404).json({ message: "Workspace not found" });
}

// Check if user is owner or member
const isOwner = workspace.owner._id.toString() === req.user.id;
const isMember = workspace.members.some(
  (m) => (m.user && m.user._id.toString() === req.user.id) || m.email === req.user.email
);

if (!isOwner && !isMember) {
  return res.status(403).json({ message: "You don’t have access to this workspace" });
}


const folder = workspace.folders.id(folderId);
if (!folder) {
  return res.status(404).json({ message: "Folder not found in this workspace" });
}


    folder.forms.push(newForm._id);
    await workspace.save();

    return res.status(201).json({
      success: true,
      message: "Form created successfully inside folder",
      form: newForm,
    });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create form",
    });
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


module.exports = { createForm,deleteForm,shareForm };
