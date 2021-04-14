const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../../.env')})

module.exports = {
  nats_host: process.env.NATS_HOST,
  redis_url: process.env.REDIS_URL,
  nats_cluster: process.env.NATS_CLUSTER,
  mailer_name: process.env.MAILER_NAME,
  mailer_pass: process.env.MAILER_PASS,
  mailer_port: process.env.MAILER_PORT
}
