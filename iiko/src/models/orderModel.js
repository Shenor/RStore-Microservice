const {Schema, model} = require('mongoose');

const OrderSchema = new Schema({
  organizationId: {
    type: String,
    required: true,
  },
  created_time: Date,
  activity_id: String,
  internal_number: String,
  cart: [Object],
  orderPrice: Number,
  discount: Number,
  deliveryPrice: Number,
  isSelfService: Boolean,
  return_url: String,
  customer: Object,
  address: Object,
  payment: String,
  error: Object,
  iiko: Object
});

module.exports = model('Orders', OrderSchema);


// orderId: String,
// customerId: String,
// customer: {Object},
// address: {Object},
// restaurantId: String,
// organization: String,
// sum: Number,
// discount: 0,
// number: String,
// deliveryDate: String,
// createdTime: String,
// confirmTime: String,
// durationInMinutes: Number,
// personsCount: Number,
// items: [Object],
// guests: [Object],
// guests: [Object],
// orderType: {Object},
// deliveryTerminal: {Object},
// discounts: [Object],
// iikoCard5Coupon: String,
// opinion: {Object}
