const cors = require('cors');
const express = require('express');
const router = express.Router();
const apiRoutes = require('./api');
const appRoutes = require('./app');

const apiCorsOptions = require('./../../config/apiCORS');
const appCorsOptions = require('./../../config/appCORS');

router.use('/lk', cors(appCorsOptions), appRoutes);
router.use('/api', cors(apiCorsOptions), apiRoutes);

router.get('/', (req, res) => res.send('OK'));
router.get('/health-check', (req, res) => res.send('OK'));

module.exports = router;
