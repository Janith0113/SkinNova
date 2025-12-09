import { Router, Request, Response } from 'express'
import Chat from '../models/Chat'
import User from '../models/User'
import FollowRequest from '../models/FollowRequest'

const router = Router()
// Get chat between patient and doctor 
router.get('/:patientId/:doctorId', async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId } = req.params // Check if follow request was accepted 
        const followRequest = await FollowRequest.findOne({
            patientId,
            doctorId,
            status: 'accepted'
        })

        if (!followRequest) {
            return res.status(403).json({ error: 'Follow request must be accepted before chatting' })
        }

        let chat = await Chat.findOne({ patientId, doctorId })

        if (!chat) { // Create new chat if it doesn't exist 
            const patient = await User.findById(patientId)
            const doctor = await User.findById(doctorId)

            if (!patient || !doctor) {
                return res.status(404).json({ error: 'Patient or doctor not found' })
            }

            chat = new Chat({
                patientId,
                doctorId,
                patientName: patient.name,
                doctorName: doctor.name,
                messages: []
            })

            await chat.save()
        }

        res.json({ chat })
    } catch (err) {
        console.error('Error fetching chat:', err)
        res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch chat' })
    }
})

// Send message in chat 
router.post('/:patientId/:doctorId/message', async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId } = req.params
        const { senderId, senderName, senderRole, content } = req.body

        if (!senderId || !content) {
            return res.status(400).json({ error: 'Sender ID and message content are required' })
        }

        // Check if follow request was accepted 
        const followRequest = await FollowRequest.findOne({ patientId, doctorId, status: 'accepted' })
        if (!followRequest) { return res.status(403).json({ error: 'Follow request must be accepted before messaging' }) }
        let chat = await Chat.findOne({ patientId, doctorId })
        if (!chat) { // Create new chat if it doesn't exist 
            const patient = await User.findById(patientId)
            const doctor = await User.findById(doctorId)

            if (!patient || !doctor) { return res.status(404).json({ error: 'Patient or doctor not found' }) }
            chat = new Chat({ patientId, doctorId, patientName: patient.name, doctorName: doctor.name, messages: [] })
        }

        // Add message 
        chat.messages.push({
            senderId,
            senderName,
            senderRole,
            content,
            timestamp: new Date()
        })

        chat.updatedAt = new Date()

        await chat.save()
        res.status(201).json({ message: 'Message sent successfully', chat })
    }
    catch (err) {
        console.error('Error sending message:', err)
        res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to send message' })
    }
})

// Get all chats for a user (patient or doctor) 
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params // Get chats where user is patient 
        const patientChats = await Chat.find({ patientId: userId }).sort({ updatedAt: -1 }) // Get chats where user is doctor 
        const doctorChats = await Chat.find({ doctorId: userId }).sort({ updatedAt: -1 })
        const allChats = [...patientChats, ...doctorChats]
        allChats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

        res.json({
            chats: allChats,
            total: allChats.length
        })
    }
    catch (err) {
        console.error('Error fetching chats:', err)
        res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch chats' })
    }
})

export default router