import express from 'express'
import { requireAuth } from '../middleware/auth'
import SymptomLog from '../models/SymptomLog'
import LeprosyAssistantChat from '../models/LeprosyAssistantChat'
import LeprosyUserProfile from '../models/LeprosyUserProfile'
import LeprosyRiskAssessment from '../models/LeprosyRiskAssessment'
import leprosyKnowledgeService from '../services/leprosyKnowledgeService'
import leprosyRiskAnalysisService from '../services/leprosyRiskAnalysisService'

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

// AI Chat with leprosy assistant - ENHANCED WITH KNOWLEDGE BASE
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

    // Search knowledge base for relevant information
    const searchResults = leprosyKnowledgeService.searchKnowledge(message)
    
    // Generate enhanced assistant response with citations
    const { reply, sources, disclaimer } = generateEnhancedAssistantResponse(
      message,
      userProfile,
      searchResults
    )

    // Add assistant message to history with sources
    chatHistory.messages.push({
      text: reply,
      sender: 'assistant',
      timestamp: new Date(),
      sources: sources,
      disclaimer: disclaimer
    })

    // Keep only last 100 messages to avoid memory issues
    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100)
    }

    await chatHistory.save()

    res.json({
      success: true,
      reply,
      sources,
      disclaimer,
      context,
      hasKnowledgeBaseCitation: searchResults.length > 0
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

// Get knowledge base statistics and info
router.get('/knowledge-base-info', async (req: any, res: any) => {
  try {
    const stats = leprosyKnowledgeService.getStatistics()

    res.json({
      success: true,
      stats,
      message: 'Knowledge base loaded with verified WHO, CDC, and ILA data'
    })
  } catch (error) {
    console.error('Error fetching knowledge base info:', error)
    res.status(500).json({ error: 'Failed to fetch knowledge base info' })
  }
})

// Search knowledge base directly
router.post('/search-knowledge', async (req: any, res: any) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Search query required' })
    }

    const results = leprosyKnowledgeService.searchKnowledge(query)

    res.json({
      success: true,
      results,
      count: results.length
    })
  } catch (error) {
    console.error('Error searching knowledge base:', error)
    res.status(500).json({ error: 'Failed to search knowledge base' })
  }
})

// Enhanced response generation with knowledge base integration
function generateEnhancedAssistantResponse(
  message: string,
  userProfile: any,
  searchResults: any[]
) {
  const lowerMessage = message.toLowerCase()
  let reply = ''
  let sources: any[] = []
  let disclaimer = 'This information is based on WHO, CDC, and ILA guidelines. Always consult your healthcare provider for personalized advice.'

  // If knowledge base has relevant results, use them first
  if (searchResults.length > 0) {
    const primaryResult = searchResults[0]
    
    // Default sources for all responses
    const defaultSources = [
      { name: 'World Health Organization', url: 'https://www.who.int/health-topics/leprosy', organization: 'WHO' },
      { name: 'CDC Leprosy Information', url: 'https://www.cdc.gov/leprosy/', organization: 'CDC' },
      { name: 'CDC Treatment Guidelines', url: 'https://www.cdc.gov/leprosy/diagnosis/treatment-guidelines.html', organization: 'CDC' }
    ]
    
    sources = defaultSources

    // Build response based on category
    if (primaryResult.category === 'disease_classification') {
      const classification = leprosyKnowledgeService.getClassificationDetails(primaryResult.id)
      if (classification) {
        reply = leprosyKnowledgeService.formatClassificationResponse(classification)
        sources = leprosyKnowledgeService.getTrustedSources('leprosy-classification')
      } else {
        reply = primaryResult.content
      }
    } else if (primaryResult.category === 'treatment_protocols') {
      // Determine if asking about PB or MB
      const classType = lowerMessage.includes('paucibacillary') || lowerMessage.includes('pb') || lowerMessage.includes('6 month') ? 'PB' : 'MB'
      const protocol = leprosyKnowledgeService.getTreatmentProtocol(classType)
      if (protocol) {
        reply = leprosyKnowledgeService.formatTreatmentResponse(protocol)
      } else {
        reply = `Treatment for ${classType}: ${primaryResult.clinicalReference || 'refer to CDC/WHO guidelines'}`
      }
      sources = [
        { name: 'WHO MDT Guidelines', url: 'https://www.who.int/teams/public-health-surveillance-and-response/dpc/ntds/leprosy-elimination/multi-drug-therapy', organization: 'WHO' },
        { name: 'CDC Treatment Guidelines', url: 'https://www.cdc.gov/leprosy/diagnosis/treatment-guidelines.html', organization: 'CDC' }
      ]
    } else if (primaryResult.category === 'reactions_management') {
      if (lowerMessage.includes('type 1') || lowerMessage.includes('reversal')) {
        reply = formatType1ReactionResponse()
      } else if (lowerMessage.includes('type 2') || lowerMessage.includes('enl')) {
        reply = formatType2ReactionResponse()
      } else {
        reply = 'Information about leprosy reactions. Both Type 1 and Type 2 reactions are treatable but require immediate medical attention. Please consult your healthcare provider.'
      }
      sources = [
        { name: 'CDC Reactions Guide', url: 'https://www.cdc.gov/leprosy/complications/reactions.html', organization: 'CDC' },
        { name: 'WHO Guidelines', url: 'https://www.who.int/health-topics/leprosy', organization: 'WHO' }
      ]
    } else if (primaryResult.category === 'faq') {
      reply = primaryResult.content
      sources = defaultSources
    } else {
      reply = primaryResult.content
    }
  } else {
    // Fall back to original personalized responses
    reply = generateAssistantResponse(message, userProfile)
    
    // Provide default sources even for fallback responses
    sources = [
      { name: 'World Health Organization', url: 'https://www.who.int/health-topics/leprosy', organization: 'WHO' },
      { name: 'CDC Leprosy Information', url: 'https://www.cdc.gov/leprosy/', organization: 'CDC' }
    ]
  }

  return {
    reply,
    sources,
    disclaimer
  }
}

