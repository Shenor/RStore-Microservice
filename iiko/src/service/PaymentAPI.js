const HttpClient = require('../helpers/create-http-client');
const { v4: uuidv4 } = require('uuid');
const Organization = require('../models/organizationModel');
const logger = require('../helpers/create-logger');

const yandexApi = new HttpClient(
  {baseURL: 'https://payment.yandex.net/api/v3'},
  {'Content-Type':'application/json'}
)

class Payment {

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

    const transformOrder = {
      amount: {
        value: isSelfService ? (orderPrice - discount) : (orderPrice - discount) + deliveryPrice,
        currency: "RUB"
      },
      confirmation: {
        type: "redirect",
        return_url: return_url
      },
      metadata: {
        activity_id,
        organizationID,
        internal_number
      },
      capture: true
    };

    const { yandexToken } = await Organization.findOne({id: organizationID}).select('-_id yandexToken');

    try {
      const {data} = await yandexApi.post(`/payments`, JSON.stringify(transformOrder),
        {
          headers: {
            'Idempotence-Key': uuidv4(),
            'Authorization': `Bearer ${yandexToken}`
          }
        }
      );
      return data;
    } catch (error) {
      error.response
      ? logger.error(`Yandex response error - ${JSON.stringify(error.response.data)}`)
      : logger.error(`Yandex error - ${JSON.stringify(error)}`)
    }
  }
}

module.exports = Payment;
