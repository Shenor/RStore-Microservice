// const mongoose = require('mongoose');
// const Order = require('../models/oldOrderModel');
// const Order2 = require('../models/orderModel');
// const config = require('../../config/config');

// (async () => {
//   await mongoose.connect(`mongodb://${config.db_user}:${config.db_password}@${config.db_host}:${config.db_port}`, {
//     ssl: false,
//     dbName: config.db_name,
//     useCreateIndex: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   });

//   const organizations = await Order.find({}).lean();
//   // console.log(orders);

//   for await (const orders of organizations) {
//     await new Promise(resolve => setInterval(resolve, 500))
//     for await (const item of orders.orders) {
//       await new Promise(resolve => setInterval(resolve, 100))
//       const newitem = await new Order2({
//       organizationId: orders.organizationID,
//         ...item
//       })
//       await newitem.save();
//     }
//   }

//   console.log('Done!')
// })();

