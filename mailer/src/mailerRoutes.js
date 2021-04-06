const nodemailer = require("nodemailer");

const config = require('./config/config');
const client = require('./helpers/create-redis');
const logger = require('./helpers/create-logger');
const templateMail = require('./template/iiko_order');

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.mailer_name,
    pass: config.mailer_pass,
  }
});

const sendMail = (data) => {
  const {organizationId} = data;

  client.json_get(organizationId, "isSubscribe", "email", (err, reply) => {
    if (err) return logger.error(`${JSON.stringify(err)}`)

    const json_data = JSON.parse(reply);
    if (!json_data.isSubscribe) return;

    transporter.sendMail({
      from: '"Rijet"<order@rijet.ru>',
      to: json_data.email,
      subject: `Поступил новый заказ ${new Date().toLocaleString()}`,
      html: templateMail(data)
    });
  })
};

module.exports = sendMail;
