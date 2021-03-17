const { DateTime } = require("luxon");
const PaymentAPI = require('../../service/PaymentAPI');
const Wainting_Payment = require('../../models/waiting_paymentsModel');

const logger = require('../../helpers/create-logger');
const nanoid = require('../../helpers/create-nanoid');
const nats_queue = require('../../consumer');

const paymentAPI = new PaymentAPI();
const isSuccessPayment = (orderStatus) => {
  return orderStatus?.event && orderStatus?.event == 'payment.succeeded'
  ? true
  : false
}
const pusblishOrder = (order) => {

  // nats_queue.publish('orders_iiko', JSON.stringify(order), (err, guid) => {
  //   if (err) return logger.error('Publish to mailer failed: ' + JSON.stringify(err));
  //   logger.info('Published message to orders_iiko with guid: ' + guid)
  // });

  // nats_queue.publish('send_order_iiko_to_mail', JSON.stringify(order), (err, guid) => {
  //   if (err) return logger.error('Publish to mailer failed: ' + JSON.stringify(err));
  //   logger.info('Published message to send_order_iiko_to_mail with guid: ' + guid)
  // })

  nats_queue.publish('send_order_to_telegram', JSON.stringify(order), (err, guid) => {
    if (err) return logger.error('Publish to mailer failed: ' + JSON.stringify(err));
    logger.info('Published message to send_order_to_telegram with guid: ' + guid)
  })

};

async function create (req, res) {
  const internal_number = nanoid();
  const created_time = DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss');
  const modifyOrder = {...req.body, internal_number, created_time};
  logger.info(`Заказ - ${JSON.stringify(modifyOrder)}`);

  if (req.body.payment == "CARD") {
    const payment = await paymentAPI.createPayment(modifyOrder);
    const {id, confirmation: { confirmation_url }} = payment;
    const newPaymnet = new Wainting_Payment({...payment, order: modifyOrder});
    await newPaymnet.save();
    console.log(payment)
    return res.json({id,confirmation_url});
  }

  pusblishOrder(modifyOrder);

  return res.json({
    number: modifyOrder.internal_number,
    created_time: modifyOrder.created_time
  })
}

async function webhook_event_payment_from_yandex (req, res) {
  const payment = req.body
  const id = payment.object.id;

  if (!isSuccessPayment(payment)) {
    const updatedPayment = await Wainting_Payment.findOneAndUpdate({id}, {
      paid: payment.object.paid,
      status: payment.object.status,
      payment_method: payment.object.payment_method,
      cancellation_details: payment.object.cancellation_details
    }, {useFindAndModify: false, new: true});
    logger.warn(`Платеж заказа № ${payment?.object.id} был отклюнен — ${JSON.stringify(payment)}`);
  }

  if (isSuccessPayment(payment)) {
    const updatedPayment = await Wainting_Payment.findOneAndUpdate({id}, {
      paid: payment.object.paid,
      status: payment.object.status,
      captured_at: payment.object.captured_at,
      payment_method: payment.object.payment_method,
    }, {useFindAndModify: false, new: true});
    logger.info(`Платеж заказа № ${payment?.object.id} был успешно обработан — ${JSON.stringify(payment)}`);

    pusblishOrder(updatedPayment.order);
  }

  res.status(200).send();
};

async function status (req, res) {

  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    'connection': 'keep-alive'
  });

  await new Promise(resolve => setTimeout(resolve, 2500))
  const payment = await Wainting_Payment.findOne({id: req.params.id}).lean();

  //! Кастомные события работают только в таком варинате
  //  res.write(`event: canceled\n`)
  //  res.write(`data: 1\n`)
  //  res.write("\n\n")

  if (payment && payment?.paid && payment?.status == 'succeeded') {
    const data = {
      id: payment.id,
      number: payment.order.internal_number,
      created_time: payment.order.created_time
    };
    res.write(`event: succeeded\n`);
    res.write(`data: ${JSON.stringify(data)}\n`);
    res.write("\n\n");
  }

  if (payment && !payment?.paid && payment?.status == 'canceled') {
    const data = {
      id: payment.id,
      error: payment.cancellation_details,
      number: payment.order.internal_number,
      created_time: payment.order.created_time
    };
    res.write(`event: canceled\n`)
    res.write(`data: ${JSON.stringify(data)}\n`)
    res.write("\n\n")
  }

  res.status(200).send();
};

module.exports = {
  create,
  status,
  webhook_event_payment_from_yandex
}


// let internal_number = nanoid();
// let candidate = await Order.findOne({organizationID, "orders.number": internal_number}, {"orders.$":1}).select('-_id');
// console.log(candidate)

// while(candidate) {
//   internal_number = nanoid();
//   candidate = await Order.findOne({organizationID, "orders.number": internal_number}, {"orders.$":1}).select('-_id');
//   console.log("object")
// }