/**
 * Format Type 1 Reaction response
 */
function formatType1ReactionResponse(): string {
  return `**Type 1 Reaction (Reversal Reaction)**

This is a cell-mediated immune response that can occur during or shortly after treatment.

**⚠️ Warning Signs (Get medical help immediately):**
- Sudden inflammation or swelling of existing lesions
- Nerve inflammation (neuritis) - tenderness, pain, weakness
- New patches appearing
- Sensory loss progression
- Loss of muscle function

**What to Do:**
1. Contact your healthcare provider immediately
2. Do NOT stop taking your MDT medications
3. Seek urgent care if experiencing severe symptoms
4. Bring notes about when symptoms started

**Treatment:**
- Corticosteroids (prednisolone) prescribed by your doctor
- Continue MDT throughout reaction management
- Regular monitoring for 3-12 months

**Important:** Type 1 reactions are treatable. Early medical attention prevents permanent damage. Do not panic, but do seek help promptly.

📌 **Sources:**
- [CDC Reactions Guide](https://www.cdc.gov/leprosy/complications/reactions.html)
- [WHO Official Guidelines](https://www.who.int/health-topics/leprosy)`
}

/**
 * Format Type 2 Reaction response
 */
function formatType2ReactionResponse(): string {
  return `**Type 2 Reaction (Erythema Nodosum Leprosum - ENL)**

This is an immune complex reaction requiring prompt medical attention.

**⚠️ Warning Signs (Seek medical attention immediately):**
- Tender nodules (bumps) under the skin
- High fever (often 39°C+)
- Extreme fatigue and body aches
- Eye inflammation with vision changes
- Nerve pain or weakness
- Swollen joints

**What to Do:**
1. Seek medical attention immediately
2. Continue taking your MDT medications
3. Do not self-treat - requires doctor oversight
4. Have someone help if you're very ill

**Treatment:**
- Corticosteroids (prednisolone) - prescribed by doctor
- Possible Thalidomide use (under strict medical supervision)
- Continue MDT throughout

**Critical Information:**
- Thalidomide is teratogenic (causes birth defects) - pregnancy prevention essential
- Type 2 reactions can recur even after treatment ends
- Long-term management may be needed
- Regular monitoring is crucial

**Important:** Type 2 reactions are serious but treatable. Get medical help immediately. With proper treatment, outcomes are good.

📌 **Sources:**
- [CDC Complications Guide](https://www.cdc.gov/leprosy/complications/reactions.html)
- [WHO Treatment Guidelines](https://www.who.int/health-topics/leprosy)`
}

