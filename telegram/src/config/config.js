const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './../../../.env')})

module.exports = {
  db_host: process.env.TELEGRAM_DB_HOST,
  db_port: process.env.TELEGRAM_DB_PORT,
  db_user: process.env.TELEGRAM_DB_USER,
  db_name: process.env.TELEGRAM_DB_NAME,
  db_password: process.env.TELEGRAM_DB_PASSWORD,
  bot_token: process.env.TELEGRAM_BOT_TOKEN,
  nats_host: process.env.NATS_HOST,
  nats_cluster: process.env.NATS_CLUSTER,
  port: process.env.TELEGRAM_PORT,
  redis_url: process.env.REDIS_URL
}
