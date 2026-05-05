// Client-side medication notification scheduler
// Checks medication times and triggers notifications at the scheduled times

let schedulerInterval: NodeJS.Timeout | null = null;
let lastNotifiedTimes: Set<string> = new Set();

export const startMedicationScheduler = (medicationTimes: string[]) => {
  if (!medicationTimes || medicationTimes.length === 0) {
    console.log('No medication times provided');
    return;
  }

  // Stop existing scheduler if running
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  console.log('Starting medication scheduler with times:', medicationTimes);

  // Check every minute for medication times
  schedulerInterval = setInterval(() => {
    checkAndNotify(medicationTimes);
  }, 60000); // Check every 60 seconds

  // Also check immediately on start
  checkAndNotify(medicationTimes);
};

export const stopMedicationScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    lastNotifiedTimes.clear();
    console.log('Medication scheduler stopped');
  }
};

export const resetMedicationScheduler = (medicationTimes: string[]) => {
  lastNotifiedTimes.clear();
  startMedicationScheduler(medicationTimes);
};

const checkAndNotify = (medicationTimes: string[]) => {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  console.log(`[Scheduler Check] Current time: ${currentTime}`);

  for (const medTime of medicationTimes) {
    // Convert 12-hour format (with AM/PM) to 24-hour format if needed
    let normalizedTime = medTime.trim();
    
    // Handle 12-hour format with AM/PM (e.g., "10:00 AM", "2:30 PM")
    if (medTime.includes('AM') || medTime.includes('PM')) {
      const [timeOnly, period] = medTime.split(' ');
      const [hours, minutes] = timeOnly.split(':');
      let hour24 = parseInt(hours);
      
      if (period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      normalizedTime = `${String(hour24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      // Already in 24-hour format, just ensure proper padding
      const [hours, minutes] = normalizedTime.split(':');
      normalizedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Check if current time matches medication time (within 1-minute window)
    if (normalizedTime === currentTime && !lastNotifiedTimes.has(normalizedTime)) {
      console.log(`[Scheduler] Medication time match! Time: ${normalizedTime}`);
      lastNotifiedTimes.add(normalizedTime);

      // Trigger notification
      showMedicationNotification(medTime, normalizedTime);

      // Clear this time from the set after 2 minutes to allow re-notification tomorrow
      setTimeout(() => {
        lastNotifiedTimes.delete(normalizedTime);
      }, 120000); // 2 minutes
    }
  }
};

const showMedicationNotification = (originalTime: string, normalizedTime: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('Notifications not available or permission not granted');
    return;
  }

  // Format time for display
  let displayTime = originalTime;
  if (!originalTime.includes('AM') && !originalTime.includes('PM')) {
    // Convert 24-hour to 12-hour format for display
    const [hours, minutes] = normalizedTime.split(':');
    const hour24 = parseInt(hours);
    let hour12 = hour24;
    let period = 'AM';
    
    if (hour24 >= 12) {
      period = 'PM';
      if (hour24 > 12) {
        hour12 = hour24 - 12;
      }
    } else if (hour24 === 0) {
      hour12 = 12;
    }
    
    displayTime = `${hour12}:${minutes} ${period}`;
  }

  try {
    // Play notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(() => console.log('Could not play notification sound'));

    // Show notification
    const notification = new Notification('💊 Medication Time!', {
      body: `Time to take your medication at ${displayTime}`,
      icon: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
      badge: '/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png',
      tag: `medication-${normalizedTime}`,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      sound: '/notification-sound.mp3'
    });

    // Log notification for debugging
    console.log(`[Notification] Displayed medication reminder for ${displayTime}`);
  } catch (error) {
    console.error('[Notification] Failed to show notification:', error);
  }
};
