import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import User from '../models/User'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Configure multer for profile photo uploads
const uploadDir = path.join(__dirname, '../../uploads/profile-photos')
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
    cb(null, `${userId}-profile-${timestamp}${ext}`)
  },
})

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedExtensions.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, WEBP are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for images
})

// Upload profile photo
router.post('/upload-photo', requireAuth, upload.single('profilePhoto'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete old profile photo if exists
    if (user.profilePhoto) {
      const oldPath = path.join(uploadDir, path.basename(user.profilePhoto))
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    // Update user with new profile photo
    user.profilePhoto = req.file.filename
    await user.save()

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: req.file.filename,
      photoUrl: `/uploads/profile-photos/${req.file.filename}`,
    })
  } catch (error) {
    console.error('Error uploading profile photo:', error)

    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    res.status(500).json({ error: 'Failed to upload profile photo' })
  }
})

// Get profile photo
router.get('/photo/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user || !user.profilePhoto) {
      return res.status(404).json({ error: 'Profile photo not found' })
    }

    const filePath = path.join(uploadDir, user.profilePhoto)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.sendFile(filePath)
  } catch (error) {
    console.error('Error retrieving profile photo:', error)
    res.status(500).json({ error: 'Failed to retrieve profile photo' })
  }
})

export default router
