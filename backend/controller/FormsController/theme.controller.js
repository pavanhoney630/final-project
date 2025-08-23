const Form = require("../../models/FormModel/form.model");

// --- Theme Config Map (colors per theme) ---
const themeConfig = {
  light: {
    background: "#ffffff",
    text: "#000000",
    inputBackground: "#f9f9f9",
    inputText: "#333333",
    buttonBackground: "#007bff",
    buttonText: "#ffffff",
  },
  dark: {
    background: "#1e1e1e",
    text: "#f5f5f5",
    inputBackground: "#333333",
    inputText: "#ffffff",
    buttonBackground: "#444444",
    buttonText: "#f5f5f5",
  },
  tailBlue: {
    background: "#e0f2fe",
    text: "#0c4a6e",
    inputBackground: "#bae6fd",
    inputText: "#0c4a6e",
    buttonBackground: "#0284c7",
    buttonText: "#ffffff",
  },
};

// --- Update Form Theme ---
const updateTheme = async (req, res) => {
  try {
    const { formId } = req.params;
    const { theme } = req.body;

    if (!theme || !themeConfig[theme]) {
      return res.status(400).json({ message: "Invalid or missing theme" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Authorization: Only owner can update
    if (form.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update theme" });
    }

    form.theme = theme;
    await form.save();

    return res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      theme: theme,
      themeConfig: themeConfig[theme],
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({
      success: false,
      message: "Failed to Update Theme",
    });
  }
};

// --- Get Form Theme ---
const getTheme = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    return res.status(200).json({
      success: true,
      message:"Theme Fetched successfully",
      theme: form.theme,
      themeConfig: themeConfig[form.theme],
    });
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({
      success: false,
      message: "Failed to Fetch theme",
    });
  }
};

module.exports = { updateTheme, getTheme, themeConfig };
