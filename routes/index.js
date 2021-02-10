const rp = require('request-promise');
const jwt = require('jsonwebtoken');
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

const templateMail = require('./../template/mail');
const app = require('../app');
const { route } = require('../api/webApi');
const passport = require('passport');

//Env Config
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: "smtp.yandex.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.MAILER_NAME,
        pass: process.env.MAILER_PASS,
    }
});

const modifyOranizationList = (organizations) => {
    return organizations.map((item) => {
        const {
            nomenclature
        } = item;
        item.uploadDate = nomenclature.uploadDate;
        item.productsCount = nomenclature.products.length;
        item.productCategoriesCount = nomenclature.productCategories.length;
        delete item.nomenclature;
        return item;
    });
};

const secretKey = 'RE8sto13'; //Include in proccess ENV
const serviceAPI = new ServiceAPI();

router.post('/test', async (req, res) => {
    const {
        login,
        password
    } = req.body;
    await User.findOne({
        name: login
    }, async function (err, user) {
        if (err) {
            res.status(500).json({
                title: "server error",
                error: err
            });
            throw new Error(err);
        }
        if (!user) {
            return res.status(401).json({
                title: "Неверное имя пользователя",
                error: "invalid credentils"
            });
        }
        if (password !== user.password) {
            return res.status(401).json({
                title: "Неверный пароль",
                error: "invalid credentils"
            });
        }
        if (!user.contractStatus) {
            return res.status(401).json({
                title: "Оплатите подписку",
                error: "invalid credentils"
            });
        }

        let token = jwt.sign({
            userId: user._id
        }, secretKey, {
            expiresIn: '1 days'
        });
        return res.status(200).json({
            title: 'login success',
            token
        });
    });
});

router.post('/registration', (req, res) => {
    passport.authenticate('local-registration', (error, user, message) => {
        if(error) {
            return res.status(400).json({
                title: "Ошибка сервера",
                error: "Internal server error"
            });
        }
        if(message){
            return res.status(400).json({
                title: message.message,
                error: "invalid credentils"
            });
        }
        let token = jwt.sign({
            userId: user._id
        }, secretKey, {
            expiresIn: '1 days'
        });
        return res.status(200).json({
            title: 'Registration success',
            token
        });
    })(req, res);
});
router.get('/organizations', async (req, res) => {
    const token = req.header('authorization').split(' ')[1];
    jwt.verify(token, secretKey, async (err, decode) => {
        if (err) {
            return res.status(401).json({
                title: 'unauthorized'
            })
        }
        //Token is valid
        const {
            organizations
        } = await User.findById(decode.userId).select('-_id organizations');
        const organizationList = await Organization.find({
                _id: organizations
            })
            .select('id logo fullName')
            .populate('nomenclature', '-_id products productCategories uploadDate')
            .lean();
        const editedOrganozationList = modifyOranizationList(organizationList);

        res.json({
            organizations: editedOrganozationList
        });
    });
})
router.get('/organizations/:id', async (req, res) => {
    const token = req.header('authorization').split(' ')[1];
    jwt.verify(token, secretKey, async (err, decode) => {
        if (err) return res.status(401).json({
            title: 'unauthorized'
        })
        //Token is valid
        const id = req.params.id;
        const organization = await Organization.findOne({
            id
        }).select('name logo').populate('nomenclature');
        const {
            nomenclature: {
                products,
                productCategories
            }
        } = organization;

        res.json({
            organization,
            productsCount: products.length,
            productCategoriesCount: productCategories.length
        });
    });
})
router.get('/organizations/:id/orders', async (req, res) => {
    const token = req.header('authorization').split(' ')[1];
    jwt.verify(token, secretKey, async (err, decode) => {
        if (err) return res.status(401).json({
            title: 'unauthorized'
        })
        //Token is valid
        const {
            organizations
        } = await User.findById(decode.userId).select('-_id organizations');
    });
})
router.get('/update', async (req, res) => {
    const token = req.header('authorization').split(' ')[1];
	console.log(req.headers)
    const { organization } = req.headers;
    if (!token || !organization) throw new Error("Check req.header on have token or organizatoion ID");
    jwt.verify(token, secretKey, async (err, decode) => {
        if (err) return res.status(401).json({
            title: 'unauthorized'
        })
        //Token is valid
        const user = await User.findById({
            _id: decode.userId
        }).select('name password');
        await serviceAPI.getToken(user.name, user.password);
        const newNomenclature = await serviceAPI.getOnceNomenclatureJSON(organization);
        const updateNomenclature = await Nomenclature.findOneAndUpdate({organizationID: organization}, JSON.parse(newNomenclature), {
            useFindAndModify: false
        });
        await updateNomenclature.save();
        res.json({
            status: 'ok'
        });
    });
})
router.get('/settings', async (req, res) => {
    const token = req.header('authorization').split(' ')[1];
    if (!token) throw new Error("Check req.header on have token");
    jwt.verify(token, secretKey, async (err, decode) => {
        if (err) return res.status(401).json({
            title: 'unauthorized'
        })
        //Token is valid
        const {
            site,
            token
        } = await User.findById({
            _id: decode.userId
        }).select('site token').lean();

        res.json({
            site,
            isToken: token ? true : false
        });
    });
})
router.post('/settings', async (req, res) => {
    const {
        sites
    } = req.body;
    const token = req.header('authorization').split(' ')[1];
    if (!token) throw new Error("Check req.header on have token");
    jwt.verify(token, secretKey, async (err, decode) => {
        if (err) return res.status(401).json({
            title: 'unauthorized'
        })
        //Token is valid

        await User.updateOne({
            _id: decode.userId
        }, {
            site: sites
        });
        res.json({
            title: 'Данные успешно сохранены'
        });
    });
})

module.exports = router;