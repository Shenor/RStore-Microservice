const express = require('express');
const router = express.Router();

const userRoutes = require('./controller/user.controller');
const configRoutes = require('./controller/config.controller');
const integrationRoutes = require('./controller/integration.controller');

router.use('/user', userRoutes)
router.use('/config', configRoutes)
router.use('/integration', integrationRoutes)

router.get('/', (req, res) => res.send('OK'));
router.get('/health-check', (req, res) => res.send('OK'));

module.exports = router;