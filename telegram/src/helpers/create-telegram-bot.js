const bb = require('bot-brother');
const config = require('../config/config');

const bot = bb({
  key: config.bot_token,
  sessionManager: bb.sessionManager.redis({url: config.redis_url}),
  polling: { interval: 0, timeout: 1 }
});

module.exports = bot;
