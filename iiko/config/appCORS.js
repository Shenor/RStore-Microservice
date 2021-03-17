const appCorsOptions = async (req, callback) => {
  const origin = req.header('Origin');
  console.log(origin)
  if (!origin) return callback(new Error(`Not allowed by CORS`));

  process.env.NODE_ENV === 'production'
  ? callback(null, {origin: 'https://lk.rijet.ru'})
  : callback(null, {origin: ['http://192.168.1.25:3000', 'http://localhost:3000']});
}

module.exports = appCorsOptions;
