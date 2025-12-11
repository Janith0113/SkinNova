import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Banner from '../models/Banner';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/banners');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|avi|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// GET all active banners (public)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET all banners including inactive (admin only)
router.get('/all-admin', requireAuth, async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error('Error fetching admin banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPLOAD file (admin only)
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/banners/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// CREATE banner (admin only)
router.post('/create', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      imageUrl,
      link,
      isActive,
      textColor,
      backgroundColor,
      fontSize,
      textStyle,
      alignment,
      overlayOpacity,
    } = req.body;

    if (!title || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and imageUrl are required',
      });
    }

    const banner = new Banner({
      title,
      description,
      imageUrl,
      link: link || '',
      isActive: isActive !== undefined ? isActive : true,
      textColor: textColor || '#FFFFFF',
      backgroundColor: backgroundColor || '#000000',
      fontSize: fontSize || 'medium',
      textStyle: textStyle || 'normal',
      alignment: alignment || 'left',
      overlayOpacity: overlayOpacity !== undefined ? overlayOpacity : 0.4,
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPDATE banner (admin only)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      imageUrl,
      link,
      isActive,
      textColor,
      backgroundColor,
      fontSize,
      textStyle,
      alignment,
      overlayOpacity,
    } = req.body;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    if (title) banner.title = title;
    if (description) banner.description = description;
    if (imageUrl) banner.imageUrl = imageUrl;
    if (link !== undefined) banner.link = link;
    if (isActive !== undefined) banner.isActive = isActive;
    if (textColor) banner.textColor = textColor;
    if (backgroundColor) banner.backgroundColor = backgroundColor;
    if (fontSize) banner.fontSize = fontSize;
    if (textStyle) banner.textStyle = textStyle;
    if (alignment) banner.alignment = alignment;
    if (overlayOpacity !== undefined) banner.overlayOpacity = overlayOpacity;

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE banner (admin only)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// TOGGLE banner active status (admin only)
router.patch('/:id/toggle', requireAuth, async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: 'Banner status toggled successfully',
      data: banner,
    });
  } catch (error) {
    console.error('Error toggling banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
