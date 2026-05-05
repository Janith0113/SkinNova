import MedicationNotification from '../models/MedicationNotification'
import LeprosyUserProfile from '../models/LeprosyUserProfile'
import { sendAppointmentEmail } from './mailService'

// Function to generate medication schedule notifications
export async function generateMedicationNotifications(userId: string) {
  try {
    const profile = await LeprosyUserProfile.findOne({ userId })
    if (!profile) {
      console.log('No profile found for user:', userId)
      return null
    }

    const medicationTimes = profile.schedulingPreferences?.medicationTimes || ['08:00 AM', '06:00 PM']
    const medications = profile.medical?.currentMedications || []
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const notifications = []

    // Generate notifications for each day and medication time
    for (const day of days) {
      for (let idx = 0; idx < medicationTimes.length; idx++) {
        const time = medicationTimes[idx]
        const medication = medications[idx] || `Medication ${idx + 1}`
        
        notifications.push({
          id: `med-${day}-${time}-${idx}`,
          day: day,
          time: time,
          medicationName: medication,
          dosage: `As prescribed by your doctor`,
          isCompleted: false
        })
      }
    }

    // Update or create notification record
    let notifRecord = await MedicationNotification.findOne({ userId })
    
    if (notifRecord) {
      notifRecord.medicationTimes = medicationTimes
      notifRecord.notifications = notifications
    } else {
      notifRecord = new MedicationNotification({
        userId,
        notificationsEnabled: false,
        medicationTimes,
        notifications,
        notificationMethod: 'browser',
        notificationFrequency: '15-min-before',
        allowSound: true,
        allowVibration: true
      })
    }

    await notifRecord.save()
    return notifRecord
  } catch (error) {
    console.error('Error generating medication notifications:', error)
    throw error
  }
}

// Function to enable notifications
export async function enableNotifications(
  userId: string,
  notificationMethod: string = 'browser',
  notificationFrequency: string = '15-min-before'
) {
  try {
    let notifRecord = await MedicationNotification.findOne({ userId })

    if (!notifRecord) {
      // If no notification record exists, generate one
      notifRecord = await generateMedicationNotifications(userId)
    }

    notifRecord.notificationsEnabled = true
    notifRecord.notificationMethod = notificationMethod as any
    notifRecord.notificationFrequency = notificationFrequency as any
    await notifRecord.save()

    return notifRecord
  } catch (error) {
    console.error('Error enabling notifications:', error)
    throw error
  }
}

// Function to disable notifications
export async function disableNotifications(userId: string) {
  try {
    const notifRecord = await MedicationNotification.findOne({ userId })

    if (notifRecord) {
      notifRecord.notificationsEnabled = false
      await notifRecord.save()
    }

    return notifRecord
  } catch (error) {
    console.error('Error disabling notifications:', error)
    throw error
  }
}

// Function to get notification settings for a user
export async function getNotificationSettings(userId: string) {
  try {
    let notifRecord = await MedicationNotification.findOne({ userId })

    if (!notifRecord) {
      // Generate notifications if they don't exist
      notifRecord = await generateMedicationNotifications(userId)
    }

    return notifRecord
  } catch (error) {
    console.error('Error getting notification settings:', error)
    throw error
  }
}

// Function to update notification settings
export async function updateNotificationSettings(
  userId: string,
  settings: {
    notificationMethod?: string
    notificationFrequency?: string
    allowSound?: boolean
    allowVibration?: boolean
  }
) {
  try {
    let notifRecord = await MedicationNotification.findOne({ userId })

    if (!notifRecord) {
      notifRecord = await generateMedicationNotifications(userId)
    }

    if (settings.notificationMethod) {
      notifRecord.notificationMethod = settings.notificationMethod as any
    }
    if (settings.notificationFrequency) {
      notifRecord.notificationFrequency = settings.notificationFrequency as any
    }
    if (settings.allowSound !== undefined) {
      notifRecord.allowSound = settings.allowSound
    }
    if (settings.allowVibration !== undefined) {
      notifRecord.allowVibration = settings.allowVibration
    }

    await notifRecord.save()
    return notifRecord
  } catch (error) {
    console.error('Error updating notification settings:', error)
    throw error
  }
}

