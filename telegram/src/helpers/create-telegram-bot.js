const bb = require('bot-brother');
const config = require('../config/config');

const bot = bb({
  key: config.bot_token,
  sessionManager: bb.sessionManager.redis({port: '6379', host: '127.0.0.1'}),
  polling: { interval: 0, timeout: 1 }
});

module.exports = bot;
