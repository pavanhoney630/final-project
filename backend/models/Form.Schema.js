const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the form
    fields: [
      {
        type: { type: String, required: true }, // Type of the field (text, number, date, button, etc.)
        placeholder: { type: String, required: true }, // Placeholder text for the field
        name: { type: String, required: true }, // Name for the field, used as reference
        options: [{ type: String }], // Options for fields like select or radio buttons
        buttonAction: { type: String }, // Action for button types (e.g., 'submit', 'rating')
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  },
  { timestamps: true }
);

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
