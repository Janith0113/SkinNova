import express, { Request, Response } from 'express';
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { getWeatherData, getWeatherCondition } from '../services/weatherService';
import { calculatePsoriasisRisk } from '../services/psoriasisRiskService';
import psoriasisKnowledgeService from '../services/psoriasisKnowledgeService'

const router = express.Router();

const predictionUploadDir = path.join(__dirname, '../../uploads/psoriasis-predictions')

if (!fs.existsSync(predictionUploadDir)) {
  fs.mkdirSync(predictionUploadDir, { recursive: true })
}

const predictionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, predictionUploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `psoriasis-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const predictionUpload = multer({
  storage: predictionStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    }

    cb(new Error('Only image files are allowed (JPG, PNG, WebP)'))
  },
})

/**
 * GET /api/psoriasis/weather-risk
 * Get real-time weather and psoriasis risk analysis
 * Query params: latitude, longitude (optional - defaults to default location)
 */
router.get('/weather-risk', async (req: Request, res: Response) => {
  try {
    let { latitude, longitude } = req.query;

    // Default to London if not provided (can be changed to any default location)
    let lat = latitude ? parseFloat(latitude as string) : 51.5074;
    let lon = longitude ? parseFloat(longitude as string) : -0.1278;

    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude',
        example: '/api/psoriasis/weather-risk?latitude=51.5074&longitude=-0.1278',
      });
    }

    // Fetch real-time weather data
    const weatherData = await getWeatherData(lat, lon);

    // Calculate risk analysis using explainable AI
    const riskAnalysis = calculatePsoriasisRisk(weatherData);

    // Add weather condition description
    const weatherCondition = getWeatherCondition(weatherData.weatherCode);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      location: weatherData.location,
      coordinates: { latitude: lat, longitude: lon },
      weather: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        feelsLike: weatherData.feelsLike,
        windSpeed: weatherData.windSpeed,
        condition: weatherCondition,
        temperatureTrend: weatherData.temperatureTrend,
      },
      riskAnalysis: {
        score: riskAnalysis.score,
        level: riskAnalysis.level,
        description: riskAnalysis.explainability.holisticView,
        factors: riskAnalysis.factors.map((f) => ({
          label: f.label,
          value: f.value,
          impact: f.impact,
          explanation: f.explanation,
          recommendation: f.recommendation,
        })),
        suggestions: riskAnalysis.suggestions,
        trend: riskAnalysis.trend,
        explainableInsights: {
          topRisks: riskAnalysis.explainability.topRisks,
          protectiveFactors: riskAnalysis.explainability.protectiveFactors,
          holisticAssessment: riskAnalysis.explainability.holisticView,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching weather risk:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch weather data',
    });
  }
});

/**
 * POST /api/psoriasis/weather-risk
 * Alternative endpoint for POST requests with body
 * Body: { latitude: number, longitude: number }
 */
router.post('/weather-risk', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing latitude or longitude in request body',
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude format',
      });
    }

    // Fetch real-time weather data
    const weatherData = await getWeatherData(lat, lon);

    // Calculate risk analysis
    const riskAnalysis = calculatePsoriasisRisk(weatherData);

    // Add weather condition
    const weatherCondition = getWeatherCondition(weatherData.weatherCode);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      location: weatherData.location,
      coordinates: { latitude: lat, longitude: lon },
      weather: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        feelsLike: weatherData.feelsLike,
        windSpeed: weatherData.windSpeed,
        condition: weatherCondition,
        temperatureTrend: weatherData.temperatureTrend,
      },
      riskAnalysis: {
        score: riskAnalysis.score,
        level: riskAnalysis.level,
        description: riskAnalysis.explainability.holisticView,
        factors: riskAnalysis.factors.map((f) => ({
          label: f.label,
          value: f.value,
          impact: f.impact,
          explanation: f.explanation,
          recommendation: f.recommendation,
        })),
        suggestions: riskAnalysis.suggestions,
        trend: riskAnalysis.trend,
        explainableInsights: {
          topRisks: riskAnalysis.explainability.topRisks,
          protectiveFactors: riskAnalysis.explainability.protectiveFactors,
          holisticAssessment: riskAnalysis.explainability.holisticView,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching weather risk:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch weather data',
    });
  }
});

/**
 * POST /api/psoriasis/predict
 * Upload a skin image and run the Python psoriasis model.
 */
router.post('/predict', predictionUpload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const imagePath = req.file.path
    const pythonScript = path.join(__dirname, '../../models/predict.py')
    const pythonBinary = process.env.PYTHON_BINARY || 'python'

    const pythonProcess = spawn(pythonBinary, [pythonScript, imagePath], {
      windowsHide: true,
    })

    let outputData = ''
    let errorData = ''
    let responded = false

    const cleanup = () => {
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (unlinkError) => {
          if (unlinkError) {
            console.error('Error deleting psoriasis upload:', unlinkError)
          }
        })
      }
    }

    const sendOnce = (status: number, payload: Record<string, unknown>) => {
      if (responded) return
      responded = true
      cleanup()
      res.status(status).json(payload)
    }

    const timeout = setTimeout(() => {
      pythonProcess.kill()
      sendOnce(504, { error: 'Psoriasis prediction timed out' })
    }, 60000)

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString()
    })

    pythonProcess.on('error', (error) => {
      clearTimeout(timeout)
      sendOnce(500, {
        error: 'Failed to spawn Python process',
        message: error.message,
      })
    })

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout)

      if (responded) return

      if (code !== 0) {
        return sendOnce(500, {
          error: 'Psoriasis prediction failed',
          stdout: outputData,
          stderr: errorData,
        })
      }

      try {
        const result = JSON.parse(outputData.trim())

        if (result?.error) {
          return sendOnce(500, {
            error: result.error,
          })
        }

        const rawConfidence = Number(result?.confidence ?? 0)
        const confidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence
        const label = result?.label || 'Psoriasis'

        return sendOnce(200, {
          success: true,
          label,
          confidence,
          rawPrediction: result?.raw_prediction ?? null,
          mock: Boolean(result?.mock),
          message:
            label === 'Psoriasis'
              ? 'Psoriasis detected. Please review the result with a dermatologist.'
              : 'No psoriasis detected by the model.',
        })
      } catch (parseError) {
        return sendOnce(500, {
          error: 'Failed to parse prediction output',
          details: outputData,
          stderr: errorData,
        })
      }
    })
  } catch (error) {
    console.error('Error running psoriasis prediction:', error)
    res.status(500).json({
      error: 'Psoriasis prediction request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

/**
 * GET /api/psoriasis/knowledge-base-info
 * Return psoriasis KB statistics
 */
router.get('/knowledge-base-info', async (req: Request, res: Response) => {
  try {
    const stats = psoriasisKnowledgeService.getStatistics()
    res.json({ success: true, stats, message: 'Psoriasis knowledge base loaded' })
  } catch (error) {
    console.error('Error fetching psoriasis KB info:', error)
    res.status(500).json({ error: 'Failed to fetch knowledge base info' })
  }
})

/**
 * POST /api/psoriasis/search-knowledge
 * Body: { query: string }
 */
router.post('/search-knowledge', async (req: Request, res: Response) => {
  try {
    const { query } = req.body
    if (!query) return res.status(400).json({ error: 'Search query required' })
    const results = psoriasisKnowledgeService.searchKnowledge(query)
    res.json({ success: true, results, count: results.length })
  } catch (error) {
    console.error('Error searching psoriasis KB:', error)
    res.status(500).json({ error: 'Failed to search knowledge base' })
  }
})

/**
 * POST /api/psoriasis/chat
 * Chat endpoint that answers psoriasis questions using KB
 * Body: { message: string }
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Search KB for relevant info
    const searchResults = psoriasisKnowledgeService.searchKnowledge(message)
    const confidentResults = searchResults.filter((r: any) => (r.matchScore || 0) >= 30)

    let reply: string
    let sources: any[] = []

    if (confidentResults.length > 0) {
      // Use KB answer
      const topResult = confidentResults[0]
      reply = topResult.content

      // Extract sources from KB
      sources = psoriasisKnowledgeService.getTrustedSources()
    } else {
      // No confident KB match - provide general psoriasis guidance
      reply = generatePsoriasisDefaultResponse(message)
      sources = psoriasisKnowledgeService.getTrustedSources()
    }

    res.json({
      success: true,
      reply,
      sources,
      hasKnowledgeBaseCitation: confidentResults.length > 0,
      disclaimer: 'This information is for educational purposes. Always consult a dermatologist for personalized medical advice.'
    })
  } catch (error) {
    console.error('Error in psoriasis chat:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

/**
 * Generate a default psoriasis response when KB doesn't have confident match
 */
function generatePsoriasisDefaultResponse(message: string): string {
  const lowerMsg = message.toLowerCase()

  // Greeting responses
  if (['hi', 'hello', 'hey'].some(g => lowerMsg.includes(g))) {
    return "👋 Hi! I'm your Psoriasis Assistant. I can help answer questions about psoriasis triggers, treatments, skin care, and lifestyle management. What would you like to know?"
  }

  // Symptom/flare responses
  if (lowerMsg.includes('flare') || lowerMsg.includes('symptom') || lowerMsg.includes('worse')) {
    return "Common psoriasis triggers include stress, infections, cold weather, smoking, and certain medications. If you're experiencing a flare, try: moisturizing regularly, avoiding irritants, managing stress, and consulting your dermatologist. They can adjust your treatment plan if needed."
  }

  // Treatment responses
  if (lowerMsg.includes('treat') || lowerMsg.includes('medication') || lowerMsg.includes('medicine')) {
    return "Psoriasis treatments range from topical (creams, phototherapy) to systemic (oral/injectable medications) depending on severity. Topical corticosteroids and vitamin D analogues are first-line. Moderate-to-severe cases may need biologic therapies. Your dermatologist will recommend what's best for you."
  }

  // Skin care responses
  if (lowerMsg.includes('skin care') || lowerMsg.includes('skincare') || lowerMsg.includes('moistur') || lowerMsg.includes('soap')) {
    return "Good skin care is essential: (1) Use fragrance-free moisturizers daily, (2) Avoid irritating soaps - use gentle cleansers, (3) Apply moisturizer while skin is still damp, (4) Avoid hot water, (5) Protect skin from injury. These habits reduce flares significantly."
  }

  // Lifestyle/trigger responses
  if (lowerMsg.includes('trigger') || lowerMsg.includes('stress') || lowerMsg.includes('lifestyle')) {
    return "Key lifestyle adjustments: manage stress (yoga, meditation), avoid smoking and excess alcohol, maintain healthy weight, get adequate sleep, and identify personal triggers. Keeping a symptom diary helps you spot patterns and avoid flares."
  }

  // Diet responses
  if (lowerMsg.includes('diet') || lowerMsg.includes('food') || lowerMsg.includes('eat')) {
    return "While no specific diet cures psoriasis, anti-inflammatory foods may help: omega-3 fatty acids (fish), fruits, vegetables, whole grains. Limit alcohol and processed foods. Some find gluten/dairy reduction helpful. Work with a nutritionist to find what works for you."
  }

  // Contagion responses
  if (lowerMsg.includes('contagious') || lowerMsg.includes('spread') || lowerMsg.includes('catch')) {
    return "Psoriasis is NOT contagious. You cannot catch it or spread it to others. It's an autoimmune condition triggered by genetics and environmental factors, not an infection."
  }

  // Cure responses
  if (lowerMsg.includes('cure') || lowerMsg.includes('curable')) {
    return "Psoriasis is a chronic condition, not curable, but highly manageable. Many people achieve clear skin with proper treatment and lifestyle changes. New biologic therapies have dramatically improved outcomes. Work with your dermatologist to find an effective management plan."
  }

  // Default helpful response
  return "That's a great question about psoriasis! For detailed information, I recommend consulting with your dermatologist. In the meantime, focus on: (1) Consistent skin care, (2) Identifying your triggers, (3) Stress management, (4) Staying hydrated. Is there a specific aspect of psoriasis management you'd like to know more about?"
}

export default router;
