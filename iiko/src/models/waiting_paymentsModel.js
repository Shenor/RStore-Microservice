const { Schema, model } = require('mongoose');
const waiting_paymentsSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    default: "pending"
  },
  paid: {
    type: Boolean,
    default: false
  },
  created_at: Date,
  captured_at: Date,
  order: Object,
  amount: Object,
  metadata: Object,
  recipient: Object,
  refundable: Boolean,
  payment_method: Object,
  refunded_amount: Object,
  cancellation_details: Object
});
module.exports = model('Waiting_payments', waiting_paymentsSchema);
