module.exports = (order) => {
  const typePayment = new Map([
    ["CASH", "Наличные"],
    ["CARD", "Картой онлайн"],
    ["CARD1", "Картой при получении"]
  ]);

  const transformAddres = () => {
    if (order.isSelfService) return `<b>Адрес</b>: (Самовывоз)`;
    return `
<b>Адрес</b>: (Доставка)
<b>Город</b>: ${order.city}
<b>Улица</b>: ул.${order.street}, д. ${order.home}, кв. ${order.apartment}
  `
  };

  const transformCart = () => {
    let res = ``;
    order.cart.forEach(({name, count, price}, idx) => {
      res += `${idx + 1}) ${name} — кол-во: ${count} — ${price * count} р. \n`;
    });
    return res;
  };

  return `
<b>Заказ № ${order.internal_number}</b>

<b>Дата и время заказа</b>: ${order.created_time}
<b>Имя клиента</b>: ${order.name}
<b>Телефон клиента</b>: ${order.phone}
<b>Тип оплаты</b>: ${typePayment.get(order.payment)}
${transformAddres()}\n
<b>Состав заказа:</b>
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
${transformCart()}
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
<b>Комментарии</b>: ${order.comment}
<b>Сумма</b>: ${order.orderPrice} р.
<b>Доставка</b>: ${order.deliveryPrice} р.
<b>Скидка</b>: ${order.discount} р.
<b>Итого к оплате</b>: ${(order.orderPrice - order.discount) + order.deliveryPrice} р.
  `
}
