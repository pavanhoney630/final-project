const mongoose = require("mongoose");
const { Schema } = mongoose;

const responseSchema = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },

    // User interaction tracking
    viewCount: { type: Number, default: 0 },   // how many times viewed
    startCount: { type: Number, default: 0 },  // how many times started
    completionRate: { type: Number, default: 0 }, // % completion (calculated on submit)

    // Answers for that form submission
    answers: { type: Map, of: Schema.Types.Mixed }, // flexible: text, number, choice etc.
    submittedAt: { type: Date } // set when submitted
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
