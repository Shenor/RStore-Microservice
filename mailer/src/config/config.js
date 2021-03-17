const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './../../../.env')})

module.exports = {
  nats_host: process.env.NATS_HOST,
  nats_cluster: process.env.NATS_CLUSTER,
  mailer_name: process.env.MAILER_NAME,
  mailer_pass: process.env.MAILER_PASS,
}