// Function to mark medication as completed
export async function markMedicationCompleted(userId: string, notificationId: string) {
  try {
    const notifRecord = await MedicationNotification.findOne({ userId })

    if (notifRecord) {
      const notification = notifRecord.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.isCompleted = true
        notification.completedAt = new Date()
        await notifRecord.save()
      }
    }

    return notifRecord
  } catch (error) {
    console.error('Error marking medication as completed:', error)
    throw error
  }
}

// Function to send notification (for scheduled job)
export async function sendMedicationNotification(
  userId: string,
  notificationId: string,
  title: string,
  message: string,
  userEmail?: string
) {
  try {
    const notifRecord = await MedicationNotification.findOne({ userId })

    if (notifRecord) {
      const notification = notifRecord.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.notificationSent = true
        notification.notificationSentAt = new Date()
        
        // If email notification method is selected, send email
        if (notifRecord.notificationMethod === 'email' && userEmail) {
          await sendAppointmentEmail(
            userEmail,
            'User',
            title,
            message
          )
        }
        
        await notifRecord.save()
      }
    }

    return notifRecord
  } catch (error) {
    console.error('Error sending medication notification:', error)
    throw error
  }
}

// Function to calculate next notification time
export function calculateNextNotificationTime(
  time: string,
  frequency: string
): Date {
  const [timeStr, period] = time.split(' ')
  const [hours, minutes] = timeStr.split(':').map(Number)
  
  let hour = hours
  if (period === 'PM' && hours !== 12) {
    hour += 12
  } else if (period === 'AM' && hours === 12) {
    hour = 0
  }

  const nextNotif = new Date()
  nextNotif.setHours(hour, minutes, 0, 0)

  // Add offset based on frequency
  const offsetMinutes = {
    'on-time': 0,
    '15-min-before': -15,
    '30-min-before': -30,
    '1-hour-before': -60
  }

  nextNotif.setMinutes(nextNotif.getMinutes() + (offsetMinutes[frequency as keyof typeof offsetMinutes] || 0))

  // If time has passed, schedule for tomorrow
  if (nextNotif < new Date()) {
    nextNotif.setDate(nextNotif.getDate() + 1)
  }

  return nextNotif
}

// Function to get today's medication schedule
export async function getTodaysMedicationSchedule(userId: string) {
  try {
    const notifRecord = await MedicationNotification.findOne({ userId })

    if (!notifRecord) {
      return null
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const todayNotifications = notifRecord.notifications.filter(n => n.day === today)

    return {
      date: today,
      medications: todayNotifications,
      totalCount: todayNotifications.length,
      completedCount: todayNotifications.filter(n => n.isCompleted).length
    }
  } catch (error) {
    console.error('Error getting todays medication schedule:', error)
    throw error
  }
}

// Function to get medication statistics
export async function getMedicationStats(userId: string) {
  try {
    const notifRecord = await MedicationNotification.findOne({ userId })

    if (!notifRecord) {
      return null
    }

    const totalMedications = notifRecord.notifications.length
    const completedMedications = notifRecord.notifications.filter(n => n.isCompleted).length
    const missedMedications = notifRecord.notifications.filter(n => n.missedAt).length

    const compliancePercent = totalMedications > 0 ? 
      Math.round((completedMedications / totalMedications) * 100) : 0

    return {
      totalMedications,
      completedMedications,
      missedMedications,
      compliancePercent,
      notificationsEnabled: notifRecord.notificationsEnabled,
      notificationMethod: notifRecord.notificationMethod
    }
  } catch (error) {
    console.error('Error getting medication stats:', error)
    throw error
  }
}

export default {
  generateMedicationNotifications,
  enableNotifications,
  disableNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  markMedicationCompleted,
  sendMedicationNotification,
  calculateNextNotificationTime,
  getTodaysMedicationSchedule,
  getMedicationStats
}
