const Response = require("../../models/FormModel/FormResponse.model");

const getAnalytics = async (req, res) => {
  try {
    const { formId } = req.params;

    const views = await Response.countDocuments({ formId, viewed: true });
    const starts = await Response.countDocuments({ formId, started: true });
    const completions = await Response.countDocuments({ formId, completed: true });

    const completionRate = starts > 0 ? ((completions / starts) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        views,
        starts,
        completions,
        completionRate: `${completionRate}%`
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

module.exports = { getAnalytics };
