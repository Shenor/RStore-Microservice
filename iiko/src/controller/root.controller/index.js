const jwt = require('jsonwebtoken');
const passport = require('passport');
const { DateTime } = require('luxon');

const config = require('../../../config/config');
const User = require('../../models/userModel');
const Order = require('../../models/orderModel');
const Organization = require('../../models/organizationModel');
const Nomenclature = require('../../models/nomenclatureModel');
const ServiceAPI = require('../../service/ServiceAPI');

const serviceAPI = new ServiceAPI();
const token_lifetime = 1;

const missingAuthHeader = (res) => {
  return res.status(401).json({
    error: "invalid_token",
    message: "Unauthorized"
  })
}

// Passport Config //
require('../../../config/passport');

async function login (req, res) {
  const {login, password } = req.body;
  await User.findOne({name: login}, async (err, user) => {
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

    const token = jwt.sign({userId: user._id}, config.jwt_secret_key, {expiresIn: `${token_lifetime} days`});
    const expires_in = DateTime.now().plus({days: token_lifetime}).valueOf();

    return res.status(200).json({access_token: token, expires_in});
  });
}

async function registration (req, res, next) {
  passport.authenticate('local-registration', (error, user, message) => {
    if (error) {
      return res.status(500).json({
        title: "Ошибка сервера",
        error: "Internal server error"
      });
    }
    if (message) {
      return res.status(400).json({
        title: message.message,
        error: "invalid credentils"
      });
    }

    const token = jwt.sign({ userId: user._id}, config.jwt_secret_key, {expiresIn: `${token_lifetime} days`});
    const expires_in = DateTime.now().plus({days: token_lifetime}).valueOf();

    return res.status(200).json({access_token: token, expires_in});
  })(req, res, next);
}

async function getOrganizations (req, res) {
  if (!req.headers.authorization) return missingAuthHeader(res);

  const token = req.header('authorization').split(' ')[1];
  const modifyOranizationList = (organizations) => {
    return organizations.map((item) => {
      const {nomenclature} = item;
      item.uploadDate = nomenclature.uploadDate;
      item.productsCount = nomenclature.products.length;
      item.productCategoriesCount = nomenclature.productCategories.length;
      delete item.nomenclature;
      return item;
    });
  };

  jwt.verify(token, config.jwt_secret_key, async (err, decode) => {
    if (err) {
      return res.status(401).json({
        error: "invalid_expiry_token",
        message: "Unauthorized"
      })
    }

    // Token is valid //
    const {organizations} = await User.findById(decode.userId).select('-_id organizations');
    const organizationList = await Organization.find({_id: organizations})
      .select('id logo fullName')
      .populate('nomenclature', '-_id products productCategories uploadDate')
      .lean();
    const editedOrganozationList = modifyOranizationList(organizationList);

    res.json({organizations: editedOrganozationList});
  });
}

async function getOrganizationById (req, res) {
  if (!req.headers.authorization) return missingAuthHeader(res);
  const token = req.header('authorization').split(' ')[1];

  jwt.verify(token, config.jwt_secret_key, async (err, decode) => {
    if (err) return res.status(401).json({
      error: "invalid_expiry_token",
      message: "Unauthorized"
    })

    // Token is valid //
    const id = req.params.id;
    const organization = await Organization.findOne({id}).select('name logo').populate('nomenclature');
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
}

async function getOrganizationOrders (req, res) {
  if (!req.headers.authorization) return missingAuthHeader(res);
  const token = req.header('authorization').split(' ')[1];

  jwt.verify(token, config.jwt_secret_key, async (err, decode) => {
    if (err) return res.status(401).json({
      error: "invalid_expiry_token",
      message: "Unauthorized"
    })

    //Token is valid
    const organizationID = req.params.id;
    const orders = await Order.findOne({organizationID});

    res.json({orders});
  });
}

async function updateNomenclature (req, res) {
  if (!req.headers.authorization) return missingAuthHeader(res);
  const organizationID = req.params.id;
  const token = req.header('authorization').split(' ')[1];

  if (!token || !organizationID) throw new Error("Check req.header on have token or organizatoion ID");
  jwt.verify(token, config.jwt_secret_key, async (err, decode) => {
      if (err) return res.status(401).json({
        error: "invalid_expiry_token",
        message: "Unauthorized"
      })

      // Token is valid //
      const user = await User.findById({_id: decode.userId}).select('name password');
      await serviceAPI.getToken(user.name, user.password);
      const newNomenclature = await serviceAPI.getOnceNomenclatureJSON(organizationID);
      const updateNomenclature = await Nomenclature.findOneAndUpdate({organizationID}, JSON.parse(newNomenclature), {useFindAndModify: false});
      await updateNomenclature.save();
      res.json({status: 'ok'});
  });
}

async function getOrganizationSettings (req, res) {
  if (!req.headers.authorization) return missingAuthHeader(res);
  //const organizationID = req.params.id;
  const token = req.header('authorization').split(' ')[1];

  if (!token) throw new Error("Check req.header on have token");
  jwt.verify(token, config.jwt_secret_key, async (err, decode) => {
    if (err) return res.status(401).json({
      error: "invalid_expiry_token",
      message: "Unauthorized"
    })

    // Token is valid //
    const {site, token} = await User.findById({_id: decode.userId}).select('site token').lean();
    !token
    ? res.json({site})
    : res.json({site, token})
  });
}

async function updateSettigns(req, res, next) {
  if (!req.headers.authorization) return missingAuthHeader(res);
  //const organizationID = req.params.id;
  const {sites} = req.body;
  const token = req.header('authorization').split(' ')[1];

  if (!token) throw new Error("Check req.header on have token");
  jwt.verify(token, config.jwt_secret_key, async (err, decode) => {
    if (err) return res.status(401).json({
      error: "invalid_expiry_token",
      message: "Unauthorized"
    })

    // Token is valid //
    await User.updateOne({_id: decode.userId}, {site: sites});

    res.json({title: 'Данные успешно сохранены'});
  });

  next();
}

module.exports = {
  login,
  registration,
  updateSettigns,
  getOrganizations,
  updateNomenclature,
  getOrganizationById,
  getOrganizationOrders,
  getOrganizationSettings
}
