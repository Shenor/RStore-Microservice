const Order = require('../../models/orderModel');
const Organization = require('../../models/organizationModel');
const Nomenclature = require('../../models/nomenclatureModel');

async function getNomenclature (req, res) {
  const organizationId = req.params.organizationId ?? null;
  const nomenclature = await Nomenclature.findOne({organizationId}).lean();
  nomenclature
  ? res.json(nomenclature)
  : res.status(404).json({
    status: 'error',
    message: `Nomenclature not found for organization: {${organizationId}}`
  })
}

async function getStopList (req, res) {
  const organizationId = req.params.organizationId ?? null;
  const {stopList} = await Nomenclature.findOne({organizationId}).select('stopList') ?? {};

  stopList && stopList.length
  ? res.json(stopList)
  : res.status(404).json({
      status: 'error',
      message: 'Stop list is empty'
    })
};

async function getWorkTime(req, res) {
  const organizationID = req.params.organizationId ?? null;
  const workTime = await Organization.findOne({id: organizationID}).select('-_id timeFrom timeTo').lean();
  workTime
  ? res.json(workTime)
  : res.status(404).json({
    status: 'error',
    message: 'Work time not set'
  })
};

async function getOrders(req, res) {
  const organizationId = req.params.organizationId ?? null;
  const limit = +req.query?.limit || 1;
  const orders = await Order.find({organizationId}).sort({createdTime: -1}).limit(limit).lean();
  orders
  ? res.json(orders)
  : res.status(404).json({error: 'resource_not_found', message: 'organization orders not found'})
}

module.exports = {
  getOrders,
  getWorkTime,
  getStopList,
  getNomenclature
};
