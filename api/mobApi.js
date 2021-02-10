const express = require('express');
const router = express.Router();
const moment = require('moment');

const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
const ServiceAPI = require('../service/ServiceAPI');

const filterProductFiled = [
    "-products.tags",
    "-products.type",
    "-products.order",
    "-products.groupId",
    "-products.seoText", 
    "-products.seoTitle", 
    "-products.isDeleted",
    "-products.seoKeywords", 
    "-products.warningType",
    "-products.measureUnit",
    "-products.parentGroup",
    "-products.measureUnit",
    "-products.groupModifiers",
    "-products.seoDescription", 
    "-products.additionalInfo",
    "-products.useBalanceForSell",
    "-products.differentPricesOn",
    "-products.doNotPrintInCheque",
    "-products.prohibitedToSaleOn"
];

router.get('/getNomenclature', async (req, res) => {
    const { organizations } = req.user;
    const organizationList = await Organization.find({ _id: organizations }).select('nomenclature -_id').lean(); // Get list orhanizations
    const organizationsModify = organizationList.map(({ nomenclature }) => { return nomenclature; }); // Extract Nomenclarute ID
    const nomenclature = await Nomenclature.find({_id: organizationsModify}).select(filterProductFiled).lean();

    //  console.dir(nomenclature, {depth: null});

    // console.log(nomenclature);

    res.json(nomenclature);
});

module.exports = router;