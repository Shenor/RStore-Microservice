const path          = require('path');
const express       = require('express');
const mongoose      = require('mongoose');
const cookieParser  = require('cookie-parser');

const logger        = require('./src/helpers/create-logger');
const httpLogger    = require('./src/helpers/create-http-logger');

const config = require('./config/config');
const routes = require('./src/routes/routes');

// console.log(config)

//Service Worker Database
// require('./service/ServiceWorker_db');

// Nats Streaming
require('./src/consumer');

var app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(httpLogger);

app.use(routes);

(async () => {
  try {
    await mongoose.connect(`mongodb://${config.db_user}:${config.db_password}@${config.db_host}:${config.db_port}`, {
      ssl: false,
      dbName: config.db_name,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info("Connecting Database is success");
  } catch (error) {
    logger.error(error);
  }
})();

module.exports = app;
