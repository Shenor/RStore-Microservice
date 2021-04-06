const mongoose = require('mongoose');
const config = require('./config/config');
const Service = require("./src/service/ServiceAPI");
const Payment = require("./src/service/PaymentAPI");
// const service = new Service();
const payment = new Payment();
const create_order = require('./src/scripts/createOrderIIKO');

const order = {
  activity_id: "bgS3IJ27q7lzkBymymVcw",
  cart: [{
    additionalInfo: null,
    code: "00003",
    description: "бургер с рыбкой для тебя, бургер с рыбкой для тебя, бургер с рыбкой для тебя, бургер с рыбкой для тебя, бургер с рыбкой для тебя, бургер с рыбкой для тебя, бургер с рыбкой для тебя, ",
    id: "7ba5ca10-8cc8-421a-8ba3-54197a332168",
    isDeleted: false,
    name: "Бургер с рыбой",
    seoDescription: null,
    seoKeywords: null,
    seoText: null,
    seoTitle: null,
    tags: null,
    carbohydrateAmount: 0,
    carbohydrateFullAmount: 0,
    differentPricesOn: [],
    doNotPrintInCheque: false,
    energyAmount: 0,
    energyFullAmount: 0,
    fatAmount: 0,
    fatFullAmount: 0,
    fiberAmount: 0,
    fiberFullAmount: 0,
    groupId: null,
    groupModifiers: [],
    measureUnit: "порц",
    modifiers: [],
    price: 250,
    productCategoryId: "7cd6606e-2a4f-f2bd-0172-e106315d4cff",
    prohibitedToSaleOn: [],
    type: "dish",
    useBalanceForSell: false,
    weight: 0,
    images: [],
    isIncludedInMenu: true,
    order: 1,
    parentGroup: "db0727ba-04f4-4f7a-9372-507edce9d7f8",
    warningType: 0,
    count: 1
  }],
  orderPrice: 250,
  discount: 0,
  deliveryPrice: 150,
  organizationId: "fb3a6916-b548-11ea-aa5c-0025906bfe47",
  name: "Ricam",
  phone: "+7(999)999-99-99",
  email: "info@ricam.ru",
  city: "Говнодар",
  street: "Пушкино",
  home: "1",
  apartment: "2",
  isSelfService: false,
  payment: "CASH",
  comment: "",
  return_url: "http://localhost:3001/",
  internal_number: "852248",
  created_time: "2021-03-17 14:24:48"
};

const order2 = {
  "organization": "fe470000-906b-0025-fbae-08d85e0df73b",
  "customer": {
    "name": "Ricam",
    "phone": "+7(999)999-99-99"
  },
  "order": {
    "date": "2021-03-17 14:24:48",
    "phone": "+7(999)999-99-99",
    "isSelfService": false,
    "items": [{
      "id": "7ba5ca10-8cc8-421a-8ba3-54197a332168",
      "code": "00003",
      "name": "Бургер с рыбой",
      "sum": 250,
      "amount": 1
    }],
    "address": {
      "city": "Говнодар",
      "street": "Пушкино",
      "home": "1",
      "apartment": "2",
      "comment": ""
    },
    "paymentItems": [{
      "sum": 250,
      "paymentType": {
        "code": "CASH",
        "name": "Наличные",
        "comment": "",
        "combinable": true,
        "externalRevision": 10,
        "applicableMarketingCampaigns": null,
        "deleted": false
      },
      "additionalData": null,
      "isProcessedExternally": false,
      "isPreliminary": false,
      "isExternal": true
    }]
  }
};

(async () => {
  // try {
  //   await mongoose.connect(`mongodb://${config.db_user}:${config.db_password}@${config.db_host}:${config.db_port}`, {
  //     ssl: false,
  //     dbName: config.db_name,
  //     useCreateIndex: true,
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true
  //   });
  //   console.log("Connecting Database is success");
  // } catch (error) {
  //   console.log(error);
  // }
  const service = await new Service({username: 'hotmilks1', password: "RE8sto13"});

  // const res = null;
  // const {name, password} = res
  // const res = service.getToken();
  // await service.getToken("hotmilks1", "RE8sto13");
  const res = await service.sendOrder(order2);
  // const res = await create_order(order);
  // const res = await payment.createPayment(order);
  // await create_order(order)

  // const res = await service.getOnceNomenclatureJSON("fb3a6916-b548-11ea-aa5c-0025906bfe47");
  // const res = await service.getStopList("fb3a6916-b548-11ea-aa5c-0025906bfe47");
  // const res = await service.getDiscounts("fb3a6916-b548-11ea-aa5c-0025906bfe47");
  // const res = await service.setOrganizationId();
  // const res = await service.setOrganizationId();
  // const res2 = await service.getNomenclatureJSON();
  // const res2 = await service.getOrganizationListJSON();
  console.log(res);
  // console.log(res2);
})();
