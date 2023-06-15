const webpush = require('web-push');
const { SUBSCRIPTION } = require("./in-memory-db");
const { actionNotification } = require('./notifications/action-notification');

exports.sendNotification = async (req, res) => {

  const notificationPayload = { notification: actionNotification };
  // Gerando chaves VAPID
  //console.log(webpush.generateVAPIDKeys());
  const vapidKeys = {
    publicKey: 'BLg5XlFaotXLBDWqoWAWzwxEikcdUuHWGrQ2cKhCl1_hVNIN3vZ5iA8-ofqgJSMX98wh3myTXIojUPkSWaFDk_M',
    privateKey: 'gAegrUro5BKLgxtU07aO0NzFq0DFWAWVLFir2eOsNP0'
  };

  // Definindo opções para enviar notificações
  const options = {
    vapidDetails: {
      subject: 'mailto:http://localhost:3000/*',
      ...vapidKeys
    }
  };
  // Enviando notificações para cada assinatura existente
  for (const subscription of SUBSCRIPTION) {
    console.log(subscription);
    try {
      await webpush.sendNotification(subscription, JSON.stringify(notificationPayload), options);
    } catch (error) {
      console.error(error);
    }
  }

  res.status(200).json({message: 'Notificações enviadas!'});
}



/*
const webpush = require('web-push');
const { actionNotification } = require('./notifications/action-notification');
const { subscriptions } = require("./in-memory-db");
const { simplenotification } = require("./notifications/simple-notification");
const { coolNotification } = require("./notifications/cool-notification");

exports.sendNotification = async (req, res) => {
  console.log("2");

  const notificationPayload = { notification: actionNotification };
  console.log("2");
  const pushSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/c3bhYwvJhw4:APA91bGiUoj2CAVSJ8FQViG2-kSWLPBHYI-bkVxkXjTBOW2ReVqO-i72hHPG_w0sagZOIdt9Zcs8h8_cSIvZtEJzRJNOa94yh7bwlK2jfKZl_EC6WvzHVKq2CeZCMT0I_enCFqr_uCrj',
    keys: {
      auth: 'B3MX-0j-u3dpl7BQXloxRA',
      p256dh: 'BMlIJFWeoVp3LFFWM4dkc8doq5DIiZJKCYe4nGqUX1GS0EPQ8eAbleEOg20H-vYHxg2UllzP60jQ_Hp3YITtjZw'
    }
  };

  webpush.sendNotification(
    pushSubscription,
    JSON.stringify(notificationPayload),
    { vapidDetails }
  ).then(res => {
    console.log('Enviado !!');
  }).catch(err => {
    console.log('Error', err);
  })
  // console.log(webpush.generateVAPIDKeys());
  
  //const vapidDetails = {
    //subject: 'https://example.com',
    //publicKey: 'BBl5Vw0PCEM8nbonAjahMaBPAR3MEibrU-zwkXHd0vp_bL4w43ej_K41pLBWOIjCW_3TnotZvskdY_Xmg0Hde3I',
    //privateKey: 'QHznI0Lrhm5c8ByTsuNyuJKZamqo7qSXwuyBfSD7sIs'
  //}

  //for (const subscription of subscriptions) {
    //await webpush.sendNotification(
      //subscription,
      //JSON.stringify(notificationPayload),
      //{ vapidDetails }
    //);
  //}
  
  res.status(200).json({message: 'Notificações enviadas!'});
}

*/