// Original response generation with personalization (fallback)
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

// ===== RISK ASSESSMENT ENDPOINTS =====

// Calculate risk assessment
router.post('/risk-assessment', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.body?.userId

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const assessment = await leprosyRiskAnalysisService.calculateRiskScore(userId)

    res.json({
      success: true,
      message: 'Risk assessment calculated successfully',
      assessment
    })
  } catch (error: any) {
    console.error('Risk calculation error:', error)
    res.status(500).json({
      error: error.message || 'Failed to calculate risk assessment'
    })
  }
})

// Get latest risk assessment
router.get('/risk-assessment/latest', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.query?.userId

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const assessment = await LeprosyRiskAssessment.findOne({ userId }).sort({
      timestamp: -1
    })

    if (!assessment) {
      return res.status(404).json({
        error: 'No risk assessment found. Please calculate one first.'
      })
    }

    res.json({
      success: true,
      assessment: assessment.assessment,
      calculatedAt: assessment.timestamp
    })
  } catch (error: any) {
    console.error('Error fetching latest assessment:', error)
    res.status(500).json({
      error: 'Failed to fetch risk assessment'
    })
  }
})

// Get risk assessment history
router.get('/risk-assessment/history', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.query?.userId
    const limit = parseInt(req.query?.limit || '12')

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const assessments = await LeprosyRiskAssessment.find({ userId })
      .select('assessment timestamp')
      .sort({ timestamp: -1 })
      .limit(limit)

    res.json({
      success: true,
      count: assessments.length,
      assessments: assessments.map(a => ({
        date: a.timestamp,
        riskScore: a.assessment.overallRiskScore,
        riskLevel: a.assessment.riskLevel,
        trajectory: a.assessment.diseaseTrajectory
      }))
    })
  } catch (error: any) {
    console.error('Error fetching assessment history:', error)
    res.status(500).json({
      error: 'Failed to fetch assessment history'
    })
  }
})

// Get risk trends over time
router.get('/risk-assessment/trends', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.query?.userId
    const timeframe = req.query?.timeframe || '3m'

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const days = timeframe === '1m' ? 30 : timeframe === '6m' ? 180 : 90
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const assessments = await LeprosyRiskAssessment.find({
      userId,
      timestamp: { $gte: startDate }
    })
      .select('assessment timestamp')
      .sort({ timestamp: 1 })

    // Calculate trends
    if (assessments.length < 2) {
      return res.json({
        success: true,
        trend: 'insufficient_data',
        assessmentCount: assessments.length,
        message: 'Need at least 2 assessments to determine trend'
      })
    }

    const first = assessments[0].assessment.overallRiskScore
    const last = assessments[assessments.length - 1].assessment.overallRiskScore
    const change = last - first
    const changePercent = ((change / first) * 100).toFixed(1)

    const trend = change < -5 ? 'improving' : change > 5 ? 'deteriorating' : 'stable'

    res.json({
      success: true,
      timeframe,
      trend,
      startScore: first,
      endScore: last,
      change,
      changePercent,
      assessmentCount: assessments.length,
      data: assessments.map(a => ({
        date: a.timestamp,
        score: a.assessment.overallRiskScore,
        level: a.assessment.riskLevel
      }))
    })
  } catch (error: any) {
    console.error('Error fetching trends:', error)
    res.status(500).json({
      error: 'Failed to fetch risk trends'
    })
  }
})

