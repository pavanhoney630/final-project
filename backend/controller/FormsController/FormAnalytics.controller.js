const Form = require("../../models/FormModel/form.model");
const Response = require("../../models/FormModel/FormResponse.model");

const getAnalytics = async (req, res) => {
  try {
    const { formId } = req.params;

    // Ensure this form belongs to the logged-in user
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });
    if (String(form.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to view analytics" });
    }

    // Fetch responses for this form
    const responses = await Response.find({ formId }).lean();

    // --- Use views & starts directly from form model ---
    const views = form.views || 0;
    const starts = form.starts || 0;

    // --- Completions from Response collection ---
    const completions = responses.filter(r => r.completed).length;

    // --- Completion ratio (calculate dynamically, don't trust stale form field) ---
    const completionRatio = starts > 0 ? ((completions / starts) * 100).toFixed(2) : "0.00";

    // --- Detailed responses list ---
    const detailedResponses = responses.map(r => ({
      answers: r.answers || {},
      completed: r.completed || false,
      submittedAt: r.submittedAt || null
    }));

    res.status(200).json({
      success: true,
      message: "Analytics fetched successfully",
      analytics: {
        views,
        starts,
        completions,
        completionRatio: `${completionRatio}%`,
        responses: detailedResponses
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

module.exports = {
  getAnalytics
};
