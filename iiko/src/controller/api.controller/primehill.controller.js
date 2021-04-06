const HttpClient = require('../../helpers/create-http-client');

const primehillApi = HttpClient({
  baseURL: 'https://cabinet.prime-hill.com/api/v2'
})

async function findByPhone(req, res) {
  const phone = req.params.phone.replace(/[+()-]/g, '')
  try {
    const getClientPH = await primehillApi.get(`/clientInfo?token=${process.env.TOKEN_PRIMEHILL}&type=phone&id=${phone}`)
    const {
      firstName,
      lastName,
      discountPercent
    } = getClientPH.data;

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
