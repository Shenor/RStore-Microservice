const express = require('express');
const router = express.Router();
const User = require('./../models/usersModel');

router.get('/:id', async (req, res) => {
  const _id = req.params.id;
  const user = await User.findOne({_id}).lean();
  user
  ? res.json({...user})
  : res.status(404).json({error: 'resource_not_found', message: 'User not found'})
});

router.post('/', async (req, res) => {
  const isValidBody = (req) => req.body?.organizationId || req.body?.phone;

  if (!isValidBody(req)) return res.status(400).json({error: 'invalid_request', message: 'Invalid request body'});
    new User({
      phone: req.body.phone,
      organizationID: req.body.organizationID
    }).save();
  res.send('OK');
});

router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  await User.deleteOne({_id});
  res.send('ok');
});

module.exports = router;
