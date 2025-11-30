import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import User from '../models/User'
import { logActivity } from './activity'

const router = Router()

// Get all users (admin only)
router.get('/users', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Get the current user to check if they are admin
    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' })
    }

    // Fetch all users without sensitive data
    const users = await User.find({}, '-password -resetToken -resetTokenExpires').sort({ createdAt: -1 })

    res.json({
      success: true,
      users: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1), // Capitalize role
        createdAt: u.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get single user by ID (admin only)
router.get('/users/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const targetUserId = req.params.id

    // Get the current user to check if they are admin
    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' })
    }

    // Fetch specific user without sensitive data
    const user = await User.findById(targetUserId, '-password -resetToken -resetTokenExpires')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        profile: user.profile,
        verified: user.verified,
        verificationDocuments: user.verificationDocuments,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Update user (admin only)
router.put('/users/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const targetUserId = req.params.id
    const { name, email, role } = req.body

    // Get the current user to check if they are admin
    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' })
    }

    // Validate input
    if (!name && !email && !role) {
      return res.status(400).json({ error: 'At least one field must be provided for update' })
    }

    // Prevent admin from updating their own role
    if (targetUserId === userId && role && role !== currentUser.role) {
      return res.status(400).json({ error: 'Cannot change your own role' })
    }

    // Prepare update object
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role && ['admin', 'doctor', 'patient'].includes(role.toLowerCase())) {
      updateData.role = role.toLowerCase()
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: targetUserId } })
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' })
      }
    }

    // Get the target user to log the activity
    const targetUser = await User.findById(targetUserId)
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(targetUserId, updateData, { new: true }).select('-password -resetToken -resetTokenExpires')

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Log profile update activity
    if (targetUser) {
      await logActivity(
        targetUserId,
        targetUser.name || targetUser.email,
        targetUser.email,
        'profile_updated',
        'Profile updated',
        `Admin updated profile: ${Object.keys(updateData).join(', ')}`
      )
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.charAt(0).toUpperCase() + updatedUser.role.slice(1),
        createdAt: updatedUser.createdAt,
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user (admin only)
router.delete('/users/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const targetUserId = req.params.id

    // Get the current user to check if they are admin
    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' })
    }

    // Prevent admin from deleting themselves
    if (targetUserId === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(targetUserId)

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        _id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
      },
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Verify user (admin only)
router.post('/users/:id/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const targetUserId = req.params.id
    const { verified } = req.body

    const currentUser = await User.findById(userId)
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' })
    }

    const user = await User.findById(targetUserId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update verified status if provided
    if (verified !== undefined) {
      user.verified = verified
      await user.save()

      // Log activity based on verification action
      const actionTitle = verified ? 'Doctor Verified' : 'Doctor Unverified'
      const description = verified 
        ? `${user.name || user.email} was verified by admin` 
        : `${user.name || user.email} verification was revoked by admin`

      await logActivity(
        targetUserId,
        user.name || user.email,
        user.email,
        'user_verified',
        actionTitle,
        description
      )
    } else {
      // Fallback to old profile-based verification for backward compatibility
      if (!user.profile) user.profile = {}
      user.profile.verified = true
      user.profile.verifiedAt = new Date()
      await user.save()

      await logActivity(
        targetUserId,
        user.name || user.email,
        user.email,
        'user_verified',
        'User verified',
        `${user.name || user.email} was verified by admin`
      )
    }

    res.json({
      success: true,
      message: 'User verified successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    })
  } catch (error) {
    console.error('Error verifying user:', error)
    res.status(500).json({ error: 'Failed to verify user' })
  }
})

// Schedule appointment (patients and doctors)
router.post('/appointments', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { doctorId, appointmentDate, reason } = req.body

    if (!doctorId || !appointmentDate) {
      return res.status(400).json({ error: 'Doctor and appointment date required' })
    }

    const patient = await User.findById(userId)
    const doctor = await User.findById(doctorId)

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or doctor not found' })
    }

    // Log appointment scheduling activity for both patient and doctor
    await logActivity(
      userId,
      patient.name || patient.email,
      patient.email,
      'appointment_scheduled',
      'Appointment scheduled',
      `Appointment scheduled with ${doctor.name || doctor.email} on ${appointmentDate}`
    )

    await logActivity(
      doctorId,
      doctor.name || doctor.email,
      doctor.email,
      'appointment_scheduled',
      'Appointment scheduled',
      `Appointment scheduled with ${patient.name || patient.email} on ${appointmentDate}`
    )

    res.json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment: {
        patientId: userId,
        doctorId,
        appointmentDate,
        reason,
        status: 'scheduled',
      },
    })
  } catch (error) {
    console.error('Error scheduling appointment:', error)
    res.status(500).json({ error: 'Failed to schedule appointment' })
  }
})

export default router
