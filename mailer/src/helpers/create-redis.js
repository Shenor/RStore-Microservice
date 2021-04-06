const redis = require("redis");
const rejson = require('redis-rejson');
const config = require('../config/config');

rejson(redis);

const client = redis.createClient({
  url: config.redis_url //'redis://127.0.0.1:6379'
});

module.exports = client;
