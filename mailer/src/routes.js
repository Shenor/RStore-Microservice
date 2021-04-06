const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/organization', controller.createOrganizationRoutes);
router.get(['/subscribe/:id', '/unsubscribe/:id'], controller.subscriptionsRoutes)

router.get('/', (req, res) => res.send('OK'));
router.get('/health-check', (req, res) => res.send('OK'));

module.exports = router;
