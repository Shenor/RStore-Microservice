const express = require('express');
const router = express.Router();

const controller = require('../../controller/root.controller/index');

router.get('/', (req, res) => res.send('IIKO LK OK'));

router.post('/login', controller.login);
router.post('/registration', controller.registration);

router.get('/organizations', controller.getOrganizations);
router.get('/organizations/:id', controller.getOrganizationById);
router.get('/organizations/:id/orders', controller.getOrganizationOrders);
router.get('/organizations/:id/settings', controller.getOrganizationSettings);

router.put('/organizations/:id/settings', controller.updateSettigns);
router.put('/organizations/:id/nomenclature', controller.updateNomenclature);

module.exports = router;
