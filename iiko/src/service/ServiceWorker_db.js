const scheduler = require('node-schedule');
const logger = require('../helpers/create-logger');

const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
const ServiceAPI = require('../service/ServiceAPI');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

scheduler.scheduleJob({hour: 12}, async () => { // '*/10 * * * * *' -> Every 10 seconds
  const allOrganization = await Organization.find({})

  for (const {_id, id} of allOrganization){
    const { name, password } = await User.findOne({ organizations: _id });
    const serviceApi = await new ServiceAPI({username: name, password: password});
      if (!serviceApi) continue;
    const res = await serviceApi.getStopList(id);
      if (!res) continue;
      if (res && !res.stopList.length) continue;

    await Nomenclature
      .findOne({organizationId: id})
      .updateOne({}, {
        $set: {
          "stopList": res.stopList
        }
      })

    logger.info(`[${new Date().toLocaleString()}] - ${name} стоп-лист успешно обновлен`)
    await delay(1000 * 60);
  }
});
