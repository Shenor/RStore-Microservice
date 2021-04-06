const { Schema, model } = require('mongoose');
const OrderSchema = new Schema({
  organizationId: {
    type: String,
    required: true
  },
  orderId: String,
  customerId: String,
  customer: Object,
  address: Object,
  restaurantId: String,
  sum: Number,
  discount: 0,
  number: String,
  deliveryDate: String,
  createdTime: String,
  confirmTime: String,
  durationInMinutes: Number,
  personsCount: Number,
  items: [Object],
  guests: [Object],
  payments: [Object],
  orderType: Object,
  deliveryTerminal: Object,
  discounts: [Object],
  iikoCard5Coupon: String,
  opinion: Object
});
module.exports = model('Orders', OrderSchema);

