const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');

const token = config.bot_token;
const bot = new TelegramBot(token, {polling: true});

module.exports = bot
