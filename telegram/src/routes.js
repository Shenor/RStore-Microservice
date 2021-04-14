const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.use('/users', controller.userRoutes)
router.use('/integrations', controller.integrationRoutes)

router.get('/', (req, res) => res.send('OK'));
router.get('/health-check', (req, res) => res.send('OK'));

module.exports = router;
