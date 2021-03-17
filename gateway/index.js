const express = require('express');
const httpLogger = require('./src/helpers/create-http-logger');

const logger = require('./src/helpers/create-logger');
const config = require('./config/config');
const routes = require('./src/routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP Logger
app.use(httpLogger)

app.use(routes);

app.listen(config.port || '3000', () => {
  logger.info(`Gateway listening at http://localhost:${config.port || '3000'}`)
})
