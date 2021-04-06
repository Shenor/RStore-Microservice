const logger = require('./helpers/create-logger');
const config = require('./config/config');
const sendMail = require('./mailerRoutes');

const sc = require('node-nats-streaming').connect(config.nats_cluster, 'mailer', {
  servers: [config.nats_host]
})

sc.on('connect', async () => {
  logger.info('[NATS] connect');

  // Subscriber can specify how many existing messages to get.
  const opts = sc.subscriptionOptions()
    .setDurableName('mailer')
    .setDeliverAllAvailable()
    .setManualAckMode(true);

  const subscription = sc.subscribe('iiko:send_order_to_mail', opts)

  subscription.on('message', (msg) => {
    const data = JSON.parse(msg.getData());
    // console.log(msg.isRedelivered())
    logger.info(`Received a message [${msg.getSequence()}]: ${msg.getData()}`)
    sendMail(data);
    msg.ack();
  })

  sc.on('connection_lost', (error) => {
    logger.info('Disconnected from stan — ' + error)
  })
})

// emitted whenever the client disconnects from a server
sc.on('disconnect', () => {
  logger.info('[NATS] disconnect');
});

// emitted whenever the client is attempting to reconnect
sc.on('reconnecting', () => {
  logger.info('reconnecting');
});

// emitted whenever the client reconnects
// reconnect callback provides a reference to the connection as an argument
sc.on('reconnect', (linkRecconect) => {
  console.log(linkRecconect);
  logger.info(`[NATS] reconnect`);
  logger.info(`reconnected to ${sc.nc.currentServer.url}`)
});

// emitted whenever the server returns a permission error for
// a publish/subscription for the current user. This sort of error
// means that the client cannot subscribe and/or publish/request
// on the specific subject
sc.on('permission_error', function (err) {
  logger.error('[NATS] got a permissions error — ' + err.message);
});

sc.on('connection_lost', async (error) => {
  logger.info('disconnected from STAN: ' + error);
});

sc.on('error', (error) => {
  logger.error('[NATS] error — ' + error)
});

// emitted when the connection is closed - once a connection is closed
// the client has to create a new connection.
sc.on('close', () => {
  logger.info('[NATS] connection closed');
  process.exit()
})
