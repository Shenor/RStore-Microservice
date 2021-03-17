const rp = require('request-promise');

async function findByPhone(req, res) {
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
}

module.exports = {
  findByPhone
};
