const express = require('express');
const router = express.Router();
const User = require('./../models/usersModel');

router.get('/:id', async (req, res) => {
  const organizationID = req.params.id;
  const candidate = await User.find({organizationID})
  candidate
  ? res.json(candidate)
  : res.json({isIntegrated: false});
});

module.exports = router;
