import express, { Request, Response } from 'express'
import Report from '../models/Report'
import { requireAuth } from '../middleware/auth'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/reports')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const userId = (req as any).userId
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${userId}-${name}-${timestamp}${ext}`)
  },
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  const allowedExts = ['.pdf', '.doc', '.docx']

  const ext = path.extname(file.originalname).toLowerCase()
  if (!allowedMimes.includes(file.mimetype) && !allowedExts.includes(ext)) {
    return cb(new Error('Only PDF and Word documents (.pdf, .doc, .docx) are allowed'))
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
})

// Get all reports for authenticated patient
router.get('/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 })
    res.json({ success: true, reports })
  } catch (err) {
    console.error('Error fetching reports:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch reports' })
  }
})

// Create new report (upload)
router.post('/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const userData = (req as any).user
    const { reportName, reportType, description, fileUrl, fileName } = req.body

    if (!reportName || !reportName.trim()) {
      return res.status(400).json({ success: false, message: 'Report name is required' })
    }

    // Get user data from database if not available in middleware
    let patientName = userData?.name || 'Patient'
    let patientEmail = userData?.email || 'unknown@example.com'

    if (!userData) {
      try {
        const User = require('../models/User').default
        const user = await User.findById(userId).select('name email')
        if (user) {
          patientName = user.name || patientName
          patientEmail = user.email || patientEmail
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }

    const newReport = new Report({
      patientId: userId,
      patientName,
      patientEmail,
      reportName,
      reportType: reportType || 'General Report',
      description: description || '',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      uploadedAt: new Date(),
    })

    await newReport.save()
    res.status(201).json({ success: true, message: 'Report uploaded successfully', report: newReport })
  } catch (err) {
    console.error('Error uploading report:', err)
    res.status(500).json({ success: false, message: 'Failed to upload report', error: err instanceof Error ? err.message : 'Unknown error' })
  }
})

// Get single report
router.get('/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const report = await Report.findOne({ _id: req.params.id, patientId: userId })

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    res.json({ success: true, report })
  } catch (err) {
    console.error('Error fetching report:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch report' })
  }
})

// Update report
router.put('/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { reportName, reportType, description, fileName, fileUrl } = req.body

    const report = await Report.findOne({ _id: req.params.id, patientId: userId })

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    if (reportName) report.reportName = reportName
    if (reportType) report.reportType = reportType
    if (description !== undefined) report.description = description
    if (fileName) report.fileName = fileName
    if (fileUrl) report.fileUrl = fileUrl

    await report.save()
    res.json({ success: true, message: 'Report updated successfully', report })
  } catch (err) {
    console.error('Error updating report:', err)
    res.status(500).json({ success: false, message: 'Failed to update report' })
  }
})

// Delete report
router.delete('/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const report = await Report.findOneAndDelete({ _id: req.params.id, patientId: userId })

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' })
    }

    res.json({ success: true, message: 'Report deleted successfully' })
  } catch (err) {
    console.error('Error deleting report:', err)
    res.status(500).json({ success: false, message: 'Failed to delete report' })
  }
})

// Upload file endpoint
router.post('/reports/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' })
    }

    const fileUrl = `/uploads/reports/${req.file.filename}`
    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl,
      fileName: req.file.originalname,
    })
  } catch (err) {
    console.error('Error uploading file:', err)
    res.status(500).json({ success: false, message: 'Failed to upload file' })
  }
})

export default router
