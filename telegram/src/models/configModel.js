const { Schema, model } = require('mongoose');
const ConfigSchema = new Schema({
  organizationId: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    default: new Date().toISOString()
  }
});
module.exports = model('Configs', ConfigSchema);
