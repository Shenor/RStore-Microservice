const express = require('express');
const router = express.Router();
const controller = require('../../controller/api.controller');

router.get('/', (req, res) => res.send('IIKO api/v1 OK'));

router.get('/organizations/:organizationId/nomenclature', controller.organization.getNomenclature);
router.get('/organizations/:organizationId/workTime', controller.organization.getWorkTime);
router.get('/organizations/:organizationId/stopList', controller.organization.getStopList);
router.get('/organizations/:organizationId/orders', controller.organization.getOrders);

router.get('/prime-hill/:phone', controller.primehill.findByPhone);

router.post('/order', controller.orders.create);
router.post('/eventPayments', controller.orders.webhook_event_payment_from_yandex);
router.get('/eventPayment/:id', controller.orders.status);

module.exports = router;
