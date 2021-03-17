const express = require('express');
const router = express.Router();

const mobileApi = require('./mobileApi');
const browserApi = require('./browserApi');

router.get('/', (req, res) => res.send('IIKO API OK'));

router.use('/v1', browserApi);
router.use('/v2', mobileApi);

module.exports = router;
