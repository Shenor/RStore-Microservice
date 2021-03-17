const cors = require('cors')
const logger = require('morgan');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const routes = require('./src/routes');
const config = require('./src/config/config');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CORS
// app.use(cors());

//Logger
app.use(logger('tiny'));

// API Routes
app.use(routes);

// Telegram bot handler
require('./src/telegram');

// Consumer handler
require('./src/consumer');

// Connection Database
(async () => {
  try {
    await mongoose.connect(`mongodb://${config.db_user}:${config.db_password}@${config.db_host}:${config.db_port}`, {
      ssl: false,
      dbName: config.db_name,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Connecting Database at ${config.db_host}:${config.db_port} is success`);
  } catch (error) {console.error(error)};
})();

app.listen(config.port || '3000', () => {
  console.log(`Telegram service listening at http://localhost:${config.port}`)
})
