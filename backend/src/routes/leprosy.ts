import express from 'express'
import { requireAuth } from '../middleware/auth'
import SymptomLog from '../models/SymptomLog'
import LeprosyAssistantChat from '../models/LeprosyAssistantChat'

const router = express.Router()

// Log symptoms
router.post('/symptom-log', requireAuth, async (req: any, res: any) => {
  try {
    const { userId, symptoms, notes } = req.body

    if (!userId || !symptoms) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const symptomLog = new SymptomLog({
      userId,
      symptoms,
      notes,
      timestamp: new Date()
    })

    await symptomLog.save()

    res.json({
      success: true,
      message: 'Symptoms logged successfully',
      symptomLog
    })
  } catch (error) {
    console.error('Error logging symptoms:', error)
    res.status(500).json({ error: 'Failed to log symptoms' })
  }
})

// Get symptom history for a user
router.get('/symptom-logs', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId

    const logs = await SymptomLog.find({ userId }).sort({ timestamp: -1 }).limit(30)

    res.json({
      success: true,
      logs
    })
  } catch (error) {
    console.error('Error fetching symptom logs:', error)
    res.status(500).json({ error: 'Failed to fetch symptom logs' })
  }
})

// Get latest symptom log
router.get('/latest-symptom-log', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId

    const latestLog = await SymptomLog.findOne({ userId }).sort({ timestamp: -1 })

    res.json({
      success: true,
      latestLog
    })
  } catch (error) {
    console.error('Error fetching latest symptom log:', error)
    res.status(500).json({ error: 'Failed to fetch latest symptom log' })
  }
})

// AI Chat with leprosy assistant
router.post('/chat/leprosy-assistant', requireAuth, async (req: any, res: any) => {
  try {
    const { message, userId, context } = req.body

    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Find or create chat history
    let chatHistory = await LeprosyAssistantChat.findOne({ userId })

    if (!chatHistory) {
      chatHistory = new LeprosyAssistantChat({
        userId,
        messages: []
      })
    }

    // Add user message to history
    chatHistory.messages.push({
      text: message,
      sender: 'user',
      timestamp: new Date()
    })

    // Generate assistant response based on keywords and context
    const reply = generateAssistantResponse(message)

    // Add assistant message to history
    chatHistory.messages.push({
      text: reply,
      sender: 'assistant',
      timestamp: new Date()
    })

    // Keep only last 100 messages to avoid memory issues
    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100)
    }

    await chatHistory.save()

    res.json({
      success: true,
      reply,
      context
    })
  } catch (error) {
    console.error('Error in leprosy assistant chat:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

// Get chat history
router.get('/chat-history', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId

    const chatHistory = await LeprosyAssistantChat.findOne({ userId })

    res.json({
      success: true,
      messages: chatHistory?.messages || []
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    res.status(500).json({ error: 'Failed to fetch chat history' })
  }
})

// Clear chat history (optional - for user privacy)
router.delete('/chat-history', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId

    await LeprosyAssistantChat.findOneAndDelete({ userId })

    res.json({
      success: true,
      message: 'Chat history cleared'
    })
  } catch (error) {
    console.error('Error clearing chat history:', error)
    res.status(500).json({ error: 'Failed to clear chat history' })
  }
})

