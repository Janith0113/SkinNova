import express from 'express'
import { requireAuth } from '../middleware/auth'
import Chat from '../models/Chat'
import Appointment from '../models/Appointment'
import User from '../models/User'

const router = express.Router()

// Edit a message in a chat (MUST be before generic :patientId routes)
router.put('/chat/:patientId/:doctorId/message/:messageId', requireAuth, async (req: any, res: any) => {
  try {
    const { patientId, doctorId, messageId } = req.params
    const { content } = req.body
    const requestingUserId = req.userId

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' })
    }

    // Find the chat
    const chat = await Chat.findOne({ patientId, doctorId })

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    // Find the message
    const message = chat.messages.find(msg => msg._id?.toString() === messageId)

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    // Verify the requesting user is the sender
    if (message.senderId !== requestingUserId) {
      return res.status(403).json({ error: 'Unauthorized: Can only edit your own messages' })
    }

    // Update the message
    message.content = content.trim()
    message.isEdited = true
    message.editedAt = new Date()

    chat.updatedAt = new Date()
    await chat.save()

    res.json({ success: true, chat })
  } catch (error) {
    console.error('Error editing message:', error)
    res.status(500).json({ error: 'Failed to edit message' })
  }
})

// Delete a message in a chat (MUST be before generic :patientId routes)
router.delete('/chat/:patientId/:doctorId/message/:messageId', requireAuth, async (req: any, res: any) => {
  try {
    const { patientId, doctorId, messageId } = req.params
    const requestingUserId = req.userId

    console.log('Delete message request:', { patientId, doctorId, messageId, requestingUserId })

    // Find the chat
    const chat = await Chat.findOne({ patientId, doctorId })

    if (!chat) {
      console.log('Chat not found:', { patientId, doctorId })
      return res.status(404).json({ error: 'Chat not found' })
    }

    // Find the message
    const message = chat.messages.find(msg => msg._id?.toString() === messageId)

    console.log('Looking for message:', { messageId, foundMessage: !!message, messageIds: chat.messages.map(m => m._id?.toString()) })

    if (!message) {
      console.log('Message not found:', { messageId })
      return res.status(404).json({ error: 'Message not found' })
    }

    // Verify the requesting user is the sender
    console.log('Comparing IDs:', { messageSenderId: message.senderId, requestingUserId, match: message.senderId === requestingUserId })
    
    if (message.senderId !== requestingUserId) {
      return res.status(403).json({ error: 'Unauthorized: Can only delete your own messages' })
    }

    // Mark message as deleted
    message.isDeleted = true
    message.content = '[Message deleted]'

    chat.updatedAt = new Date()
    await chat.save()

    console.log('Message deleted successfully:', { messageId })
    res.json({ success: true, chat })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Failed to delete message' })
  }
})

