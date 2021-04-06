const moment = require('moment');
const { setIntervalAsync } = require('set-interval-async/dynamic')
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
const ServiceAPI = require('../service/ServiceAPI');
const serviceApi = new ServiceAPI();

const MINUTES = 1000 * 60;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

setIntervalAsync(async () => {
    const allOrganization = await Organization.find({})

    for (const {_id, id} of allOrganization){
        const { name, password } = await User.findOne({ organizations: _id });
        if (!await serviceApi.getToken(name, password)) continue;
        const res = await serviceApi.getStopList(id);
        if (res.code && res.httpStatusCode) continue;
        const stopList = JSON.parse(res)
        if (!stopList.stopList.length) continue;

        await Nomenclature
            .findOne({organizationID: id})
            .updateOne({}, {
                $set: {
                  "stopList": stopList.stopList
                }
            })

        console.log(`[${moment().format('YYYY-MM-DD HH:mm:SS')}] - ${name} стоп-лист успешно обновлен`)
        await delay(MINUTES);
    }
}, MINUTES * 60 * 12);
