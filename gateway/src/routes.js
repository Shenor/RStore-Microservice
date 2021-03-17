const express = require('express');
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require('http-proxy-middleware');
const restream = require('./utils/proxy-restream');
const router = express.Router();

const MINUTE = 60 * 1000;
const apiLimiter = rateLimit({
  windowMs: 15 * MINUTE, //15 minutes
  max: 1000
})

router.use('/iiko', apiLimiter, createProxyMiddleware({
  target: 'http://localhost:3010',
  pathRewrite: {'/iiko': ''},
  onProxyReq: restream
}));

router.use('/telegram', createProxyMiddleware({
  target: 'http://localhost:3011',
  pathRewrite: {'/telegram': ''},
  onProxyReq: restream
}));

router.use('/mailer', (req, res) => res.send('telegram'))

router.get('/', (req, res) => res.send('OK'));
router.get('/health-check', (req, res) => res.send('OK'));

module.exports = router;
