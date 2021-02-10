const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const colors = require('colors');
const mongoose = require('mongoose');
const passport = require('passport');
const history = require('connect-history-api-fallback');

const webApiRouter = require('./api/webApi');
const mobApiRouter = require('./api/mobApi');

const routes = require('./routes');

//CORS Config
const corsOptions = require('./config/CORS');
const localCorsOptions = () => {
  return process.env.NODE_ENV == 'production' ?
    'https://lk.rijet.ru' :
    ['http://192.168.1.25:3000', 'http://localhost:3000'];
}

//Env Config
require('dotenv').config()

//Passport Config
require('./config/passport');

//Service Worker Database
require('./service/ServiceWorker_db');

var app = express();

app.use(logger(':method :url :status - :response-time ms'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//API Routes
app.use('/api/v1', cors(corsOptions), webApiRouter);
app.use('/api/v2', passport.authenticate('http-bearer', { session: false }), mobApiRouter);

//App Routes
console.log(process.env.NODE_ENV)
app.use(localCorsOptions(), routes);

(async () => {
  try {
    await mongoose.connect(`mongodb://admin:kjtj6trenn1@${ process.env.DB_HOST }:${ process.env.DB_PORT }`, {
      ssl: false,
      dbName: process.env.DB_NAME,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }); 
    console.log("Connecting Database is success");
  } catch (error) {
    console.log(error);
  }
})();

module.exports = app;
