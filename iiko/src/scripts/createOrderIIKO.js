const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
const ServiceAPI = require('../service/ServiceAPI');
const logger = require('../helpers/create-logger');

const serviceApi = new ServiceAPI();

const typePayment = new Map([
  ["CASH", "Наличные"],
  ["CARD", "Оплата доставки банковской картой"],
  ["CARD1", "Оплата доставки банковской картой при получении"]
]);

const codePayment = new Map([
  ["CASH", 10],
  ["CARD1", 20],
  ["CARD", 20859]
]);

const formatCart = (frontOrder) => {
   return frontOrder.cart.map(({id, code, name, price, count }) => {
     return {
       id,
       code,
       name,
       sum: price,
       amount: count,
       //modifiers: modifiers.length ? modifiers : null
     }
   })
};

const saveToOrderHistory = async (iikoOrder) => {
  await Order.updateOne({organizationID}, {$push: {orders: iikoOrder}}
)};

async function createOrderIIKO(newOrder) {
  const orderDateTime = DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss');
  const {organizationID, ...order} = newOrder;
  const candidate = await Organization.findOne({id: organizationID}).select('_id email');

    if (!candidate) {
      logger.error(`Данная организация не найдена: ${organizationID} — ${JSON.stringify(newOrder)}`)
      return {
        error: 'invalid_organization',
        message: 'Данная организация не найдена!'
      }
    };

  const {name, password} = await User.findOne({organizations: candidate._id});
  await serviceApi.getToken(name, password);

  const adress = {
    city: order.city,
    street: order.street,
    home: order.home,
    apartment: order.apartment,
    comment: order.comment
  };

  const customer = {
    name: order.name,
    phone: order.phone
  }

  let templateOrder = {
    organization: organizationID,
    customer,
    order: {
      date: orderDateTime,
      phone: order.phone,
      isSelfService: order.isSelfService,
      items: formatCart(order),
      address: order.isSelfService ? null : adress,
      paymentItems: [{
        sum: order.orderPrice,
        paymentType: {
          code: order.payment,
          name: typePayment.get(order.payment),
          comment: order.comment,
          combinable: true,
          externalRevision: codePayment.get(order.payment),
          applicableMarketingCampaigns: null,
          deleted: false
        },
        additionalData: null,
        isProcessedExternally: false, //Признак ПРОВЕДЕННОГО платежа
        isPreliminary: false, //Признак предоплаты
        isExternal: true //Всегда true для оплаты с сайта
      }]
    },
  };

  // Add Delivery //
  if (!order.isSelfService) {
    const {products} = await Nomenclature.findOne({organizationID})
      .select({
        products: {
          $elemMatch: {
            name: 'Доставка'
          }
        }
      })
      .lean() ?? {};

    if (!products) return logger.error('Товар доставки не найден в номенклатуре');

    const deliveryItem = {
      id: products[0].id,
      name: products[0].name,
      code: products[0].code,
      price: products[0].price,
      amount: 1
    }

    templateOrder.order.items.push(deliveryItem)
    templateOrder.order.paymentItems[0].sum += price
  }

  // Add Discount //
  if (order.discount) {
    const discountList = await serviceApi.getDiscounts(organizationID);
    const discountPrimeHill = discountList.discounts.filter(item => item.name.toLowerCase() == 'primehill')
    if (!discountPrimeHill) return;
    templateOrder.order.discountCardTypeId = discountPrimeHill[0].id
    templateOrder.order.discountOrIncreaseSum = order.discount
    templateOrder.order.paymentItems[0].sum -= order.discount
  }

  const iikoOrder = await serviceApi.sendOrder(templateOrder);

  // Debug & Log order sending and comming //
  console.log(JSON.stringify(templateOrder, null, 2));
  console.log("----------------------------------")
  console.log(JSON.stringify(iikoOrder, null, 2));

  // Check error create order //
  if (iikoOrder.isError) {
    logger.error(`Сервис iikoBiz не смог обработать заказ: ${JSON.stringify(iikoOrder.error)}`);
    return {
      error: 'processing_error',
      message: `Сервис iikoBiz не смог обработать заказ: ${iikoOrder.error}`
    }
  };

  if (iikoOrder && iikoOrder.problem != null) {
    logger.error(`Проблемы создания заказа: ${JSON.stringify(iikoOrder.problem.problem)}`)
    return {
      error: 'processing_error',
      message: `Проблемы создания заказа: ${iikoOrder.problem.problem}`
    }
  }

  await saveToOrderHistory(iikoOrder);

  return {
    title: 'Order Created',
    number: iikoOrder.number,
    status: iikoOrder.status,
    orderId: iikoOrder.orderId,
    statusCode: iikoOrder.statusCode,
    createdTime: iikoOrder.createdTime,
    customerName: iikoOrder.customer.name
  }
}

module.exports = createOrderIIKO;
