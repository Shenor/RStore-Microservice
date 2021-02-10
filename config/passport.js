const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const SeviceAPI = require('./../service/ServiceAPI');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Organization = require('../models/organizationModel');
const Nomenclature = require('../models/nomenclatureModel');
require('dotenv').config();

passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, async function (username, password, done) {
    await User.findOne({
        name: username
    }, async function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: "Неверное имя пользователя" });
        }
        if (password !== user.password) {
            return done(null, false, { message: "Неверный пароль"});
        }
        if (!user.contractStatus) {
            return done(null, false, { message: "Оплатите подписку"});
        }
        return done(null, user);
    });
}));

passport.use('local-registration', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async function (req, username, password, done) {
    const serviceAPI = new SeviceAPI();
    const { contractStatus } = req.body;
    const isGetToken = await serviceAPI.getToken(username, password);

        if (!isGetToken) {
            return done(null, false, { message: "Логин или пароль не совпадает с iikoBIZ" });
        }
    
    await serviceAPI.setOrganizationID();
    const nomenclatureJSON = await serviceAPI.getNomenclatureJSON();
    const organizationJSON = await serviceAPI.getOrganizationListJSON();
    const nomenclature = nomenclatureJSON.map((nom) => {return JSON.parse(nom)});
    const organization = organizationJSON.map((org) => {return JSON.parse(org)}).flat(1);
    const nomenclatureModify = nomenclature.map((nom, idx) => {
        nom.organizationID = serviceAPI._organizationID[idx];
        return nom;
    });
    
    await User.findOne({ name: username }, async function (err, user) {

        if (err) { return done(err, false); }

        if (user) {
            return done(null, false, { message: "Такой пользователь уже существует" });
        }

        Nomenclature.insertMany(nomenclatureModify, async (err, doc) => {
            if (err) {
                console.log(err);
                return done(null, false, {
                    message: "Ошибка при создании номенклатыры пользователя"
                })
            }
            
            const idNomenclatures = doc.map((item) => {return item._id;});
            /** Async/Await не работает с map, что бы функция передеанная в map заработала
             * оборачиваем ее в PromiseAll. Не знаю как это работает но нужно запомнить
             */
            const organizationModify = await Promise.all(organization.map( async (org, idx) => {
                const orders = new Order({ organizationID: org.id });
                await orders.save();
                org.orders = await (await Order.findOne({ organizationID: org.id }))._id;
                org.nomenclature = idNomenclatures[idx];
                return org;
            }));

            Organization.insertMany(organizationModify, async (err, doc) => {
                if (err) {
                    console.log(err);
                    return done(null, false, {
                        message: "Ошибка при создании организации пользователя"
                    })
                }

                const idOrganizations = doc.map((item) => {return item._id;});
                
                const newUser = new User({
                    name: username, 
                    password: password,
                    contractStatus,
                    organizations: idOrganizations,
                });
                            
                await newUser.save();

                return done(null, newUser, false);
            });
        });
    });
}));

passport.use('http-bearer', new BearerStrategy(
        async function (token, done) {
        const hashedToken = await crypto.pbkdf2Sync(token, 'RE8sto13', 1, 32, 'sha512').toString('hex');
        
        await User.findOne({ token: hashedToken }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            return done(null, user, { scope: 'all'});
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
