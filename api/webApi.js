const rp = require('request-promise');
const jwt = require('jsonwebtoken');
const util = require('util')
const moment = require('moment');
const express = require('express');
const nodemailer = require("nodemailer");
const router = express.Router();

const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
const ServiceAPI = require('../service/ServiceAPI');
const PaymentAPI = require('../service/PaymentAPI');

const serviceApi = new ServiceAPI();
const paymentAPI = new PaymentAPI();

//Env Config
require('dotenv').config()

//Tamplate mail
const templateMail = require('./../template/mail');
const transporter = nodemailer.createTransport({
    host: "smtp.yandex.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.MAILER_NAME,
        pass: process.env.MAILER_PASS,
    }
});
const sync_Payment_Order = new Map()
const queue_Payment_Orders = new Map()

router.get('/nomenclature', async (req, res) => {
    const organization = req.header('organization');
    const nomenclature = await Nomenclature.findOne({organizationID: organization}).lean();
    res.json(nomenclature);
});

router.get('/getStopList/:organizationID', async (req, res) => {
    const organizationID = req.params.organizationID ?? null;
    const {stopList} = await Nomenclature.findOne({organizationID}).select('stopList')
        if(stopList.length){
            res.json(stopList)
        } else {
            res.status(422).json({
                error: '112',
                message: 'Stop list is empty'
            })
        }
});

router.get('/getWorkTime/:organizationID', async (req, res) => {
    const organizationID = req.params.organizationID ?? null;
    const workTime = await Organization.findOne({id: organizationID}).select('-_id timeFrom timeTo').lean();
    res.json(workTime)
});

router.post('/order', async (req, res) => {
    console.log(req.body)
    if (req.body.payment == "CARD") {
        const payment = await paymentAPI.createPayment(req.body);
        const {id, confirmation: { confirmation_url }} = payment;
        sync_Payment_Order.set(id, req.body);
        res.json({id, confirmation_url});
        return;
    } 

    const iiko = await createOrderIIKO(req.body)
    res.json(iiko)
});

router.post('/eventPayments', async (req, res) => {
    const orderStatus = req.body
    res.status(200).send();
    console.log(`Заказ № ${orderStatus?.object.id} в статусе ${orderStatus?.event}`);
    
    if (orderStatus?.event && orderStatus?.event == 'payment.canceled') {
        sync_Payment_Order.delete(orderStatus.object.id)
        queue_Payment_Orders.set(orderStatus.object.id, {
            id: orderStatus.object.id,
            event: orderStatus.event,
            status: orderStatus.object.status,
            authorization_details: orderStatus.object.authorization_details,
            captured_at: orderStatus.object.captured_at,
            created_at: orderStatus.object.captured_at
        })
    }

    if (orderStatus?.event && orderStatus?.event == 'payment.succeeded'){
        const order = sync_Payment_Order.get(orderStatus.object.id)
        const iiko = await createOrderIIKO(order)
        sync_Payment_Order.delete(orderStatus.object.id)
        queue_Payment_Orders.set(orderStatus.object.id, iiko)
    }
});

router.get('/eventPayment/:id', async (req, res) => {
    res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        'connection': 'keep-alive'
    });
    await new Promise(resolve => setTimeout(resolve, 3000))

    const order = queue_Payment_Orders.get(req.params.id);
    
    //!Кастомные события работают только в таком варинате//
    // res.write(`event: canceled\n`)
    // res.write(`data: 1\n`)
    // res.write("\n\n")

    if (order && order?.event == 'payment.canceled') {
        res.write(`event: canceled\n`)
        res.write(`data: ${JSON.stringify(queue_Payment_Orders.get(req.params.id))}\n`)
        res.write("\n\n")
        setTimeout(() => {queue_Payment_Orders.delete(req.params.id)}, 30000)
    }

    if (order && order.number && order.orderId) {
        res.write(`event: succeeded\n`)
        res.write(`data: ${JSON.stringify(queue_Payment_Orders.get(req.params.id))}\n`)
        res.write("\n\n")
        setTimeout(() => {queue_Payment_Orders.delete(req.params.id)}, 30000)
    }

    res.status(200).send();
});

router.get('/prime-hill/:phone', async (req, res) => {
    const phone = req.params.phone.replace(/[+()-]/g, '')
    try {
        const getClientPH = await rp(`https://cabinet.prime-hill.com/api/v2/clientInfo?token=${process.env.TOKEN_PRIMEHILL}&type=phone&id=${phone}`)
        const {
            firstName,
            lastName,
            discountPercent
        } = JSON.parse(getClientPH)

        res.json({
            firstName,
            lastName,
            discountPercent
        })
    } catch (e) {
        const {error} = JSON.parse(e.error)
        res.json(error)
    }
});

