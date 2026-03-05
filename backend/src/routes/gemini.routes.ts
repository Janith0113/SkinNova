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

export default router
