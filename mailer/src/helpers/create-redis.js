const redis = require("redis");
const config = require('./src/config/config');

const client = redis.createClient({
  url: config.redis_url //'redis://127.0.0.1:6379'
});

module.exports = client;
