import express from 'express'
import { requireAuth } from '../middleware/auth'
import DoctorAvailability from '../models/DoctorAvailability'
import User from '../models/User'

const router = express.Router()

// Get current doctor's availability (doctor only) - MUST come before /:doctorId
router.get('/my-availability', requireAuth, async (req: any, res: any) => {
  try {
    const doctorId = req.userId
    const user = await User.findById(doctorId)
    
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can access this' })
    }
    
    // First, get all slots for this doctor
    const allSlots = await DoctorAvailability.find({ doctorId })
    console.log(`All slots for doctor ${doctorId}:`, allSlots);
    
    // Then get only active ones
    const availabilitySlots = await DoctorAvailability.find({ doctorId, isActive: true })
      .sort({ dayOfWeek: 1 })
    
    console.log(`Active slots for doctor ${doctorId}:`, availabilitySlots);
    res.json({ success: true, availabilitySlots })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch availability'
    res.status(500).json({ error: errorMsg })
  }
})

// Get all availability slots for a specific doctor
router.get('/:doctorId', requireAuth, async (req: any, res: any) => {
  try {
    const { doctorId } = req.params
    
    const availabilitySlots = await DoctorAvailability.find({ doctorId, isActive: true })
      .sort({ dayOfWeek: 1 })
    
    res.json({ success: true, availabilitySlots })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch availability'
    res.status(500).json({ error: errorMsg })
  }
})

// Create availability slot (doctor only)
router.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const doctorId = req.userId
    const user = await User.findById(doctorId)
    
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can set availability' })
    }
    
    const { dayOfWeek, startTime, endTime, location } = req.body
    
    console.log(`Creating availability for doctor ${doctorId}:`, { dayOfWeek, startTime, endTime, location });
    
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'Day, start time, and end time required' })
    }
    
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Invalid day of week' })
    }
    
    // Check if slot already exists for this day
    const existingSlot = await DoctorAvailability.findOne({ doctorId, dayOfWeek })
    
    if (existingSlot) {
      // Update existing slot
      existingSlot.startTime = startTime
      existingSlot.endTime = endTime
      existingSlot.isActive = true
      if (location) {
        existingSlot.location = location
      }
      existingSlot.updatedAt = new Date()
      await existingSlot.save()
      
      return res.json({
        success: true,
        message: 'Availability updated',
        availabilitySlot: existingSlot
      })
    }
    
    // Create new slot
    const availabilitySlot = new DoctorAvailability({
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      location: location || undefined,
      isActive: true
    })
    
    await availabilitySlot.save()
    console.log(`Created availability slot:`, availabilitySlot);
    
    // Verify it was saved
    const verifySlot = await DoctorAvailability.findOne({ doctorId, dayOfWeek })
    console.log(`Verified saved slot:`, verifySlot);
    
    res.status(201).json({
      success: true,
      message: 'Availability slot created',
      availabilitySlot
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create availability'
    res.status(500).json({ error: errorMsg })
  }
})

// Update availability slot (doctor only)
router.put('/:slotId', requireAuth, async (req: any, res: any) => {
  try {
    const { slotId } = req.params
    const { startTime, endTime, location } = req.body
    const doctorId = req.userId
    
    const slot = await DoctorAvailability.findById(slotId)
    
    if (!slot) {
      return res.status(404).json({ error: 'Availability slot not found' })
    }
    
    if (slot.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Can only edit own availability' })
    }
    
    slot.startTime = startTime || slot.startTime
    slot.endTime = endTime || slot.endTime
    if (location !== undefined) {
      slot.location = location
    }
    slot.updatedAt = new Date()
    
    await slot.save()
    
    res.json({
      success: true,
      message: 'Availability updated',
      availabilitySlot: slot
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update availability'
    res.status(500).json({ error: errorMsg })
  }
})

// Delete availability slot (doctor only)
router.delete('/:slotId', requireAuth, async (req: any, res: any) => {
  try {
    const { slotId } = req.params
    const doctorId = req.userId
    
    const slot = await DoctorAvailability.findById(slotId)
    
    if (!slot) {
      return res.status(404).json({ error: 'Availability slot not found' })
    }
    
    if (slot.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Can only delete own availability' })
    }
    
    slot.isActive = false
    slot.updatedAt = new Date()
    
    await slot.save()
    
    res.json({
      success: true,
      message: 'Availability slot deleted'
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete availability'
    res.status(500).json({ error: errorMsg })
  }
})

export default router
