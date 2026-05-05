// Service Worker for Medication Notifications
// This file handles background notifications and periodic syncing

// Listen for push events (web push notifications)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);

  if (!event.data) {
    console.log('[Service Worker] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'SkinNova - Medication Reminder';
    const options = {
      body: data.body || 'Time to take your medication',
      icon: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
      badge: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
      tag: 'medication-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'mark-taken',
          title: '✓ Mark as Taken',
          icon: '/check-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/dismiss-icon.png'
        }
      ],
      data: {
        notificationId: data.notificationId,
        medicationName: data.medicationName,
        time: data.time
      }
    };

    if (data.sound) {
      options.sound = '/notification-sound.mp3';
    }

    if (data.vibration) {
      options.vibrate = [200, 100, 200];
    }

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('[Service Worker] Error handling push event:', error);
    self.registration.showNotification('SkinNova Medication Reminder', {
      body: 'Time to take your medication',
      icon: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png'
    });
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'mark-taken') {
    // Send message to client to mark medication as taken
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({
            type: 'MARK_MEDICATION_COMPLETED',
            notificationId: event.notification.data.notificationId
          });
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Dismiss notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If there's already a window/tab open with the target URL, focus it.
        for (const client of clientList) {
          if (client.url === '/leprosy/assistant' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab with the target URL.
        if (clients.openWindow) {
          return clients.openWindow('/leprosy/assistant');
        }
      })
    );
  }
});

// Listen for notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, options } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});

// Background sync for medication reminders
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-medication-reminders') {
    event.waitUntil(syncMedicationReminders());
  }
});

// Sync medication reminders with server
async function syncMedicationReminders() {
  try {
    console.log('[Service Worker] Syncing medication reminders...');
    
    // Get current time
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Fetch notification settings from server
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[Service Worker] No auth token found');
      return;
    }

    const response = await fetch('http://localhost:4000/api/leprosy/notifications/schedule', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('[Service Worker] Failed to fetch notifications:', response.statusText);
      return;
    }

    const data = await response.json();
    
    if (!data.schedule || !Array.isArray(data.schedule)) {
      console.log('[Service Worker] No schedule found');
      return;
    }

    // Check for medications that should be reminded now
    const todayMedications = data.schedule.filter((med) => med.day === dayOfWeek);
    
    for (const med of todayMedications) {
      // Check if medication time is near (within 5 minutes)
      if (isTimeNear(med.time, currentTime)) {
        console.log('[Service Worker] Showing notification for:', med.medicationName);
        
        await self.registration.showNotification('SkinNova - Medication Reminder', {
          body: `Time to take ${med.medicationName}`,
          icon: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
          badge: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
          tag: `medication-${med.id}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: {
            notificationId: med.id,
            medicationName: med.medicationName,
            time: med.time
          }
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error syncing medication reminders:', error);
  }
}

// Helper function to check if time is near
function isTimeNear(medicationTime, currentTime, windowMinutes = 5) {
  try {
    const [medHour, medMinute, medPeriod] = medicationTime.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);
    const [currentHour, currentMinute, currentPeriod] = currentTime.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);

    let medHourNum = parseInt(medHour);
    let currentHourNum = parseInt(currentHour);

    // Convert to 24-hour format
    if (medPeriod.toUpperCase() === 'PM' && medHourNum !== 12) {
      medHourNum += 12;
    } else if (medPeriod.toUpperCase() === 'AM' && medHourNum === 12) {
      medHourNum = 0;
    }

    if (currentPeriod.toUpperCase() === 'PM' && currentHourNum !== 12) {
      currentHourNum += 12;
    } else if (currentPeriod.toUpperCase() === 'AM' && currentHourNum === 12) {
      currentHourNum = 0;
    }

    const medTotalMinutes = medHourNum * 60 + parseInt(medMinute);
    const currentTotalMinutes = currentHourNum * 60 + parseInt(currentMinute);

    const diff = Math.abs(medTotalMinutes - currentTotalMinutes);
    return diff <= windowMinutes;
  } catch (error) {
    console.error('[Service Worker] Error comparing times:', error);
    return false;
  }
}

// Activate event to clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep only current cache versions
          if (cacheName !== 'v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

console.log('[Service Worker] Loaded successfully');
