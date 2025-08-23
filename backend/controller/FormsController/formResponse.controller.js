const Response = require("../../models/FormModel/FormResponse.model");
const Form = require("../../models/FormModel/form.model");

const createResponse = async (req, res) => {
  try {
    const { formId } = req.params;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // Create a response document
    const response = new Response({
      formId,
      viewed: true,
      answers: {}
    });
    await response.save();

    // Increment views count in form
    form.views += 1;
    await form.save();

    return res.status(201).json({
      success: true,
      message: "Form viewed successfully",
      responseId: response._id,
      views: form.views
    });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ message: "Failed to create response" });
  }
};

const markStarted = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await Response.findById(responseId);
    if (!response) return res.status(404).json({ message: "Response not found" });

    const form = await Form.findById(response.formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    if (!response.started) {
      response.started = true;
      await response.save();

      // Increment starts count in Form
      form.starts += 1;
      await form.save();
    }

    res.status(200).json({
      success: true,
      message: "Form started successfully",
      starts: form.starts
    });
  } catch (error) {
    console.error("Error marking start:", error);
    res.status(500).json({ message: "Failed to mark start" });
  }
};

const submitResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { answers } = req.body;

    const response = await Response.findById(responseId);
    if (!response) return res.status(404).json({ message: "Response not found" });

    // Save answers
    response.answers = answers;
    response.submittedAt = new Date();

    // Check completion (all inputs filled)
    const form = await Form.findById(response.formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    const totalInputs = form.inputs.length;
    const answeredInputs = Object.values(answers).filter(
      v => v !== "" && v !== null && v !== 0
    ).length;

    response.completed = answeredInputs === totalInputs;
    await response.save();

    // 🔹 Recalculate completion ratio (global, not member-based)
    const allResponses = await Response.find({ formId: form._id });
    const completedResponses = allResponses.filter(r => r.completed).length;
    const totalResponses = allResponses.length;

    form.completionRatio =
      totalResponses === 0 ? 0 : Math.round((completedResponses / totalResponses) * 100);

    await form.save();

    res.status(200).json({
      success: true,
      completionRatio: form.completionRatio,
      completed: response.completed
    });

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
