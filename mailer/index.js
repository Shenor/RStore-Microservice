const express = require('express');

const app = express();
const routes = require('./src/routes');
const config = require('./src/config/config');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use(routes);

// Consumer handler
require('./src/consumer');

app.listen(config.mailer_port || '3000', () => {
  console.log(`Mailer service listening at http://localhost:${config.mailer_port}`)
})
