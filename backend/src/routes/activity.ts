import express from 'express'
import { requireAuth } from '../middleware/auth'
import Activity from '../models/Activity'
import User from '../models/User'
import Appointment from '../models/Appointment'

const router = express.Router()

// Helper function to clean up expired appointment activities
const cleanupExpiredAppointmentActivities = async () => {
  try {
    const now = new Date()
    
    // Find all appointments that have passed
    const expiredAppointments = await Appointment.find({
      $or: [
        { 
          status: 'approved',
          approvedDate: { $lt: now }
        },
        {
          status: 'pending',
          requestedDate: { $lt: now }
        }
      ]
    })
    
    // Get list of expired appointment IDs
    const expiredAppointmentIds = expiredAppointments.map(apt => String(apt._id))
    
    if (expiredAppointmentIds.length > 0) {
      // Remove activities related to expired appointments
      await Activity.deleteMany({
        'metadata.appointmentId': { $in: expiredAppointmentIds },
        action: { $in: ['appointment_scheduled', 'appointment_request_received', 'appointment_approved', 'appointment_rejected'] }
      })
      
      console.log(`Cleaned up ${expiredAppointmentIds.length} expired appointment activities`)
    }
  } catch (err) {
    console.error('Error cleaning up expired appointment activities:', err)
  }
}

// Log an activity
export const logActivity = async (
  userId: string,
  userName: string,
  userEmail: string,
  action: 'user_registration' | 'appointment_scheduled' | 'appointment_request_received' | 'appointment_approved' | 'appointment_rejected' | 'profile_updated' | 'user_verified' | 'password_reset_requested',
  actionTitle: string,
  description?: string,
  metadata?: any
) => {
  try {
    const now = new Date()
    let expiresAt: Date | null = null

    // Set expiration times only for appointment activities
    if (action === 'appointment_scheduled') {
      // Appointment scheduled activities expire 7 days after creation
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (action === 'appointment_approved') {
      // Appointment approved activities expire 30 days after creation
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    const activity = new Activity({
      userId,
      userName,
      userEmail,
      action,
      actionTitle,
      description,
      metadata,
      createdAt: now,
      expiresAt
    })
    await activity.save()
  } catch (err) {
    console.error('Error logging activity:', err)
  }
}

// Get all activities (admin only)
router.get('/activities', requireAuth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view activities' })
    }

    // Clean up expired appointment activities before fetching
    await cleanupExpiredAppointmentActivities()

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(100)

    res.status(200).json({ success: true, activities })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch activities'
    res.status(500).json({ error: errorMsg })
  }
})

// Get activities for a specific user
router.get('/activities/:userId', requireAuth, async (req: any, res: any) => {
  try {
    const { userId } = req.params
    const currentUser = await User.findById(req.userId)

    // Users can only view their own activities, admins can view any
    if (currentUser?.role !== 'admin' && req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Clean up expired appointment activities before fetching
    await cleanupExpiredAppointmentActivities()

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({ success: true, activities })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch activities'
    res.status(500).json({ error: errorMsg })
  }
})

// Delete an activity (admin only)
router.delete('/activities/:activityId', requireAuth, async (req: any, res: any) => {
  try {
    const { activityId } = req.params
    const user = await User.findById(req.userId)

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete activities' })
    }

    const activity = await Activity.findByIdAndDelete(activityId)

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    res.status(200).json({ success: true, message: 'Activity deleted successfully' })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete activity'
    res.status(500).json({ error: errorMsg })
  }
})

export default router