// Generate assistant response based on message content
function generateAssistantResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Treatment and medication responses
  if (
    lowerMessage.includes('medication') ||
    lowerMessage.includes('medicine') ||
    lowerMessage.includes('mdt') ||
    lowerMessage.includes('drug')
  ) {
    const responses = [
      'Medication adherence is critical for leprosy treatment. Take your MDT (Multi-Drug Therapy) medications exactly as prescribed, typically for 6-12 months depending on classification. Set daily reminders to avoid missing doses. If you experience side effects, report them to your healthcare provider immediately—do not stop medication on your own.',
      'Your MDT regimen is designed specifically for your type of leprosy. Never skip doses or stop early, even if you feel better. Regular adherence prevents drug resistance and ensures complete cure. Keep a medication log and set phone alarms for each dose.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Skin monitoring responses
  if (
    lowerMessage.includes('skin') ||
    lowerMessage.includes('patch') ||
    lowerMessage.includes('lesion') ||
    lowerMessage.includes('spot')
  ) {
    const responses = [
      'Monitor your skin regularly for changes in existing patches or new lesions. Document any changes with photos and notes. Report new patches immediately to your healthcare provider. Check for loss of sensation in affected areas using temperature and touch tests.',
      'Skin examination is crucial. Check for: (1) New patches appearing, (2) Color changes in existing areas, (3) Size changes, (4) Sensation loss (use ice/warm water to test). Keep a log with dates and photos to share with your doctor.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Nerve-related responses
  if (
    lowerMessage.includes('nerve') ||
    lowerMessage.includes('sensation') ||
    lowerMessage.includes('numbness') ||
    lowerMessage.includes('weakness')
  ) {
    const responses = [
      'Nerve involvement is a key feature of leprosy. Perform daily sensation checks on affected areas—test with light touch, temperature, and pin prick. Exercise regularly to maintain nerve function. Report any new numbness, weakness, or pain to your doctor immediately.',
      'Nerve damage from leprosy can be prevented with early treatment and monitoring. Do sensation tests (hot/cold/touch) on affected areas daily. Perform hand and foot exercises. Use protective gear if needed. Report changes within 24 hours to your healthcare provider.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Cure and prognosis responses
  if (
    lowerMessage.includes('cure') ||
    lowerMessage.includes('curable') ||
    lowerMessage.includes('recovery') ||
    lowerMessage.includes('prognosis')
  ) {
    const responses = [
      'Leprosy is curable with appropriate treatment. With MDT, most patients become non-infectious after the first dose and can be functionally cured within 6-12 months. Complete treatment is essential to prevent relapse and complications. Continue follow-up care after treatment completion.',
      'Yes, leprosy is curable! Modern MDT has excellent success rates. You become non-infectious within weeks of starting treatment. With consistent medication and proper self-care, complete recovery is achievable. Follow-up appointments are important even after treatment ends.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Contagiousness responses
  if (
    lowerMessage.includes('contagious') ||
    lowerMessage.includes('spread') ||
    lowerMessage.includes('transmit') ||
    lowerMessage.includes('infectious')
  ) {
    const responses = [
      'Untreated leprosy is mildly contagious through respiratory droplets. However, you become non-infectious within weeks of starting MDT treatment. People in close contact should be monitored but risk is low. Once treated, you pose minimal risk to others.',
      'Leprosy transmission is limited and mainly requires close, prolonged contact. With treatment, you become non-infectious quickly. Family members don\'t automatically develop leprosy—most have natural immunity. Regular monitoring of contacts is standard practice.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Eye care responses
  if (
    lowerMessage.includes('eye') ||
    lowerMessage.includes('vision') ||
    lowerMessage.includes('sight') ||
    lowerMessage.includes('eyebrow')
  ) {
    const responses = [
      'If leprosy affects your eyes, extra care is needed. Wear protective glasses, use lubricating drops, perform blinking exercises, and avoid eye strain. Report any redness, pain, or vision changes immediately. Monthly eye check-ups are important during treatment.',
      'Eye involvement in leprosy requires special attention. Symptoms include eyebrow/eyelash loss, dry eyes, and reduced sensation. Use protective eyewear, keep eyes moist, and see an eye specialist. Regular monitoring prevents complications.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Diet and nutrition responses
  if (
    lowerMessage.includes('diet') ||
    lowerMessage.includes('food') ||
    lowerMessage.includes('nutrition') ||
    lowerMessage.includes('eat')
  ) {
    const responses = [
      'Proper nutrition supports healing and immune function. Focus on: (1) Protein-rich foods for skin repair, (2) Fruits and vegetables for vitamins, (3) Adequate hydration, (4) Whole grains, (5) Healthy fats. Avoid excessive processed foods and sugar. Consult a nutritionist if needed.',
      'Eat a balanced diet to support your body during treatment. Include: lean meats/legumes (protein), colorful vegetables, whole grains, fruits, and adequate water. Avoid smoking and excessive alcohol. Good nutrition strengthens your immune system.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Exercise and physical activity responses
  if (
    lowerMessage.includes('exercise') ||
    lowerMessage.includes('activity') ||
    lowerMessage.includes('sport') ||
    lowerMessage.includes('physical')
  ) {
    const responses = [
      'Light to moderate exercise is beneficial during leprosy treatment. Start with gentle activities like walking and stretching. Avoid high-impact sports that might injure affected areas. Gradually increase intensity as tolerated. Always protect vulnerable areas from injury.',
      'Regular, gentle exercise helps maintain nerve and muscle function. Safe activities include: walking, swimming, yoga, stretching, and light strength training. Avoid contact sports and activities that risk injury to affected limbs. Consult your doctor about appropriate activities.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Doctor visits and appointments responses
  if (
    lowerMessage.includes('doctor') ||
    lowerMessage.includes('appointment') ||
    lowerMessage.includes('visit') ||
    lowerMessage.includes('checkup')
  ) {
    const responses = [
      'Regular doctor visits are essential during leprosy treatment. Initially, monthly appointments are common. Always keep scheduled visits and report any new symptoms immediately. Bring documentation of symptoms and medication adherence. Ask about your treatment progress and when you\'ll become non-infectious.',
      'Don\'t miss your healthcare appointments. Bring notes on: new symptoms, medication side effects, sensation changes, and concerns. Discuss your treatment plan openly. Ask questions about your condition and recovery timeline. Regular monitoring ensures optimal treatment outcomes.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Complications responses
  if (
    lowerMessage.includes('complication') ||
    lowerMessage.includes('reaction') ||
    lowerMessage.includes('reaction type')
  ) {
    const responses = [
      'Leprosy can have reactions (Type 1 and Type 2) that require medical attention. Signs include: sudden inflammation, new lesions, nerve swelling, fever, and skin pain. Report these immediately. Proper treatment prevents permanent damage. Stay vigilant and don\'t ignore warning signs.',
      'Some patients experience leprosy reactions during or after treatment. These are treatable but need prompt medical attention. Watch for: rapid changes in lesions, severe inflammation, new patches, or nerve pain. Contact your doctor immediately if you notice these symptoms.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Daily care responses
  if (
    lowerMessage.includes('daily') ||
    lowerMessage.includes('routine') ||
    lowerMessage.includes('care') ||
    lowerMessage.includes('hygiene')
  ) {
    const responses = [
      'Daily care includes: (1) Gentle skin cleansing, (2) Applying medications, (3) Sensation checks, (4) Moisturizing, (5) Protecting from sun, (6) Taking medications on time, (7) Documenting any changes. Consistency is key to successful treatment.',
      'Your daily routine should include: morning medications, gentle cleansing, moisturizing affected areas, sensation tests, evening medications, and checking for new symptoms. Keep a journal to track your progress and share with your healthcare provider.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Default helpful response
  const defaultResponses = [
    'Thank you for your question. This is important information for your leprosy management. I recommend discussing this with your healthcare provider during your next appointment for personalized medical advice.',
    'That\'s a good question related to your leprosy care. Ensure you\'re following your treatment plan, taking medications as prescribed, and keeping regular doctor appointments. Feel free to ask more specific questions.',
    'Your health and recovery are our priorities. Remember to stay consistent with your medication schedule, monitor your symptoms, and maintain regular contact with your healthcare team. What else can I help you with?'
  ]
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export default router
