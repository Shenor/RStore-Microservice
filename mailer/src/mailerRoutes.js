const nodemailer = require("nodemailer");

const config = require('./config/config');
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
  transporter.sendMail({
    from: '"Rijet"<order@rijet.ru>',
    to: 'dreik75700000@yandex.ru',
    subject: `Поступил новый заказ ${new Date().toLocaleString()}`,
    html: templateMail(data)
  });
};

module.exports = sendMail;