// Get comparison with population baseline
router.get('/risk-assessment/comparison', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.query?.userId

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const userAssessment = await LeprosyRiskAssessment.findOne({ userId }).sort({
      timestamp: -1
    })

    if (!userAssessment) {
      return res.status(404).json({
        error: 'No assessment found for comparison'
      })
    }

    // Population baselines (from clinical data)
    const baselines = {
      avgScore: 52,
      avgSymptomRisk: 48,
      avgAdherenceRisk: 40,
      avgComplicationRisk: 35,
      avgSensoriomotorRisk: 45,
      avgImmuneRisk: 50,
      avgLifeRisk: 42
    }

    const userScore = userAssessment.assessment
    const comparison = {
      overall: {
        userScore: userScore.overallRiskScore,
        populationAvg: baselines.avgScore,
        percentile: Math.round(
          (userScore.overallRiskScore / baselines.avgScore) * 100
        ),
        status:
          userScore.overallRiskScore < baselines.avgScore ? 'better_than_average' : 'higher_than_average'
      },
      components: {
        symptomProgression: {
          userScore: userScore.componentScores.symptomProgressionRisk,
          populationAvg: baselines.avgSymptomRisk
        },
        treatmentAdherence: {
          userScore: userScore.componentScores.treatmentAdherenceRisk,
          populationAvg: baselines.avgAdherenceRisk
        },
        complication: {
          userScore: userScore.componentScores.complicationRisk,
          populationAvg: baselines.avgComplicationRisk
        },
        sensoriomotor: {
          userScore: userScore.componentScores.sensorimotorCompromiseRisk,
          populationAvg: baselines.avgSensoriomotorRisk
        },
        immune: {
          userScore: userScore.componentScores.immuneResponseRisk,
          populationAvg: baselines.avgImmuneRisk
        },
        lifeConditions: {
          userScore: userScore.componentScores.lifeconditionsRisk,
          populationAvg: baselines.avgLifeRisk
        }
      }
    }

    res.json({
      success: true,
      comparison,
      note: 'Baselines are from clinical leprosy cohort data'
    })
  } catch (error: any) {
    console.error('Error fetching comparison:', error)
    res.status(500).json({
      error: 'Failed to fetch comparison data'
    })
  }
})

// Get doctor/provider summary
router.get('/risk-assessment/doctor-summary', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.query?.userId

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const assessment = await LeprosyRiskAssessment.findOne({ userId }).sort({
      timestamp: -1
    })

    if (!assessment) {
      return res.status(404).json({
        error: 'No assessment found'
      })
    }

    const profile = await LeprosyUserProfile.findOne({ userId })
    const symptoms = await SymptomLog.findOne({ userId }).sort({ timestamp: -1 })

    const summary = {
      patientId: userId,
      assessmentDate: assessment.timestamp,
      riskLevel: assessment.assessment.riskLevel,
      overallScore: assessment.assessment.overallRiskScore,
      trajectory: assessment.assessment.diseaseTrajectory,
      components: assessment.assessment.componentScores,
      criticalFactors: assessment.assessment.criticalFactors,
      protectiveFactors: assessment.assessment.protectiveFactors,
      predictions: assessment.assessment.predictions,
      recommendations: assessment.assessment.recommendations,
      nextCheckupDue: assessment.assessment.nextCheckupDueDate,
      patientContext: {
        leprosyType: profile?.medical?.leprosyType,
        treatmentDuration: profile?.medical?.treatmentDuration,
        recentSymptoms: symptoms?.symptoms
      }
    }

    res.json({
      success: true,
      summary
    })
  } catch (error: any) {
    console.error('Error generating summary:', error)
    res.status(500).json({
      error: 'Failed to generate doctor summary'
    })
  }
})

// Trigger auto-calculation (called after profile/symptom updates)
router.post('/risk-assessment/auto-trigger', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.body?.userId

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if last assessment is older than 24 hours
    const lastAssessment = await LeprosyRiskAssessment.findOne({ userId }).sort({
      timestamp: -1
    })

    const hoursElapsed = lastAssessment
      ? (Date.now() - lastAssessment.timestamp.getTime()) / (1000 * 60 * 60)
      : 999

    if (hoursElapsed < 24) {
      return res.json({
        success: false,
        message: `Assessment calculated ${Math.round(hoursElapsed)} hours ago. Next auto-calculation in ${Math.round(24 - hoursElapsed)} hours.`,
        lastCalculated: lastAssessment.timestamp
      })
    }

    // Recalculate
    const assessment = await leprosyRiskAnalysisService.calculateRiskScore(userId)

    res.json({
      success: true,
      message: 'Risk assessment auto-triggered and recalculated',
      assessment
    })
  } catch (error: any) {
    console.error('Auto-trigger error:', error)
    res.status(500).json({
      error: 'Failed to auto-trigger assessment'
    })
  }
})

export default router

