module.exports = function (order) {
  //{payment, orderPrice, createdTime, deliveryPrice, name, phone, discount, cart, adress, selfService}
  const createdTime = new Date().toLocaleString();
  const {
    cart,
    name,
    phone,
    payment,
    discount,
    orderPrice,
    isSelfService,
    deliveryPrice,
  } = order;
  const adress = {
    city: order?.city ?? 'Не указано',
    street: order?.street ?? 'Не указано',
    home: order?.home ?? 'Не указано',
    apartment: order?.apartment ?? 'Не указано',
    comment: order?.comment ?? ''
  }
  const renderOrderList = (items) => {
  let order = '';
  items.forEach(({name, count, price, images}) => {
    const url = images[0] ? images[0].imageUrl : 'https://via.placeholder.com/150';
    order += `
      <tr style="border-collapse:collapse">
        <td align="left" style="Margin:0;padding-top:5px;padding-bottom:10px;padding-left:20px;padding-right:20px">
          <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:178px" valign="top"><![endif]-->
          <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
            <tr style="border-collapse:collapse">
            <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:178px">
              <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
                <td align="center" style="padding:0;Margin:0;font-size:0"><img src="${url}" alt="Item card" class="adapt-img" title="${name}" width="125" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                </tr>
              </table></td>
            </tr>
          </table>
          <!--[if mso]></td><td style="width:20px"></td><td style="width:362px" valign="top"><![endif]-->
          <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
            <tr style="border-collapse:collapse">
            <td align="left" style="padding:0;Margin:0;width:362px">
              <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                <tr style="border-collapse:collapse">
                <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p>
                  <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation">
                    <tr style="border-collapse:collapse">
                    <td style="padding:0;Margin:0">${name}</td>
                    <td style="padding:0;Margin:0;width:60px;text-align:center">${count}</td>
                    <td style="padding:0;Margin:0;width:100px;text-align:center">${price} p</td>
                    </tr>
                  </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p></td>
                </tr>
              </table></td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]--></td>
        </tr> `;
      });
      return order;
  }
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>Новый шаблон 2020-08-12</title>
    <style type="text/css">
  @media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { font-size:20px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-menu td a { font-size:16px!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } }
  #outlook a {
    padding:0;
  }
  .ExternalClass {
    width:100%;
  }
  .ExternalClass,
  .ExternalClass p,
  .ExternalClass span,
  .ExternalClass font,
  .ExternalClass td,
  .ExternalClass div {
    line-height:100%;
  }
  .es-button {
    mso-style-priority:100!important;
    text-decoration:none!important;
  }
  a[x-apple-data-detectors] {
    color:inherit!important;
    text-decoration:none!important;
    font-size:inherit!important;
    font-family:inherit!important;
    font-weight:inherit!important;
    line-height:inherit!important;
  }
  .es-desk-hidden {
    display:none;
    float:left;
    overflow:hidden;
    width:0;
    max-height:0;
    line-height:0;
    mso-hide:all;
  }
  </style>
 </head>
 <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div class="es-wrapper-color" style="background-color:#EFEFEF">
   <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top">
     <tr style="border-collapse:collapse">
      <td valign="top" style="padding:0;Margin:0">
       <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
         <tr style="border-collapse:collapse">
          <td class="es-adaptive" align="center" style="padding:0;Margin:0">
           <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#EFEFEF;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px">
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FEF5E4;width:600px" cellspacing="0" cellpadding="0" bgcolor="#fef5e4" align="center">
             <tr style="border-collapse:collapse">
              <td align="left" bgcolor="#fafaff" style="Margin:0;padding-left:15px;padding-right:15px;padding-top:25px;padding-bottom:25px;background-color:#FAFAFF">
               <table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:570px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;padding-left:15px;font-size:0px"><a href="https://rijet.ru/" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#999999"><img src="https://hvjkrl.stripocdn.email/content/guids/101897dd-9b17-4cef-8e77-a693e87f94a3/images/1081597233698287.png" alt="Rijet logo" title="Rijet logo" width="118" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px">
               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:0px" width="100%" cellspacing="0" cellpadding="0" role="presentation">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:15px"><h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif;font-size:30px;font-style:normal;font-weight:normal;color:#333333">Заявка на заказ!</h1></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:30px">
               <table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;width:560px">
                   <table style="width:100%;border-collapse:separate;border-spacing:0px;border-right:1px solid #EFEFEF;border-left:1px solid #EFEFEF;border-top:1px solid #EFEFEF;border-bottom:1px solid #EFEFEF;background-color:#FEF9EF" widt="100%" cellspacing="0" cellpadding="0" bgcolor="#fef9ef" role="presentation">
                     <tr style="border-collapse:collapse">
                      <td align="left" bgcolor="#fafaff" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><h4 style="Margin:0;line-height:22px;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif;font-size:18px">Иформация о заказе:</h4></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td class="es-m-p0" align="center" bgcolor="#fafaff" style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                       <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="left" role="presentation">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Дата и время:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${createdTime}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Имя:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${name}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Телефон:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${phone}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Способ оплаты:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${
                            payment == "CASH" ? 'Наличными'
                            : payment == "CARD" ? 'Картой онлайн' : 'Картой при получении'
                          }</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="width:200px;padding:0;Margin:0;font-size:14px;line-height:21px">Итого к оплате :</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${orderPrice} ₽</td>
                         </tr>
                       </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p></td>
                     </tr>
                      <tr style="border-collapse:collapse">
                      <td align="left" bgcolor="#fafaff" style="Margin:0;padding-bottom:10px;padding-left:20px;padding-right:20px"><h4 style="Margin:0;line-height:22px;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif;font-size:18px">Адрес в заказе: ${ isSelfService ? '(Самовывоз)':'(Доставка)'}</h4></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td class="es-m-p0" align="center" bgcolor="#fafaff" style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                       <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="left" role="presentation">
                        ${ isSelfService
                        ? ''
                        : `
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Город:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${adress.city}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Улица:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${adress.street}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">Дом:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${adress.home}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="width:200px;padding:0;Margin:0;font-size:14px;line-height:21px">Квартира:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${adress.apartment}</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="width:200px;padding:0;Margin:0;font-size:14px;line-height:21px">Комментарий:</td>
                          <td style="padding:0;Margin:0;font-size:14px;line-height:21px">${adress.comment}</td>
                         </tr>
                        `}
                       </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><br></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
               <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
               <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                 <tr style="border-collapse:collapse">
                  <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:270px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0;padding-left:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">Состав заказа</h4></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
               <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;width:270px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="left" style="padding:0;Margin:0">
                       <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;font-size:13px">Назвние</td>
                          <td style="padding:0;Margin:0;width:60px;font-size:13px;line-height:13px;text-align:center">Кол-во</td>
                          <td style="padding:0;Margin:0;width:100px;font-size:13px;line-height:13px;text-align:center">Цена</td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <!--[if mso]></td></tr></table><![endif]--></td>
             </tr>
             <tr style="border-collapse:collapse">
              <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0">
                       <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFFnone repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
             ${renderOrderList(cart)}
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:5px;padding-left:20px;padding-bottom:30px;padding-right:40px">
               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:540px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="right" style="padding:0;Margin:0">
                       <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:500px" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="right" role="presentation">
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px">Скидка:</td>
                          <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px">${discount} ₽</td>
                         </tr>
                         <tr style="border-collapse:collapse">
                          <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px"><strong>Итого:</strong></td>
                          <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px;color:#000"><strong>${orderPrice + deliveryPrice} ₽</strong></td>
                         </tr>
                       </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#6059F6"><br></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FEF5E4;width:600px">
             <tr style="border-collapse:collapse">
              <td align="left" bgcolor="#fafaff" style="padding:20px;Margin:0;background-color:#FAFAFF">
               <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:178px" valign="top"><![endif]-->
               <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                 <tr style="border-collapse:collapse">
                  <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:178px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0px"><img src="https://hvjkrl.stripocdn.email/content/guids/CABINET_c208d7405f98130b111a532611307df4/images/54791597234414452.png" alt="Rijet logo" title="Rijet logo" width="108" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-top:5px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333"><a target="_blank" href="tel:+7(918)627-55-37" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#333333">+7 (918) 627-55-37</a><br><a href="mailto:sale@rijet.ru" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;text-decoration:underline;color:#333333">sale@rijet.ru</a><br></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <!--[if mso]></td><td style="width:20px"></td><td style="width:362px" valign="top"><![endif]-->
               <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;width:362px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td class="es-m-txt-c" align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Современный сайт доставки для вашего ресторана на масштабируемой платформе</p></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="left" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:12px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;color:#333333"><a target="_blank" href="https://rijet.ru" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:12px;text-decoration:underline;color:#333333;line-height:18px" class="unsubscribe">Rijet.ru</a>&nbsp;</p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table>
               <!--[if mso]></td></tr></table><![endif]--></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
    `;
}
