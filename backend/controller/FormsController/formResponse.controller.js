const Response = require("../../models/FormModel/FormResponse.model");
const Form = require("../../models/FormModel/form.model");

// --- Create Response (count view) ---
const createResponse = async (req, res) => {
  try {
    const { formId } = req.params;

    // Check form exists
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // Create new response entry with +1 view
    const response = new Response({
      formId,
      viewCount: 1,
      answers: {}
    });

    await response.save();

    return res.status(201).json({
      success: true,
      responseId: response._id
    });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ message: "Failed to create response" });
  }
};

// --- Mark as Started ---
const markStarted = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await Response.findById(responseId);
    if (!response) return res.status(404).json({ message: "Response not found" });

    response.startCount += 1;
    await response.save();

    res.status(200).json({ success: true, message: "Marked as started" });
  } catch (error) {
    console.error("Error marking start:", error);
    res.status(500).json({ message: "Failed to mark start" });
  }
};

// --- Submit Response (store answers + calculate completionRate) ---
const submitResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { answers } = req.body;

    const response = await Response.findById(responseId);
    if (!response) return res.status(404).json({ message: "Response not found" });

    // Save answers & submission timestamp
    response.answers = answers;
    response.submittedAt = new Date();

    // Calculate completion rate
    response.completionRate =
      response.startCount > 0
        ? Math.round((1 / response.startCount) * 100)
        : 100;

    await response.save();

    res.status(200).json({ success: true, message: "Response submitted" });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Failed to submit response" });
  }
};

// --- Export all responses (answers + analytics) ---
const exportResponses = async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await Response.find({ formId })
      .select("answers submittedAt viewCount startCount completionRate");

    res.status(200).json({
      success: true,
      count: responses.length,
      responses
    });
  } catch (error) {
    console.error("Error exporting responses:", error);
    res.status(500).json({ message: "Failed to export responses" });
  }
};

module.exports = {
  createResponse,
  markStarted,
  submitResponse,
  exportResponses
};
