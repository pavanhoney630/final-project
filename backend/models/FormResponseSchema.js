const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },  // Reference to the form
  responses: { type: Object, required: true },  // Store form responses as an object (field name => response value)
}, { timestamps: true });

const FormResponse = mongoose.model('FormResponse', formResponseSchema);

module.exports = FormResponse;