async function createOrderIIKO(order) {
    const {organizationID, ...frontOrder} = order;
    const candidate = await Organization.findOne({ id: organizationID }).select('_id email') ?? {};
    if(!Object.keys(candidate).length){ console.log("Данная рганизация не найдена!"); return {error: 'Организация не найдена!'}};
    const {_id, email: clientNotificationMail} = candidate;
    const { name, password } = await User.findOne({ organizations: _id });

    await serviceApi.getToken(name, password);

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

    const adress = {
        city: frontOrder.city,
        street: frontOrder.street,
        home: frontOrder.home,
        apartment: frontOrder.apartment,
        comment: frontOrder.comment
    };

    const customer = {
        name: frontOrder.name,
        phone: frontOrder.phone
    }
 
    const formatCart = () => frontOrder.cart.map(({ id, code, name, price, count}) => {
        return {
            id,
            code,
            name,
            sum: price,
            amount: count,
            //modifiers: modifiers.length ? modifiers : null
        }
    });

    const addDeliveryItem = (products) => {
        if (!products) return console.error('Товар доставки не найден в номенклатуре')
        const {id, name, code, price} = products[0];
        templateOrder.order.items.push({ id, code, name, price, amount: 1 })
        templateOrder.order.paymentItems[0].sum += price
    };

    let templateOrder = {
        organization: organizationID,
        customer,
        order: {
            date: moment().format('YYYY-MM-DD HH:mm:SS'),
            phone: frontOrder.phone,
            isSelfService: frontOrder.isSelfService,
            items: formatCart(),
            address: !frontOrder.isSelfService ? adress : null,
            paymentItems: [{
                sum: frontOrder.orderPrice,
                paymentType: {
                    code: frontOrder.payment,
                    name: typePayment.get(frontOrder.payment),
                    comment: frontOrder.comment,
                    combinable: true,
                    externalRevision: codePayment.get(frontOrder.payment),
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

    if (!frontOrder.isSelfService) {
        const {products} = await Nomenclature.findOne({organizationID})
            .select({products: {$elemMatch: {name: 'Доставка'}}})
            .lean(); //{$or: [{name: 'Доставка'}, {name: 'Доставка'}]}

        addDeliveryItem(products)
    }

    if (frontOrder.discount) {
        const discountList = await serviceApi.getDiscounts(organizationID);
        const delivery = discountList.discounts.filter(item => item.name.toLowerCase() == 'primehill')
        if(!delivery) return false;
        templateOrder.order.discountCardTypeId = delivery[0].id
        templateOrder.order.discountOrIncreaseSum = frontOrder.discount
        templateOrder.order.paymentItems[0].sum -= frontOrder.discount
    }

    // Send mail with detail order //
    if (clientNotificationMail) {
        transporter.sendMail({
            from: '"Rijet"<order@rijet.ru>',
            to: clientNotificationMail,
            subject: `Поступил новый заказ ${moment().format('DD-MM-YYYY HH:mm')}`,
            html: templateMail({
                ...order, 
                adress, 
                cart: frontOrder.cart,
                selfService: frontOrder.isSelfService,
                createdTime: moment().format('DD-MM-YYYY HH:mm')
            })
        });
    }

    const iikoOrder = await serviceApi.sendOrder(templateOrder);

    // Debug & Log order sending and comming //
    console.log(JSON.stringify(templateOrder, null, 2));
    console.log("----------------------------------")
    console.log(JSON.stringify(iikoOrder, null, 2));
    
    // Check error create order //
    if(iikoOrder.isError) {
        console.log(`(Сервис iikoBiz не смог обработать заказ) ${iikoOrder.error}`.red);
        return { error: iikoOrder.error }
    };

    if (iikoOrder && iikoOrder.problem != null) {
        console.log(`(Ошибка создания заказа) ${iikoOrder.problem.problem}`.red)
        return { error: iikoOrder.problem.problem }
    }
    
    await Order.updateOne({ organizationID }, {$push: { orders: iikoOrder }});

    return {
        title: 'Order Created',
        orderId: iikoOrder.orderId,
        status: iikoOrder.status,
        statusCode: iikoOrder.statusCode,
        number: iikoOrder.number,
        createdTime: iikoOrder.createdTime,
        customerName: iikoOrder.customer.name
    }
}

module.exports = router;