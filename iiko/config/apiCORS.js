const User = require('../src/models/userModel');
const Organization = require('../src/models/organizationModel');

const corsOptions = async (req, callback) => {
  const origin = req.header('Origin');
  const user = await User.findOne({site: origin}).select('site contractStatus');
  const options = {
    origin,
    maxAge: 3600,
    methods: ["GET", "POST"]
  };
    // console.log(req.url)
    if (req.url.includes('eventPayment')) return callback(null, true);

    if (req.url == '/nomenclature/' && req.method !== "OPTIONS") {
      if (!req.headers.organization) return callback(new Error('Not allowed req.body'));
      const { _id } = await Organization.findOne({id: req.headers.organization }).select('_id');
      const user = await User.findOne({organizations: _id}).select('site contractStatus');

      user &&
      user.contractStatus &&
      user.site.includes(origin)
      ? callback(null, options)
      : callback(new Error(`Not allowed by CORS from ${origin}`));

      return;
    }

    if (user && user.site.includes(origin)) {
      callback(null, options);
      return;
    } else if(!origin) {
      // callback(null, options);
      callback(new Error(`Not allowed by CORS`));
    } else {
      callback(new Error(`Not allowed by CORS from ${origin}`));
    }
}

module.exports = corsOptions;
