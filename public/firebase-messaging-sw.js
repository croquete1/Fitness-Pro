// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'BEuqb32wN3ejoAhAQ16k-wVzGUDBXifRD3pZ_n0-jhzS-22_Kyncspp2LxvWs-oayDr7neNEhXJN7w58RJti0b0',
  authDomain: 'fitnesspro-36d8b.firebaseapp.com',
  projectId: 'fitnesspro-36d8b',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdefghijklmnopqrstuvwxyz',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png',
  });
});
