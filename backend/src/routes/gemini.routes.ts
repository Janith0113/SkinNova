import { Router, Request, Response } from 'express'
import { analyzeSkinCondition, generateGeminiContent } from '../services/gemini.service'

const router = Router()

// POST /api/gemini/analyze - Analyze skin condition using Gemini
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { description, imageData } = req.body

    if (!description) {
      return res.status(400).json({ error: 'Description is required' })
    }

    const analysis = await analyzeSkinCondition(description, imageData)

    res.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Gemini analysis error:', error)
    res.status(500).json({
      error: 'Failed to analyze skin condition',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/gemini/generate - General content generation
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const content = await generateGeminiContent(prompt)

    res.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error('Gemini generation error:', error)
    res.status(500).json({
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/gemini/tinea-health - Generate Tinea health recommendations
router.post('/tinea-health', async (req: Request, res: Response) => {
  try {
    const { tineaType, confidence, symptoms } = req.body

    if (!tineaType || confidence === undefined) {
      return res.status(400).json({ error: 'Tinea type and confidence are required' })
    }

    const prompt = `You are a medical health advisor. Based on the following information about Tinea infection, provide comprehensive health guidance:

Tinea Type: ${tineaType}
Confidence: ${(confidence * 100).toFixed(1)}%
Additional Symptoms: ${symptoms || 'None reported'}

Please provide:
1. **Health Alert Level**: Rate as Low/Moderate/High based on severity
2. **Current Health Risk**: Explain the immediate health concerns
3. **Treatment Solutions**: Suggest 5-7 practical treatment options
4. **Prevention Methods**: List 6-8 ways to prevent spread and recurrence
5. **Lifestyle Changes**: Recommend 5-6 daily habit changes
6. **When to See Doctor**: List warning signs that require medical attention
7. **Future Prevention**: Suggest long-term strategies to prevent future infections
8. **Recovery Timeline**: Estimate recovery period and milestones

Format your response in clear sections with headers. Be specific and actionable.`

    const recommendations = await generateGeminiContent(prompt)

    res.json({
      success: true,
      recommendations,
      tineaType,
      confidence,
    })
  } catch (error) {
    console.error('Tinea health recommendation error:', error)
    res.status(500).json({
      error: 'Failed to generate health recommendations',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/gemini/tinea-future-prediction - Generate future Tinea health risk and solutions based on birth details
router.post('/tinea-future-prediction', async (req: Request, res: Response) => {
  try {
    const { symptoms, dateOfBirth, birthTime, birthVenue } = req.body

    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required' })
    }

    const prompt = `You are an expert health astrologer and medical advisor. Based on the following birth details and symptoms, provide personalized future health predictions and solutions for Tinea infections and skin health:

BIRTH DETAILS:
- Date of Birth: ${dateOfBirth}
- Birth Time: ${birthTime || 'Not specified'}
- Birth Venue: ${birthVenue || 'Not specified'}

SYMPTOMS & HEALTH CONCERN:
- Symptoms: ${symptoms || 'Not specified'}
- Health Focus: Tinea infection prevention and skin health management

Please provide a comprehensive personalized analysis including:

1. **Future Health Outlook**: Based on birth details, predict health trends for the next 6-12 months regarding Tinea and skin health
2. **Health Risk Assessment**: Rate overall health risk (Low/Moderate/High) and explain why
3. **Future Tinea Recurrence Risk**: Predict likelihood of Tinea recurrence based on birth patterns and current symptoms
4. **Immunity & Constitution**: Analyze predicted immune system strength and susceptibility to fungal infections
5. **Optimal Treatment Period**: Identify best months/periods for treatment based on astrological insights
6. **Personalized Solutions**: 
   - Recommended supplements and foods for skin health
   - Best practices for your constitution type
   - Timing for treatments
   - Lifestyle modifications
   - Sleep and wellness routines
7. **Prevention Strategy for Future**: Long-term prevention plan tailored to birth details
8. **Health Milestones**: Key health milestones to watch for in coming months
9. **When to Seek Help**: Critical signs requiring immediate medical attention
10. **Overall Guidance**: Summary and actionable recommendations

Be specific, detailed, and provide medical and wellness guidance. Format with clear headers and bullet points.`

    const prediction = await generateGeminiContent(prompt)

    res.json({
      success: true,
      prediction,
      tineaType: 'General Tinea',
      confidence: 0.85,
      dateOfBirth,
      birthTime,
      birthVenue,
    })
  } catch (error) {
    console.error('Tinea future prediction error:', error)
    res.status(500).json({
      error: 'Failed to generate future health prediction',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// POST /api/gemini/tinea-chat - Tinea chatbot conversation
router.post('/tinea-chat', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const systemPrompt = `You are TineaGuard, a helpful and knowledgeable assistant about Tinea (ringworm) diseases. You provide accurate medical information about:
- All types of tinea (Corporis, Pedis, Cruris, Capitis, Unguium, Faciei, Barbae)
- Symptoms, causes, and transmission
- Treatment options and prevention
- When to see a doctor
- Home care and management tips

Guidelines:
- Be friendly and supportive in tone
- Provide accurate medical information
- Always recommend consulting a healthcare professional for serious conditions
- Keep responses concise and clear
- Use relevant emojis when appropriate
- Focus on tinea-related topics

Context: ${context || 'Initial greeting or conversation start'}

User Message: ${message}

Provide a helpful, informative response about tinea. If the question is not related to tinea, politely redirect to tinea topics.`

    const response = await generateGeminiContent(systemPrompt)

    res.json({
      success: true,
      reply: response,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Tinea chat error:', error)
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router
