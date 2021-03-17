const organizationRoutes = require('./organization.controller');
const primehillRoutes = require('./primehill.controller');
const orderRoutes = require('./order.controller');

module.exports = {
  orders: {
  ...orderRoutes,
  },
  organization: {
    ...organizationRoutes
  },
  primehill: {
    ...primehillRoutes
  }
}
