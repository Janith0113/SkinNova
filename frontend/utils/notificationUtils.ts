// Service Worker registration and management

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Failed to register Service Worker:', error);
    return null;
  }
};

export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('Service Worker unregistered successfully');
  } catch (error) {
    console.error('Failed to unregister Service Worker:', error);
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications are not supported in this browser.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission;
};

export const sendLocalNotification = (title: string, options: NotificationOptions = {}) => {
  if (!('Notification' in window)) {
    console.log('Notifications are not supported in this browser.');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
    badge: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    ...options
  };

  try {
    if (navigator.serviceWorker.controller) {
      // If Service Worker is registered, use it
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title,
        options: defaultOptions
      });
    } else {
      // Fallback to direct notification
      new Notification(title, defaultOptions);
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

export const listenForNotificationMessages = (callback: (data: any) => void) => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MARK_MEDICATION_COMPLETED') {
      callback(event.data);
    }
  });
};

export const scheduleNotification = (
  title: string,
  delayMs: number,
  options: NotificationOptions = {}
) => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  setTimeout(() => {
    sendLocalNotification(title, options);
  }, delayMs);
};

// Check if current browser supports all necessary APIs
export const checkNotificationSupport = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    notification: 'Notification' in window,
    vibration: 'vibrate' in navigator,
    backgroundSync: 'SyncManager' in window
  };
};

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  requestNotificationPermission,
  sendLocalNotification,
  listenForNotificationMessages,
  scheduleNotification,
  checkNotificationSupport
};
