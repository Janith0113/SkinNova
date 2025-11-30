import express from 'express'
import { requireAuth } from '../middleware/auth'
import Appointment from '../models/Appointment'
import User from '../models/User'
import { logActivity } from './activity'
import { sendAppointmentEmail } from '../services/mailService'

const router = express.Router()

// Schedule appointment (admin or patient can schedule)
router.post('/appointments', requireAuth, async (req: any, res: any) => {
  try {
    const { doctorId, requestedDate, reason, patientId } = req.body
    const userId = req.userId
    const user = await User.findById(userId)

    // If patientId is provided (admin scheduling), use that; otherwise use current user
    const actualPatientId = patientId || userId
    const actualPatientUser = patientId && patientId !== userId ? await User.findById(patientId) : null

    if (!doctorId || !requestedDate || !reason) {
      return res.status(400).json({ error: 'Doctor, date, and reason required' })
    }

    const patient = actualPatientUser || await User.findById(actualPatientId)
    const doctor = await User.findById(doctorId)

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or doctor not found' })
    }

    if (doctor.role !== 'doctor') {
      return res.status(400).json({ error: 'Can only schedule with doctors' })
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      patientName: patient.name || patient.email,
      patientEmail: patient.email,
      doctorId,
      doctorName: doctor.name || doctor.email,
      doctorEmail: doctor.email,
      requestedDate: new Date(requestedDate),
      reason,
      status: 'pending',
    })

    await appointment.save()

    // Send email to doctor about pending appointment
    await sendAppointmentEmail(
      doctor.email,
      doctor.name || 'Doctor',
      `New appointment request from ${patient.name || patient.email}`,
      `Requested Date: ${new Date(requestedDate).toLocaleString()}\nReason: ${reason}`
    )

    // Log appointment activity
    await logActivity(
      String(patient._id),
      patient.name || patient.email,
      patient.email,
      'appointment_scheduled',
      'Appointment Scheduled',
      `Appointment requested with Dr. ${doctor.name || doctor.email} on ${new Date(requestedDate).toLocaleString()}`,
      { 
        appointmentId: String(appointment._id),
        patientId: String(patient._id), 
        patientName: patient.name || patient.email, 
        doctorId: String(doctorId), 
        doctorName: doctor.name || doctor.email 
      }
    )

    await logActivity(
      String(doctorId),
      doctor.name || doctor.email,
      doctor.email,
      'appointment_request_received',
      'Appointment Request Received',
      `New appointment request from ${patient.name || patient.email} for ${new Date(requestedDate).toLocaleString()}`,
      { 
        appointmentId: String(appointment._id),
        patientId: String(patient._id), 
        patientName: patient.name || patient.email, 
        doctorId: String(doctorId), 
        doctorName: doctor.name || doctor.email 
      }
    )

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to schedule appointment'
    res.status(500).json({ error: errorMsg })
  }
})

// Get appointments for current user (patient views own, doctor views their appointments)
router.get('/appointments', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    let appointments
    if (user.role === 'doctor') {
      // Doctors see appointments assigned to them
      appointments = await Appointment.find({ doctorId: userId }).sort({ requestedDate: -1 })
    } else {
      // Patients see their own appointments
      appointments = await Appointment.find({ patientId: userId }).sort({ requestedDate: -1 })
    }

    res.json({ success: true, appointments })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch appointments'
    res.status(500).json({ error: errorMsg })
  }
})

// Doctor approves appointment and sets approved date/time
router.put('/appointments/:appointmentId/approve', requireAuth, async (req: any, res: any) => {
  try {
    const { appointmentId } = req.params
    const { approvedDate, notes } = req.body
    const doctorId = req.userId

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' })
    }

    // Verify doctor is the one approving
    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Only assigned doctor can approve' })
    }

    appointment.status = 'approved'
    appointment.approvedDate = new Date(approvedDate)
    appointment.notes = notes || ''
    await appointment.save()

    // Send approval email to patient
    await sendAppointmentEmail(
      appointment.patientEmail,
      appointment.patientName,
      'Appointment Approved',
      `Your appointment with Dr. ${appointment.doctorName} has been approved!\nApproved Time: ${new Date(approvedDate).toLocaleString()}\nNotes: ${notes || 'N/A'}`
    )

    // Log activity
    await logActivity(
      String(doctorId),
      appointment.doctorName,
      appointment.doctorEmail,
      'appointment_approved',
      'Appointment Approved',
      `Approved appointment with ${appointment.patientName} for ${new Date(approvedDate).toLocaleString()}`,
      { 
        appointmentId: String(appointment._id),
        patientId: String(appointment.patientId), 
        patientName: appointment.patientName, 
        doctorId: String(doctorId), 
        doctorName: appointment.doctorName 
      }
    )

    res.json({
      success: true,
      message: 'Appointment approved successfully',
      appointment,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to approve appointment'
    res.status(500).json({ error: errorMsg })
  }
})

// Doctor rejects appointment
router.put('/appointments/:appointmentId/reject', requireAuth, async (req: any, res: any) => {
  try {
    const { appointmentId } = req.params
    const { reason } = req.body
    const doctorId = req.userId

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' })
    }

    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: 'Only assigned doctor can reject' })
    }

    appointment.status = 'rejected'
    appointment.notes = reason || 'No reason provided'
    await appointment.save()

    // Send rejection email to patient
    await sendAppointmentEmail(
      appointment.patientEmail,
      appointment.patientName,
      'Appointment Request Declined',
      `Your appointment request with Dr. ${appointment.doctorName} has been declined.\nReason: ${reason || 'Not specified'}`
    )

    // Log activity
    await logActivity(
      String(doctorId),
      appointment.doctorName,
      appointment.doctorEmail,
      'appointment_rejected',
      'Appointment Rejected',
      `Rejected appointment with ${appointment.patientName}. Reason: ${reason || 'Not specified'}`,
      { 
        appointmentId: String(appointment._id),
        patientId: String(appointment.patientId), 
        patientName: appointment.patientName, 
        doctorId: String(doctorId), 
        doctorName: appointment.doctorName 
      }
    )

    res.json({
      success: true,
      message: 'Appointment rejected',
      appointment,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to reject appointment'
    res.status(500).json({ error: errorMsg })
  }
})

// Get all appointments (admin only)
router.get('/admin/appointments', requireAuth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' })
    }

    const appointments = await Appointment.find().sort({ createdAt: -1 })
    res.json({ success: true, appointments })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch appointments'
    res.status(500).json({ error: errorMsg })
  }
})

export default router
