const nanoid = require('../helpers/create-nanoid');

// restream parsed body before proxying
module.exports = function restream (proxyReq, req, res, options) {
  if (req.body && req.method == "POST") { //&& req.originalUrl === '/iiko/api/v1/order'
    let bodyData = JSON.stringify({activity_id: nanoid(), ...req.body});

    // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

    // stream the content
    proxyReq.write(bodyData);
    return;
  }

  if (req.body) {
    let bodyData = JSON.stringify(req.body);
    // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // stream the content
    proxyReq.write(bodyData);
  }
}
