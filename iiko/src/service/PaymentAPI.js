const rp = require('request-promise');
const { v4: uuidv4 } = require('uuid');
const Organization = require('../models/organizationModel');

class Payment {
  ednpoint = 'https://payment.yandex.net/api/v3';

  async createPayment(order) {
    const {
      discount,
      return_url,
      orderPrice,
      activity_id,
      deliveryPrice,
      isSelfService,
      organizationID,
      internal_number
    } = order;
    const { yandexToken } = await Organization.findOne({id: organizationID}).select('-_id yandexToken');
    try {
      const payment = await rp(`${this.ednpoint}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotence-Key': uuidv4(),
          'Authorization': `Bearer ${yandexToken}`
        },
        body: JSON.stringify({
          amount: {
            value: isSelfService ? (orderPrice - discount) : (orderPrice - discount) + deliveryPrice,
            currency: "RUB"
          },
          confirmation: {
            type: "redirect",
            return_url: return_url
          },
          metadata:{
            activity_id,
            organizationID,
            internal_number
          },
          capture: true
        })
      });
      return JSON.parse(payment);
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = Payment;
