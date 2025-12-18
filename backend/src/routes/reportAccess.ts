import express, { Request, Response } from 'express'
import ReportAccess from '../models/ReportAccess'
import Report from '../models/Report'
import Appointment from '../models/Appointment'
import User from '../models/User'
import { requireAuth } from '../middleware/auth'

const router = express.Router()

// Grant access to reports for a doctor
router.post('/report-access/grant', requireAuth, async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).userId
    const patientData = (req as any).user
    const { doctorId, appointmentId } = req.body

    if (!doctorId || !appointmentId) {
      return res.status(400).json({ success: false, message: 'Doctor ID and Appointment ID are required' })
    }

    // Verify appointment exists and belongs to this patient and doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patientId,
      doctorId: doctorId,
    })

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    // Check if access record already exists
    let access = await ReportAccess.findOne({
      patientId,
      doctorId,
      appointmentId,
    })

    if (!access) {
      // Create new access record
      access = new ReportAccess({
        patientId,
        patientName: patientData?.name || 'Patient',
        doctorId,
        doctorName: appointment.doctorName,
        appointmentId,
        accessGranted: true,
        grantedAt: new Date(),
      })
    } else {
      // Update existing record
      access.accessGranted = true
      access.grantedAt = new Date()
      access.revokedAt = undefined
    }

    await access.save()
    res.json({ success: true, message: 'Access granted successfully', access })
  } catch (err) {
    console.error('Error granting access:', err)
    res.status(500).json({ success: false, message: 'Failed to grant access' })
  }
})

// Revoke access to reports for a doctor
router.post('/report-access/revoke', requireAuth, async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).userId
    const { doctorId, appointmentId } = req.body

    if (!doctorId || !appointmentId) {
      return res.status(400).json({ success: false, message: 'Doctor ID and Appointment ID are required' })
    }

    const access = await ReportAccess.findOne({
      patientId,
      doctorId,
      appointmentId,
    })

    if (!access) {
      return res.status(404).json({ success: false, message: 'Access record not found' })
    }

    access.accessGranted = false
    access.revokedAt = new Date()
    await access.save()

    res.json({ success: true, message: 'Access revoked successfully' })
  } catch (err) {
    console.error('Error revoking access:', err)
    res.status(500).json({ success: false, message: 'Failed to revoke access' })
  }
})

// Check if doctor has access to patient's reports
router.get('/report-access/check/:patientId/:appointmentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).userId
    const { patientId, appointmentId } = req.params

    const access = await ReportAccess.findOne({
      patientId,
      doctorId,
      appointmentId,
      accessGranted: true,
    })

    res.json({ success: true, hasAccess: !!access })
  } catch (err) {
    console.error('Error checking access:', err)
    res.status(500).json({ success: false, message: 'Failed to check access' })
  }
})

// Doctor: Get patient's reports (with access check)
router.get('/patient-reports/:patientId', requireAuth, async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).userId
    const { patientId } = req.params

    // Check if doctor has any access to this patient's reports
    const access = await ReportAccess.findOne({
      patientId,
      doctorId,
      accessGranted: true,
    })

    if (!access) {
      return res.status(403).json({ success: false, message: 'Access denied to patient reports' })
    }

    // Get patient info
    const patient = await User.findById(patientId).select('name email')

    // Get patient's reports
    const reports = await Report.find({ patientId }).sort({ uploadedAt: -1 })

    res.json({
      success: true,
      patient: {
        _id: patientId,
        name: patient?.name || 'Unknown Patient',
        email: patient?.email || 'unknown@example.com',
      },
      reports,
    })
  } catch (err) {
    console.error('Error fetching patient reports:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch patient reports' })
  }
})

// Doctor: Get patient's reports by appointment (with access check)
router.get('/patient-reports/:patientId/:appointmentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const doctorId = (req as any).userId
    const { patientId, appointmentId } = req.params

    // Verify access
    const access = await ReportAccess.findOne({
      patientId,
      doctorId,
      appointmentId,
      accessGranted: true,
    })

    if (!access) {
      return res.status(403).json({ success: false, message: 'Access denied to patient reports' })
    }

    // Get patient info
    const patient = await User.findById(patientId).select('name email')

    // Get patient's reports
    const reports = await Report.find({ patientId }).sort({ uploadedAt: -1 })

    res.json({
      success: true,
      patient: {
        _id: patientId,
        name: patient?.name || 'Unknown Patient',
        email: patient?.email || 'unknown@example.com',
      },
      reports,
    })
  } catch (err) {
    console.error('Error fetching patient reports:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch patient reports' })
  }
})

// Get access status for a specific appointment
router.get('/report-access/:appointmentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const patientId = (req as any).userId
    const { appointmentId } = req.params

    const access = await ReportAccess.findOne({
      patientId,
      appointmentId,
    })

    res.json({
      success: true,
      access: access || null,
      hasAccess: access?.accessGranted || false,
    })
  } catch (err) {
    console.error('Error fetching access status:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch access status' })
  }
})

export default router
