const client = require('../helpers/create-redis');
const logger = require('../helpers/create-logger');

function createOrganizationRoutes(req, res) {
  const {organizationId, ...data} = req.body;
  if (!data?.email || !organizationId) {
    return res.status(400).json({
      error: "invalid_request",
      message: "organizationId or email fields is missing"
    });
  }

  client.json_set(organizationId, ".", JSON.stringify({...data, isSubscribe: true}));
  res.status(200).json('ok');
}

function subscriptionsRoutes(req, res) {
  const id = req.params.id;
  const path = req.originalUrl.split('/')[1];

  client.json_set(id, "isSubscribe", JSON.stringify(path == 'subscribe' ? true : false), (err) => {
    if (err) {
      logger.error(JSON.stringify(err));
      return res.status(500).json({
        error: 'processing_error',
        message: 'failed processing request'
      });
    }
  });

  res.status(200).json('ok');
}

module.exports = {
  subscriptionsRoutes,
  createOrganizationRoutes
}
