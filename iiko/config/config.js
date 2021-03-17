const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../.env')})

module.exports = {
  port: process.env.IIKO_PORT,
  db_host: process.env.IIKO_DB_HOST,
  db_port: process.env.IIKO_DB_PORT,
  db_user: process.env.IIKO_DB_USER,
  db_name: process.env.IIKO_DB_NAME,
  db_password: process.env.IIKO_DB_PASSWORD,
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  primehill_token: process.env.IIKO_TOKEN_PRIMEHILL,
}
