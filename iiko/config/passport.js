const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const User = require('../src/models/userModel');
const Order = require('../src/models/orderModel');
const SeviceAPI = require('../src/service/ServiceAPI');
const Organization = require('../src/models/organizationModel');
const Nomenclature = require('../src/models/nomenclatureModel');

const logger = require('../src/helpers/create-logger');

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
  const serviceAPI = await new SeviceAPI({username, password});

  if (!serviceAPI.getToken()) return done(null, false, {error: "invalid_request", message: "Логин или пароль не совпадает с iikoBIZ"});

  let organizations = await serviceAPI.setOrganizationId();
  let nomenclatures = await serviceAPI.getNomenclatures();

  if(!nomenclatures[0]) return done(null, false, {error: "invalid_request", message: "Номенклатура не выгружена"});

  nomenclatures.forEach((item, idx) => item.organizationId = organizations[idx].id);

  // Find exist user //
  const user = await User.findOne({name: username}).lean();
  if (user) return done(null, false, {error: "invalid_client", message: "Такой пользователь уже существует"});

  // Create Nomenclature //
  try {
    const doc = await Nomenclature.insertMany(nomenclatures);
    const nomenclatures_id = doc.map(item => item._id);
    organizations.forEach((item, idx) => item.nomenclature = nomenclatures_id[idx])
  } catch (err) {
    return done(null, false, {error: "server_error",message: "Ошибка при создании номенклатыры пользователя"})
  }

  // Create Organization //
  await Organization.insertMany(organizations, async (err, doc) => {
    if (err) {
      logger.error(`${JSON.stringify(err)}`)
      return done(null, false, {error: "server_error", message: "Ошибка при создании организации пользователя"})
    }

    const idOrganizations = doc.map(item => item._id);
    const newUser = new User({
      name: username,
      password: password,
      organizations: idOrganizations,
    });
    await newUser.save();

    return done(null, newUser, false);
  });
}));

passport.use('http-bearer', new BearerStrategy(
  async function (token, done) {
  const hashedToken = await crypto.pbkdf2Sync(token, 'RE8sto13', 1, 32, 'sha512').toString('hex');

    await User.findOne({ token: hashedToken }, function (err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);

      return done(null, user, { scope: 'all'});
    });
  }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => { done(err, user); });
});


// const user = await User.findOne({name: username}).lean();
// if (user) return done(null, false, {error: "invalid_client", message: "Такой пользователь уже существует"});
  // const nomenclatureModify = nomenclature.map((nom, idx) => {
  //   nom.organizationID = serviceAPI.getOrganization(idx);
  //   return nom;
  // });

  // await User.findOne({
  //   name: username
  // }, async function (err, user) {

  //   if (err) return done(err, false);
  //   if (user) return done(null, false, {
  //     error: "invalid_client",
  //     message: "Такой пользователь уже существует"
  //   });

  //   Nomenclature.insertMany(nomenclatureModify, async (err, doc) => {
  //     if (err) {
  //       console.log(err);
  //       return done(null, false, {
  //         error: "server_error",
  //         message: "Ошибка при создании номенклатыры пользователя"
  //       })
  //     }

  //     const idNomenclatures = doc.map((item) => {
  //       return item._id;
  //     });

  //     /** Async/Await не работает с map, что бы функция передеанная в map заработала
  //      * оборачиваем ее в PromiseAll. Не знаю как это работает но нужно запомнить
  //      */
  //     const organizationModify = await Promise.all(organization.map(async (org, idx) => {
  //       //   const orders = new Order({ organizationID: org.id });
  //       //   await orders.save();
  //       org.orders = await (await Order.findOne({
  //         organizationID: org.id
  //       }))._id;
  //       org.nomenclature = idNomenclatures[idx];
  //       return org;
  //     }));

  //     Organization.insertMany(organizationModify, async (err, doc) => {
  //       if (err) {
  //         console.log(err);
  //         return done(null, false, {
  //           error: "server_error",
  //           message: "Ошибка при создании организации пользователя"
  //         })
  //       }

  //       const idOrganizations = doc.map((item) => {
  //         return item._id;
  //       });

  //       const newUser = new User({
  //         name: username,
  //         password: password,
  //         contractStatus,
  //         organizations: idOrganizations,
  //       });

  //       await newUser.save();

  //       return done(null, newUser, false);
  //     });
  //   });
  // });


  // Nomenclature.insertMany(nomenclatures, async (err, doc) => {
  //   if (err) {
  //     logger.error(`${JSON.stringify(err)}`)
  //     return done(null, false, {error: "server_error",message: "Ошибка при создании номенклатыры пользователя"})
  //   }

  //   const nomenclatures_id = doc.map(item => item._id);
  //   console.log(nomenclatures_id);
  //   organizations.forEach((item, idx) => item.nomenclature = nomenclatures_id[idx])
  // });

  // await new Promise(resolve => setTimeout(resolve, 100));