// Send a message in a chat (MUST be before generic :patientId routes)
router.post('/chat/:patientId/:doctorId/message', requireAuth, async (req: any, res: any) => {
  try {
    const { patientId, doctorId } = req.params
    const { senderId, senderName, senderRole, content } = req.body
    const requestingUserId = req.userId

    console.log('Message POST request:', { patientId, doctorId, senderId, requestingUserId, content: content?.substring(0, 50) })

    // Verify sender is either patient or doctor in this chat
    if (requestingUserId !== senderId || (senderId !== patientId && senderId !== doctorId)) {
      return res.status(403).json({ error: 'Unauthorized: Cannot send message as this user' })
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' })
    }

    // Check if there's an active appointment between patient and doctor
    const appointment = await Appointment.findOne({
      patientId,
      doctorId,
      status: { $in: ['approved', 'pending', 'completed'] }
    })

    console.log('Appointment check for message:', { appointment: !!appointment })

    if (!appointment) {
      return res.status(403).json({ error: 'No active appointment between patient and doctor' })
    }

    let chat = await Chat.findOne({ patientId, doctorId })

    if (!chat) {
      const patient = await User.findById(patientId)
      const doctor = await User.findById(doctorId)

      if (!patient || !doctor) {
        return res.status(404).json({ error: 'Patient or doctor not found' })
      }

      chat = new Chat({
        patientId,
        doctorId,
        patientName: patient.name || patient.email,
        doctorName: doctor.name || doctor.email,
        messages: []
      })
    }

    // Add message to chat
    chat.messages.push({
      senderId,
      senderName,
      senderRole,
      content: content.trim(),
      timestamp: new Date()
    })

    chat.updatedAt = new Date()
    await chat.save()

    res.json({ success: true, chat })
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Get patients with active appointments for a doctor (MUST be before generic :doctorId routes)
router.get('/chat/doctor/:doctorId/patients', requireAuth, async (req: any, res: any) => {
  try {
    const { doctorId } = req.params
    const requestingUserId = req.userId

    // Verify user is requesting their own patients
    if (doctorId !== requestingUserId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Get all unique patients with active appointments
    const appointments = await Appointment.find({
      doctorId,
      status: { $in: ['approved', 'pending', 'completed'] }
    }).distinct('patientId')

    // Get chats for these patients
    const patientChats = await Chat.find({
      doctorId,
      patientId: { $in: appointments }
    }).sort({ updatedAt: -1 })

    // Enrich with patient details and unread status
    const enrichedChats = await Promise.all(
      patientChats.map(async (chat) => {
        const patient = await User.findById(chat.patientId)
        const lastMessage = chat.messages[chat.messages.length - 1]
        const hasUnreadMessages = lastMessage && lastMessage.senderId !== doctorId

        return {
          ...chat.toObject(),
          patientEmail: patient?.email,
          hasUnreadMessages
        }
      })
    )

    res.json({ patients: enrichedChats })
  } catch (error) {
    console.error('Error fetching patients:', error)
    res.status(500).json({ error: 'Failed to fetch patients' })
  }
})

// Get appointments with chat option for a patient (MUST be before generic :patientId routes)
router.get('/chat/patient/:patientId/appointments-with-chat', requireAuth, async (req: any, res: any) => {
  try {
    const { patientId } = req.params
    const requestingUserId = req.userId

    // Verify user is requesting their own appointments
    if (patientId !== requestingUserId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Get approved appointments
    const appointments = await Appointment.find({
      patientId,
      status: 'approved'
    })

    // Enrich with chat info
    const enrichedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const chat = await Chat.findOne({
          patientId,
          doctorId: apt.doctorId
        })

        const hasMessages = chat && chat.messages.length > 0

        return {
          ...apt.toObject(),
          hasChat: !!chat,
          hasMessages,
          messageCount: chat?.messages.length || 0
        }
      })
    )

    res.json({ appointments: enrichedAppointments })
  } catch (error) {
    console.error('Error fetching appointments with chat:', error)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
})

// Get all chats for a user (patient or doctor)
router.get('/chat/user/:userId', requireAuth, async (req: any, res: any) => {
  try {
    const { userId } = req.params
    const requestingUserId = req.userId

    // Verify user is requesting their own chats
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot access other user chats' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    let chats: any[] = []
    if (user.role === 'patient') {
      // Patient: Get chats with doctors they have appointments with
      chats = await Chat.find({ patientId: userId }).sort({ updatedAt: -1 })
    } else if (user.role === 'doctor') {
      // Doctor: Get chats with patients who have appointments with them
      chats = await Chat.find({ doctorId: userId }).sort({ updatedAt: -1 })
    } else {
      chats = []
    }

    res.json({ chats })
  } catch (error) {
    console.error('Error fetching chats:', error)
    res.status(500).json({ error: 'Failed to fetch chats' })
  }
})

// Get a specific chat between patient and doctor
router.get('/chat/:patientId/:doctorId', requireAuth, async (req: any, res: any) => {
  try {
    const { patientId, doctorId } = req.params
    const requestingUserId = req.userId

    console.log('Chat GET request:', { patientId, doctorId, requestingUserId })

    // Verify user is either the patient or doctor
    if (requestingUserId !== patientId && requestingUserId !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot access this chat' })
    }

    // Check if there's an active appointment between patient and doctor
    const appointment = await Appointment.findOne({
      patientId,
      doctorId,
      status: { $in: ['approved', 'pending', 'completed'] }
    })

    console.log('Appointment check result:', { appointment: !!appointment })

    if (!appointment) {
      return res.status(403).json({ error: 'No active appointment between patient and doctor' })
    }

    let chat = await Chat.findOne({ patientId, doctorId })

    // If no chat exists, create one
    if (!chat) {
      const patient = await User.findById(patientId)
      const doctor = await User.findById(doctorId)

      if (!patient || !doctor) {
        return res.status(404).json({ error: 'Patient or doctor not found' })
      }

      chat = new Chat({
        patientId,
        doctorId,
        patientName: patient.name || patient.email,
        doctorName: doctor.name || doctor.email,
        messages: []
      })

      await chat.save()
      console.log('New chat created:', chat._id)
    }

    console.log('Returning chat with messages:', {
      chatId: chat._id,
      messageCount: chat.messages.length,
      messageIds: chat.messages.map(m => ({ _id: m._id?.toString(), senderId: m.senderId, content: m.content.substring(0, 20) }))
    })

    res.json({ chat })
  } catch (error) {
    console.error('Error fetching chat:', error)
    res.status(500).json({ error: 'Failed to fetch chat' })
  }
})

export default router
