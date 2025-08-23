const mongoose = require("mongoose");
const { Schema } = mongoose;

const responseSchema = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },

    // User interaction tracking
    viewd: { type: Number, default: false},   // how many times viewed
    started: { type: Number, default: false },  // how many times started
    completed: { type: Number, default: false }, // % completion (calculated on submit)

    // Answers for that form submission
    answers: { type: Map, of: Schema.Types.Mixed }, // flexible: text, number, choice etc.
    submittedAt: { type: Date } // set when submitted
  },
  { timestamps: true }
);

module.exports = mongoose.model("Response", responseSchema);
