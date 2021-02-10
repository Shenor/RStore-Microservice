const express = require('express');
const router = express.Router();
const User = require('./../models/usersModel');

router.post('/create', async (req, res) => {
    const isValidBody = (req) => req.body?.organizationID || req.body?.phone;

    if (!isValidBody(req)) return res.status(400).json({message: 'Invalid request body'});
    new User({
        phone: req.body.phone,
        organizationID: req.body.organizationID
    }).save();
    res.send('OK');
});

router.delete('/delete/:id', async (req, res) => {
    const _id = req.params.id;
    await User.deleteOne({_id});
    res.send('OK');
});

module.exports = router;