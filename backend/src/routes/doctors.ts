import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import User from '../models/User'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// PUBLIC: Get all doctors (for now showing all, will filter verified later)
router.get('/verified', async (req: Request, res: Response) => {
  try {
    // Get ALL doctors for testing (will show all doctors regardless of verification status)
    const allDoctors = await User.find({ role: 'doctor' }).select('_id name email role verified')
    
    console.log("Fetching doctors. Found total:", allDoctors.length);
    console.log("Doctors:", allDoctors);
    
    // For now return all doctors, later change to filter by verified: true
    res.json({
      success: true,
      doctors: allDoctors,
      count: allDoctors.length,
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    res.status(500).json({ error: 'Failed to fetch doctors' })
  }
})

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

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

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only specific file types
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
  
  const ext = path.extname(file.originalname).toLowerCase()
  
  if (allowedExtensions.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
})

// Upload verification documents
router.post('/upload-documents', requireAuth, upload.array('documents', 5), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user is a doctor
    if (user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can upload verification documents' })
    }

    // Store file names/paths
    const files = req.files as Express.Multer.File[]
    const fileNames = files.map(f => f.filename).join(',')
    
    // Update user with verification documents
    user.verificationDocuments = fileNames
    await user.save()

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      verificationDocuments: fileNames,
      fileCount: files.length,
    })
  } catch (error) {
    console.error('Error uploading documents:', error)
    
    // Clean up uploaded files on error
    if (req.files) {
      const files = req.files as Express.Multer.File[]
      files.forEach(f => {
        const filePath = path.join(uploadDir, f.filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    res.status(500).json({ error: 'Failed to upload documents' })
  }
})

// Get doctor's uploaded documents
router.get('/documents/:doctorId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const doctorId = req.params.doctorId
    const adminUser = await User.findById(userId)

    // Only admin can view other doctor's documents
    if (adminUser?.role !== 'admin' && userId !== doctorId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' })
    }

    const documents = doctor.verificationDocuments ? doctor.verificationDocuments.split(',') : []
    
    res.json({
      success: true,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        verified: doctor.verified,
      },
      documents,
      documentCount: documents.length,
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

// Download a specific document
router.get('/documents/:doctorId/download/:filename', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const doctorId = req.params.doctorId
    const filename = req.params.filename

    const adminUser = await User.findById(userId)

    // Only admin can download other doctor's documents
    if (adminUser?.role !== 'admin' && userId !== doctorId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' })
    }

    // Verify the filename exists in the doctor's documents
    if (!doctor.verificationDocuments?.includes(filename)) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const filePath = path.join(uploadDir, filename)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' })
    }

    res.download(filePath)
  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({ error: 'Failed to download document' })
  }
})

export default router
