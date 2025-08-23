const mongoose = require("mongoose");
const { Schema } = mongoose;

// --- Schema for each Bubble element ---
const bubbleSchema = new Schema({
  type: {
    type: String,
    enum: ["text", "image", "video", "gif"],
    required: true,
  },
  label: { type: String, required: true }, // auto-generated like "Image 1", "Text 2"
  content: { type: String, required: true }, // the actual message or media URL
});

// --- Schema for each Input element ---
const inputSchema = new Schema({
  type: {
    type: String,
    enum: ["text", "number", "email", "phone", "date", "rating", "button"],
    required: true,
  },
  label: { type: String, required: true }, // auto-generated like "Input Text 1", "Phone 2"
  placeholder: { type: String }, // optional UI helper
  options: [{ type: String }], // for buttons, MCQs
});


// --- Main Form Schema ---
const formSchema = new Schema(
  {
    formName: { type: String, required: true },

    bubbles: [bubbleSchema], // pre-defined bot messages
    inputs: [inputSchema],   // what filler must answer

    theme: {
      type: String,
      enum: ["light", "dark", "tailBlue"],
      default: "light",
    },

    // Analytics
    views: { type: Number, default: 0 },
    starts: { type: Number, default: 0 },
    completionRatio: { type: Number, default: 0 },
    responses: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        answers: { type: Schema.Types.Mixed }, // store responses as object
        completed: { type: Boolean, default: false },
      },
    ],

    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
