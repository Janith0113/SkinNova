import express, { Request, Response } from 'express'
import { ContactMessage } from '../models/ContactMessage'
import { requireAuth } from '../middleware/auth'
import User from '../models/User'
import { sendContactReplyEmail } from '../services/mailService'

const router = express.Router()

/**
 * POST /api/contact
 * Submit a contact message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, subject, and message are required',
      })
    }

    // Create contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
    })

    await contactMessage.save()

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will respond shortly.',
      data: contactMessage,
    })
  } catch (error) {
    console.error('Error submitting contact message:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit message',
    })
  }
})

/**
 * GET /api/contact
 * Get all contact messages (admin only)
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Get the current user to check if they are admin
    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can access contact messages',
      })
    }

    const { status, sortBy = '-createdAt', limit = '50', page = '1' } = req.query

    // Build filter
    const filter: any = {}
    if (status) filter.status = status

    // Calculate pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Fetch messages
    const messages = await ContactMessage.find(filter)
      .sort(sortBy as string)
      .limit(limitNum)
      .skip(skip)
      .lean()

    // Get total count
    const total = await ContactMessage.countDocuments(filter)

    return res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch messages',
    })
  }
})

/**
 * GET /api/contact/stats
 * Get contact message statistics (admin only)
 */
router.get('/stats/overview', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can access statistics',
      })
    }

    const unreadCount = await ContactMessage.countDocuments({ status: 'unread' })
    const readCount = await ContactMessage.countDocuments({ status: 'read' })
    const repliedCount = await ContactMessage.countDocuments({ status: 'replied' })
    const totalCount = await ContactMessage.countDocuments()

    return res.json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        replied: repliedCount,
      },
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    })
  }
})

/**
 * PATCH /api/contact/:id
 * Update contact message status or add reply (admin only)
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update messages',
      })
    }

    const { id } = req.params
    const { status, reply } = req.body

    // Get the original message to get user info
    const originalMessage = await ContactMessage.findById(id)
    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (reply) {
      updateData.reply = reply
      updateData.repliedBy = currentUser.email
      updateData.repliedAt = new Date()
      updateData.status = 'replied'

      // Send email to user with the reply
      const emailSent = await sendContactReplyEmail(
        originalMessage.email,
        originalMessage.name,
        originalMessage.subject,
        originalMessage.message,
        reply,
        currentUser.email
      )

      if (!emailSent) {
        console.warn(`Warning: Failed to send reply email to ${originalMessage.email}, but reply was saved`)
      }
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(id, updateData, {
      new: true,
    })

    return res.json({
      success: true,
      message: 'Message updated successfully' + (reply && updateData.reply ? ' and reply sent to user email' : ''),
      data: updatedMessage,
    })
  } catch (error) {
    console.error('Error updating message:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update message',
    })
  }
})

/**
 * DELETE /api/contact/:id
 * Delete a contact message (admin only)
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const currentUser = await User.findById(userId)

    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete messages',
      })
    }

    const { id } = req.params

    const deletedMessage = await ContactMessage.findByIdAndDelete(id)

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      })
    }

    return res.json({
      success: true,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message',
    })
  }
})

export default router
