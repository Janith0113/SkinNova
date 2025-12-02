import { Router, Request, Response } from 'express'
import FollowRequest from '../models/FollowRequest'
import User from '../models/User'

const router = Router()

// Patient sends a follow request to a doctor
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId } = req.body

    if (!patientId || !doctorId) {
      return res.status(400).json({ error: 'Patient ID and Doctor ID are required' })
    }

    // Check if follow request already exists
    const existingRequest = await FollowRequest.findOne({ patientId, doctorId })
    if (existingRequest) {
      return res.status(400).json({ error: 'Follow request already exists' })
    }

    // Get patient and doctor info
    const patient = await User.findById(patientId)
    const doctor = await User.findById(doctorId)

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or doctor not found' })
    }

    // Create follow request
    const followRequest = new FollowRequest({
      patientId,
      doctorId,
      patientName: patient.name,
      patientEmail: patient.email,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      status: 'pending'
    })

    await followRequest.save()

    res.status(201).json({
      message: 'Follow request sent successfully',
      followRequest
    })
  } catch (err) {
    console.error('Error sending follow request:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to send follow request' })
  }
})

// Get follow requests for a doctor
router.get('/doctor/:doctorId', async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params

    const requests = await FollowRequest.find({ doctorId }).sort({ createdAt: -1 })

    res.json({
      requests,
      total: requests.length
    })
  } catch (err) {
    console.error('Error fetching follow requests:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch follow requests' })
  }
})

// Get follow requests sent by a patient
router.get('/patient/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params

    const requests = await FollowRequest.find({ patientId }).sort({ createdAt: -1 })

    res.json({
      requests,
      total: requests.length
    })
  } catch (err) {
    console.error('Error fetching follow requests:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch follow requests' })
  }
})

// Doctor accepts a follow request
router.put('/accept/:followRequestId', async (req: Request, res: Response) => {
  try {
    const { followRequestId } = req.params

    const followRequest = await FollowRequest.findByIdAndUpdate(
      followRequestId,
      { status: 'accepted', updatedAt: new Date() },
      { new: true }
    )

    if (!followRequest) {
      return res.status(404).json({ error: 'Follow request not found' })
    }

    res.json({
      message: 'Follow request accepted',
      followRequest
    })
  } catch (err) {
    console.error('Error accepting follow request:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to accept follow request' })
  }
})

// Doctor rejects a follow request
router.put('/reject/:followRequestId', async (req: Request, res: Response) => {
  try {
    const { followRequestId } = req.params

    const followRequest = await FollowRequest.findByIdAndUpdate(
      followRequestId,
      { status: 'rejected', updatedAt: new Date() },
      { new: true }
    )

    if (!followRequest) {
      return res.status(404).json({ error: 'Follow request not found' })
    }

    res.json({
      message: 'Follow request rejected',
      followRequest
    })
  } catch (err) {
    console.error('Error rejecting follow request:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to reject follow request' })
  }
})

// Patient unfollows a doctor (delete accepted follow request)
router.delete('/reject/:patientId/:doctorId', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId } = req.params

    const followRequest = await FollowRequest.findOneAndDelete({
      patientId,
      doctorId,
      status: 'accepted'
    })

    if (!followRequest) {
      return res.status(404).json({ error: 'Follow request not found' })
    }

    res.json({
      message: 'Unfollowed successfully',
      followRequest
    })
  } catch (err) {
    console.error('Error unfollowing doctor:', err)
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to unfollow doctor' })
  }
})

export default router
