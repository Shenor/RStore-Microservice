const Organization = require('../../models/organizationModel');
const Nomenclature = require('../../models/nomenclatureModel');

async function getNomenclature (req, res) {
  const organizationID = req.params.organizationId ?? null;
  const nomenclature = await Nomenclature.findOne({organizationID}).lean();
  nomenclature
  ? res.json(nomenclature)
  : res.status(404).json({
    status: 'error',
    message: `Nomenclature not found for organization: {${organizationID}}`
  })
}

async function getStopList (req, res) {
  const organizationID = req.params.organizationID ?? null;
  const {stopList} = await Nomenclature.findOne({organizationID}).select('stopList') ?? {};

  stopList && stopList.length
  ? res.json(stopList)
  : res.status(404).json({
      status: 'error',
      message: 'Stop list is empty'
    })
};

async function getWorkTime(req, res) {
  const organizationID = req.params.organizationID ?? null;
  const workTime = await Organization.findOne({id: organizationID}).select('-_id timeFrom timeTo').lean();
  workTime
  ? res.json(workTime)
  : res.status(404).json({
    status: 'error',
    message: 'Work time not set'
  })
};

module.exports = {
  getWorkTime,
  getStopList,
  getNomenclature
};
