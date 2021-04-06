const User = require('./models/usersModel');
const httpClient = require('./helpers/create-http-client');
const bot = require('./helpers/create-telegram-bot');
const transformOrder = require('./utils/transform-order');

const api = httpClient({baseURL: 'http://localhost:3000/iiko/api/v1'}, {origin: 'http://localhost:3011'})

bot.use('before', function (ctx) {
  // console.log(ctx.session);
  // console.log(ctx._handler.session);
})

bot.command('start')
  .invoke(function (ctx) {
    ctx.keyboard([
      [{'🔑 Войти в систему': {go: 'auth', isShown: !ctx.session.isAuth}}],
      [{'📝 Заказы': {go: 'orders'}}],
      [{'ℹ Информация': {go: 'info'}}]
    ])
    ctx.data.user = ctx.meta.user;
    return ctx.sendMessage('Здравствуйте <%=user.first_name%>!');
  })

bot.command('auth')
  .invoke(function (ctx) {
     ctx.keyboard([
      [{text: '📞 Отправить номер телеофона', requestContact: true}],
      [{'↩ Назад': {go: '$back'}}]
    ])
    return ctx.sendMessage("Для определения к какой организации вы относитесь, нам необходим ваш номер телефона." +
      "Список номеров имеющих доступ к системе задается в <b><i>lk.rijet</i></b>", {parse_mode: "HTML"});
  })
  .answer(async (ctx) => {
    ctx.keyboard([
      [{text: '📞 Отправить номер телеофона', requestContact: true}],
      [{'↩ Назад': {go: '$back'}}]
    ])

    const contact = ctx.message?.contact;
    const candidate = await User.findOne({phone: contact.phone_number});
    if (!candidate) return ctx.sendMessage('Данный номер не найден. Добавьте его в личном кабинете <b><i>lk.rijet</i></b>', {parse_mode: "HTML"});

    await User.updateOne({phone: contact.phone_number}, {
      chatId: contact.user_id,
      firstName: contact.first_name,
      lastName: contact?.last_name ?? '',
      connectionAt: new Date(),
    })

    ctx.session.isAuth = true;
    ctx.session.organization_id = candidate.organizationID;

    await ctx.sendMessage('Вы успешно авторизованы!');
    await ctx.go('start');
  })

bot.command('orders')
  .invoke(function (ctx) {
    ctx.keyboard([
      [{'🔔 Подписаться': {value: 'subscribe'}}, {'🔕 Отписаться': {value: 'unsubscribe'}}],
      [{'История заказов (посл. 5)': {go: 'history'}}],
      [{'↩ Назад': {go: '$back'}}]
    ])
    return ctx.sendMessage("Вы можете подписаться/отписаться от отправки новых заказов вам в телеграм")
  })
  .answer(async (ctx) => {
    ctx.keyboard([
      [{'🔔 Подписаться': {value: 'subscribe'}}, {'🔕 Отписаться': {value: 'unsubscribe'}}],
      [{'История заказов (посл. 5)': {go: 'history'}}],
      [{'↩ Назад': {go: '$back'}}]
    ])
    if (!ctx.session.isAuth) return ctx.sendMessage("Сначала необходимо авторизоваться!")

    if (ctx.answer == 'subscribe'){
      await User.updateOne({chatId: ctx.meta.chat.id}, {subscribe_new_orders: true})
      return ctx.sendMessage("Вы подписаны на получение новых заказов")
    }
    if (ctx.answer == 'unsubscribe') {
      await User.updateOne({chatId: ctx.meta.chat.id}, {subscribe_new_orders: false})
      return ctx.sendMessage("Вы отписались от получения новых заказов")
    }
  })

bot.command('history')
  .invoke(async (ctx) => {
    ctx.keyboard([
      [{'↩ Назад': {go: '$back'}}]
    ])
    if (!ctx.session.isAuth) return ctx.sendMessage("Сначала необходимо авторизоваться!")
    const res = await api.get(`/organizations/${ctx.session.organization_id}/orders?limit=5`);
    const data = res.data;
    console.log(data);
      // data.forEach(item => {
      //   ctx.sendMessage(transformOrder(item), {parse_mode: "HTML"});
      // })
    return ctx.sendMessage("История заказов")
  })

bot.command('info')
  .invoke(function (ctx) {
    ctx.keyboard([
      [{'↩ Назад': {go: '$back'}}]
    ])
    return ctx.sendMessage("Информация")
  })
