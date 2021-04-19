const scheduler = require('node-schedule');
const logger = require('../helpers/create-logger');

const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
const ServiceAPI = require('../service/ServiceAPI');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

scheduler.scheduleJob('*/10 * * * * *', async () => {
  const allOrganization = await Organization.find({})

  for (const {_id, id} of allOrganization){
    const { name, password } = await User.findOne({ organizations: _id });
    const serviceApi = await new ServiceAPI({username: name, password: password});
      if (!serviceApi) continue;
    const res = await serviceApi.getStopList(id);
      if (!res) {
        logger.error(`Organization ${id} not update stop list`);
        continue;
      }
      if (res && !res.stopList.length) continue;

    console.log(res)
    await delay(300);
  }
});


// setIntervalAsync(async () => {
//     const allOrganization = await Organization.find({})

//     for (const {_id, id} of allOrganization){
//         const { name, password } = await User.findOne({ organizations: _id });
//         console.log(name, password);
//         const serviceApi = new ServiceAPI();
//         if (!await serviceApi.getToken(name, password)) continue;
//         const res = await serviceApi.getStopList(id);
//         if (res.code && res.httpStatusCode) continue;
//         const stopList = JSON.parse(res)
//         if (!stopList.stopList.length) continue;

//         await Nomenclature
//             .findOne({organizationID: id})
//             .updateOne({}, {
//                 $set: {
//                   "stopList": stopList.stopList
//                 }
//             })

//         console.log(`[${new Date().toLocaleString()}] - ${name} стоп-лист успешно обновлен`)
//         await delay(300);
//     }
// }, MINUTES); //* 12);
