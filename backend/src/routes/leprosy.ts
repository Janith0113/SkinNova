import express from 'express'
import { requireAuth } from '../middleware/auth'
import SymptomLog from '../models/SymptomLog'
import LeprosyAssistantChat from '../models/LeprosyAssistantChat'
import LeprosyUserProfile from '../models/LeprosyUserProfile'

const router = express.Router()

// User Profile Management

// Create or update user profile
router.post('/profile', requireAuth, async (req: any, res: any) => {
  try {
    const { userId, personalInfo, medical, leprosy, lifestyle, goals, notes } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    let profile = await LeprosyUserProfile.findOne({ userId })

    if (profile) {
      // Update existing profile
      profile.personalInfo = { ...profile.personalInfo, ...personalInfo }
      profile.medical = { ...profile.medical, ...medical }
      profile.leprosy = { ...profile.leprosy, ...leprosy }
      profile.lifestyle = { ...profile.lifestyle, ...lifestyle }
      if (goals) profile.goals = goals
      if (notes) profile.notes = notes
    } else {
      // Create new profile
      profile = new LeprosyUserProfile({
        userId,
        personalInfo,
        medical,
        leprosy,
        lifestyle,
        goals,
        notes
      })
    }

    await profile.save()

    res.json({
      success: true,
      message: 'Profile saved successfully',
      profile
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    res.status(500).json({ error: 'Failed to save profile' })
  }
})

// Get user profile
router.get('/profile', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId

    const profile = await LeprosyUserProfile.findOne({ userId })

    res.json({
      success: true,
      profile: profile || null
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Delete user profile
router.delete('/profile', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId

    await LeprosyUserProfile.findOneAndDelete({ userId })

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting profile:', error)
    res.status(500).json({ error: 'Failed to delete profile' })
  }
})

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

    // Fetch user profile for personalized response
    const userProfile = await LeprosyUserProfile.findOne({ userId })

    // Add user message to history
    chatHistory.messages.push({
      text: message,
      sender: 'user',
      timestamp: new Date()
    })

    // Generate assistant response based on keywords, context, and user profile
    const reply = generateAssistantResponse(message, userProfile)

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

// Generate assistant response based on message content and user profile
function generateAssistantResponse(message: string, userProfile: any): string {
  const lowerMessage = message.toLowerCase()
  let personalizationContext = ''

  // Build personalization context from user profile
  if (userProfile) {
    if (userProfile.personalInfo?.age) {
      personalizationContext += ` (Age: ${userProfile.personalInfo.age})`
    }
    if (userProfile.medical?.leprosyType) {
      personalizationContext += ` (Leprosy Type: ${userProfile.medical.leprosyType})`
    }
    if (userProfile.lifestyle?.physicalActivity) {
      personalizationContext += ` (Activity Level: ${userProfile.lifestyle.physicalActivity})`
    }
    if (userProfile.leprosy?.nerveInvolvement) {
      personalizationContext += ' (Has nerve involvement)'
    }
    if (userProfile.leprosy?.eyeInvolvement) {
      personalizationContext += ' (Has eye involvement)'
    }
  }

  // Treatment and medication responses
  if (
    lowerMessage.includes('medication') ||
    lowerMessage.includes('medicine') ||
    lowerMessage.includes('mdt') ||
    lowerMessage.includes('drug')
  ) {
    let responses = [
      'Medication adherence is critical for leprosy treatment. Take your MDT (Multi-Drug Therapy) medications exactly as prescribed, typically for 6-12 months depending on classification. Set daily reminders to avoid missing doses. If you experience side effects, report them to your healthcare provider immediately—do not stop medication on your own.',
      'Your MDT regimen is designed specifically for your type of leprosy. Never skip doses or stop early, even if you feel better. Regular adherence prevents drug resistance and ensures complete cure. Keep a medication log and set phone alarms for each dose.'
    ]

    // Personalize for specific leprosy types
    if (userProfile?.medical?.leprosyType === 'tuberculoid') {
      responses.push('For tuberculoid leprosy, your MDT typically lasts 6 months. Since you have the less severe form, ensure consistent adherence and watch for any changes in sensation or new patches.')
    } else if (userProfile?.medical?.leprosyType === 'lepromatous') {
      responses.push('For lepromatous leprosy, your MDT will be for 12 months. This more severe form requires strict adherence and frequent monitoring. Regular clinic visits are essential.')
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Skin monitoring responses
  if (
    lowerMessage.includes('skin') ||
    lowerMessage.includes('patch') ||
    lowerMessage.includes('lesion') ||
    lowerMessage.includes('spot')
  ) {
    let responses = [
      'Monitor your skin regularly for changes in existing patches or new lesions. Document any changes with photos and notes. Report new patches immediately to your healthcare provider. Check for loss of sensation in affected areas using temperature and touch tests.',
      'Skin examination is crucial. Check for: (1) New patches appearing, (2) Color changes in existing areas, (3) Size changes, (4) Sensation loss (use ice/warm water to test). Keep a log with dates and photos to share with your doctor.'
    ]

    // Personalize if user has known affected areas
    if (userProfile?.leprosy?.affectedAreas && userProfile.leprosy.affectedAreas.length > 0) {
      responses.push(`Pay special attention to your known affected areas: ${userProfile.leprosy.affectedAreas.join(', ')}. Monitor these closely for any changes in size, color, or sensation.`)
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Nerve-related responses
  if (
    lowerMessage.includes('nerve') ||
    lowerMessage.includes('sensation') ||
    lowerMessage.includes('numbness') ||
    lowerMessage.includes('weakness')
  ) {
    let responses = [
      'Nerve involvement is a key feature of leprosy. Perform daily sensation checks on affected areas—test with light touch, temperature, and pin prick. Exercise regularly to maintain nerve function. Report any new numbness, weakness, or pain to your doctor immediately.',
      'Nerve damage from leprosy can be prevented with early treatment and monitoring. Do sensation tests (hot/cold/touch) on affected areas daily. Perform hand and foot exercises. Use protective gear if needed. Report changes within 24 hours to your healthcare provider.'
    ]

    // Personalize if user has confirmed nerve involvement
    if (userProfile?.leprosy?.nerveInvolvement) {
      responses.push('Since you have confirmed nerve involvement, it\'s critical to: (1) Perform daily sensation tests on all affected areas, (2) Do specific nerve exercises prescribed by your doctor, (3) Wear protective gloves/shoes, (4) Avoid activities that risk nerve damage, (5) Report any worsening to your healthcare provider immediately.')
    }

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
    let responses = [
      'If leprosy affects your eyes, extra care is needed. Wear protective glasses, use lubricating drops, perform blinking exercises, and avoid eye strain. Report any redness, pain, or vision changes immediately. Monthly eye check-ups are important during treatment.',
      'Eye involvement in leprosy requires special attention. Symptoms include eyebrow/eyelash loss, dry eyes, and reduced sensation. Use protective eyewear, keep eyes moist, and see an eye specialist. Regular monitoring prevents complications.'
    ]

    // Personalize if user has eye involvement
    if (userProfile?.leprosy?.eyeInvolvement) {
      responses.push('Since you have eye involvement, daily eye care is essential. Use protective glasses during outdoor activities, apply lubricating drops regularly, and report any vision changes immediately to your ophthalmologist.')
    }

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

  // Smoking, alcohol, and lifestyle habits
  if (
    lowerMessage.includes('smoke') ||
    lowerMessage.includes('smoking') ||
    lowerMessage.includes('tobacco') ||
    lowerMessage.includes('alcohol') ||
    lowerMessage.includes('drink')
  ) {
    let responses = [
      'Smoking and alcohol use can slow healing and weaken your immune system during leprosy treatment. Both impact medication effectiveness. If you smoke or drink, discuss cessation strategies with your healthcare provider. Your recovery depends on overall health habits.',
      'Avoid or minimize smoking and alcohol during treatment. These substances: (1) Reduce medication effectiveness, (2) Slow skin healing, (3) Weaken immune response, (4) May interact with MDT drugs. Support programs and replacement therapies are available.'
    ]

    // Personalize if user is a current smoker
    if (userProfile?.lifestyle?.smokingStatus === 'current') {
      responses.push('As a current smoker, quitting is strongly recommended during leprosy treatment. Smoking reduces immune function and healing capacity. Discuss nicotine replacement therapy or smoking cessation programs with your doctor. Your recovery depends on this lifestyle change.')
    } else if (userProfile?.lifestyle?.smokingStatus === 'former') {
      responses.push('Great that you\'ve quit smoking! This supports better healing and immune function during your treatment. Continue avoiding smoking to ensure optimal treatment outcomes.')
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Exercise and physical activity responses
  if (
    lowerMessage.includes('exercise') ||
    lowerMessage.includes('activity') ||
    lowerMessage.includes('sport') ||
    lowerMessage.includes('physical')
  ) {
    let responses = [
      'Light to moderate exercise is beneficial during leprosy treatment. Start with gentle activities like walking and stretching. Avoid high-impact sports that might injure affected areas. Gradually increase intensity as tolerated. Always protect vulnerable areas from injury.',
      'Regular, gentle exercise helps maintain nerve and muscle function. Safe activities include: walking, swimming, yoga, stretching, and light strength training. Avoid contact sports and activities that risk injury to affected limbs. Consult your doctor about appropriate activities.'
    ]

    // Personalize based on current activity level
    if (userProfile?.lifestyle?.physicalActivity) {
      if (userProfile.lifestyle.physicalActivity === 'sedentary') {
        responses.push('Since you have a sedentary lifestyle, start slowly with light activity: 10-minute walks, gentle stretching, or slow yoga. Gradually increase to 30 minutes daily. Movement helps prevent complications and improves healing. Begin with activities that don\'t stress affected areas.')
      } else if (userProfile.lifestyle.physicalActivity === 'vigorous') {
        responses.push('Given your active lifestyle, maintain movement but adapt your routine during treatment. Avoid high-impact activities that risk injury to affected areas. Focus on: low-impact cardio (swimming, cycling), strength training with caution, and protective gear for vulnerable areas.')
      }
    }

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
    let responses = [
      'Leprosy can have reactions (Type 1 and Type 2) that require medical attention. Signs include: sudden inflammation, new lesions, nerve swelling, fever, and skin pain. Report these immediately. Proper treatment prevents permanent damage. Stay vigilant and don\'t ignore warning signs.',
      'Some patients experience leprosy reactions during or after treatment. These are treatable but need prompt medical attention. Watch for: rapid changes in lesions, severe inflammation, new patches, or nerve pain. Contact your doctor immediately if you notice these symptoms.'
    ]

    // Personalize for comorbidities
    if (userProfile?.medical?.comorbidities && userProfile.medical.comorbidities.length > 0) {
      responses.push(`Given your existing conditions (${userProfile.medical.comorbidities.join(', ')}), complications from leprosy may interact differently. Report any symptoms immediately and ensure your doctor knows about all your conditions. Some medications may need adjustment.`)
    }

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
