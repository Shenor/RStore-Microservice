const { DateTime } = require('luxon');
const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/usersModel');
const config = require('./config/config');

const token = config.bot_token;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const sharedOptions = {parse_mode: "HTML"};
  const isContact = (msg) => msg?.contact;
  const isValidContact = (msg) => msg.contact.user_id == chatId;

  if (isContact(msg)) {
    console.log(msg)
    if (!isValidContact(msg)) return bot.sendMessage(chatId, 'Вы можете добавить только свой номер телефона!', sharedOptions)

    const { phone_number } = msg.contact;
    const candidate = await User.findOne({phone: phone_number});
    if (!candidate) return bot.sendMessage(chatId, 'Данный номер не найден. Добавьте его в личном кабинете <b><i>lk.rijet</i></b>', sharedOptions);
      await User.updateOne({phone: phone_number}, {
        chatId: msg.contact.user_id,
        firstName: msg.contact.first_name,
        lastName: msg.contact?.last_name ?? '',
        connectionAt: new Date(),
      })
    bot.sendMessage(chatId, 'Вы успешно авторизованы в системе!', sharedOptions)
  }
});

bot.onText(/\/start|↩ Назад/, async (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: JSON.stringify({
      keyboard: [
        ['🔑 Войти в систему'],
        ['📝 Заказы'],
        ['ℹ Информация']
      ],
      resize_keyboard: true
    })
  };

  bot.sendMessage(chatId, 'You send /start command', options);
})

bot.onText(/🔑 Войти в систему/, async (msg) => {
  const chatId = msg.chat.id;
  const options = {
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      keyboard: [
        [{text: '📞 Отправить номер телеофона', request_contact: true}],
        ['↩ Назад']
      ],
      resize_keyboard: true
    })
  }
  console.log(msg)
  bot.sendMessage(chatId, 'Для определения к какой организации вы относитесь, нам необходим ваш номер телефона.' +
  'Список номеров имеющих доступ к системе задается в <b><i>lk.rijet</i></b>', options);
})

bot.onText(/📝 Заказы/, async (msg) => {
  const chatId = msg.chat.id;
  const options = {
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      keyboard: [
        ['🔔 Подписаться', '🔕 Отписаться'],
        ['История заказов (последн. 5)'],
        ['↩ Назад']
      ],
      resize_keyboard: true
    })
  }
  console.log(msg)
  bot.sendMessage(chatId, 'Вы можете подписаться/отписаться от отправки новых заказов вам в телеграм.', options);
})

bot.onText(/🔔 Подписаться|🔕 Отписаться/, async (msg) => {
  const chatId = msg.chat.id;
  const candidate = await User.findOne({chatId});
  if (!candidate) return bot.sendMessage(chatId, 'Сначала необходимо авторизоваться!')

  if (/🔔 Подписаться/.test(msg.text)) {
    await User.updateOne({chatId}, {subscribe_new_orders: true})
    return bot.sendMessage(chatId, 'Вы подписаны на получение новых заказов.')
  }
  if (/🔕 Отписаться/.test(msg.text)) {
    await User.updateOne({chatId}, {subscribe_new_orders: false})
    return bot.sendMessage(chatId, 'Вы отписались от получения новых заказов.')
  }
});

bot.onText(/ℹ Информация/, async (msg) => {
  const chatId = msg.chat.id;
})
