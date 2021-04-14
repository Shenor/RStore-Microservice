const express = require('express');
const router = express.Router();
const Config = require('./../models/configModel');

router.get('/:id', async (req, res) => {
  const organizationID = req.params.id;
  const candidate = await Config.findOne({organizationID});
  candidate
    ? res.json({isIntegrated: true, message: 'Данная организация имеет интеграцию'})
    : res.json({isIntegrated: false, message: 'Данная организация не имеет интеграции'})
});

router.post('/', async (req, res) => {
  const organizationId = req.body.organizationId;
  const newConf = new Config({organizationId});
  newConf.save();
  res.status(200).send();
});

router.delete('/:id', async (req, res) => {
  const organizationID = req.params.id;
  await Config.deleteOne({organizationID});
  console.log(`Delete integration TELEGRAM for org - ${organizationID}`)
  res.send('OK');
});

module.exports = router;
