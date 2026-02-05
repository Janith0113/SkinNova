import express, { Request, Response } from 'express';
import { getWeatherData, getWeatherCondition } from '../services/weatherService';
import { calculatePsoriasisRisk } from '../services/psoriasisRiskService';

const router = express.Router();

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

export default router;
