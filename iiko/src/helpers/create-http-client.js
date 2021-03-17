const axios = require('axios');

module.exports = function (options = {}, headers = {}) {
  return axios.create({
    ...options,
    headers: headers
  })
}
