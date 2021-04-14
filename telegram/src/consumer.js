const User = require('./models/usersModel');
const Config = require('./models/configModel');

const bot = require('./helpers/create-telegram-bot');
const config = require('./config/config');
const logger = require('./helpers/create-logger');
const transformOrder = require('./utils/transform-order');
const sc = require('node-nats-streaming').connect(config.nats_cluster, 'telegram', {
  servers: [config.nats_host]
})

sc.on('connect', () => {
  console.log('[NATS] connect');

  const opts = sc.subscriptionOptions()
    .setDurableName('telegram')
    .setDeliverAllAvailable()
    .setManualAckMode(true);

  const subscription = sc.subscribe('iiko:send_order_to_telegram', opts);

  // console.log(msg.isRedelivered())
  subscription.on('message', async (msg) => {
    const dataString = msg.getData();
    const data = JSON.parse(dataString);
    const candidate = await Config.findOne({organizationId: data?.organizationId}).lean();
    if(!candidate) return msg.ack();
    const users = await User.find({organizationId: data?.organizationId}).select('chatId subscribe_new_orders').lean();
    users.forEach(user => {
      if(!user.subscribe_new_orders) return;
      bot.api.sendMessage(user.chatId, `${transformOrder(data)}`, {parse_mode: "HTML"});
    });
    logger.info('Received a message [' + msg.getSequence() + '] ' + msg.getData())
    msg.ack();
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
sc.on('reconnect', () => {
  logger.info(`[NATS] reconnect`);
  logger.info(`reconnected to ${sc.nc.currentServer.url}`)
});

// emitted whenever the server returns a permission error for
// a publish/subscription for the current user. This sort of error
// means that the client cannot subscribe and/or publish/request
// on the specific subject
sc.on('permission_error', function (err) {
  logger.error('[NATS] got a permissions error: ', err.message);
});

sc.on('connection_lost', async (error) => {
  logger.error('disconnected from STAN: ', error);
});

sc.on('error', (error) => {
  logger.error('[Nats] error: ', error);
});

// emitted when the connection is closed - once a connection is closed
// the client has to create a new connection.
sc.on('close', () => {
  process.exit(1)
})

module.exports = sc;
