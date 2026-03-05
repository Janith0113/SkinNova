/**
 * Grad-CAM API Routes for Psoriasis Risk Analysis
 * Provides endpoints for real Grad-CAM explainability
 */

import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = express.Router();

/**
 * Helper function to call Python Grad-CAM model
 */
const callGradCAMModel = (weatherData: {
  temperature: number;
  humidity: number;
  trend_value: number;
  wind_speed: number;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, '..', 'ai_models', 'psoriasis_gradcam_model.py');
    
    const python = spawn('python', [pythonPath], {
      cwd: path.join(__dirname, '..', '..'),
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data: Buffer) => {
      output += data.toString();
    });

    python.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    // Send data to Python process
    python.stdin.write(JSON.stringify(weatherData));
    python.stdin.end();

    python.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse Python output: ${output}`));
      }
    });
  });
};

/**
 * POST /api/psoriasis/grad-cam
 * Get Grad-CAM explanation for weather data
 * Body: { temperature, humidity, trend_value, wind_speed }
 */
router.post('/grad-cam', async (req: Request, res: Response) => {
  try {
    const { temperature, humidity, trend_value, wind_speed } = req.body;

    if (
      temperature === undefined ||
      humidity === undefined ||
      wind_speed === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required weather parameters',
        required: ['temperature', 'humidity', 'trend_value', 'wind_speed'],
      });
    }

    // Call Python Grad-CAM model
    const gradcamExplanation = await callGradCAMModel({
      temperature,
      humidity,
      trend_value: trend_value || 0,
      wind_speed,
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      gradcamExplanation: {
        riskScore: gradcamExplanation.risk_score,
        heatmap: gradcamExplanation.grad_cam_heatmap,
        factorImportance: gradcamExplanation.factor_importance,
        featureValues: gradcamExplanation.feature_values,
        visualization: {
          colorMap: generateColorMap(gradcamExplanation.factor_importance),
          description: generateGradCAMDescription(gradcamExplanation),
        },
      },
    });
  } catch (error) {
    console.error('Grad-CAM error:', error);
    return res.status(500).json({
      error: 'Failed to compute Grad-CAM explanation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate color map from factor importance
 */
function generateColorMap(
  factorImportance: Record<string, number>
): Record<string, string> {
  const colorMap: Record<string, string> = {};

  Object.entries(factorImportance).forEach(([factor, importance]) => {
    // Map importance (0-1) to color gradient: blue -> green -> yellow -> red
    const color = importanceToColor(importance);
    colorMap[factor] = color;
  });

  return colorMap;
}

/**
 * Convert importance score (0-1) to RGB hex color
 */
function importanceToColor(importance: number): string {
  let r = 0,
    g = 0,
    b = 0;

  if (importance < 0.25) {
    // Blue zone
    b = Math.floor(255 * (1 - importance / 0.25));
    r = Math.floor(59 + (59 * importance) / 0.25);
    g = Math.floor(130 + (50 * importance) / 0.25); // #3b82f6 to #10b981
  } else if (importance < 0.5) {
    // Green zone
    g = 185;
    r = Math.floor(16 + (144 * (importance - 0.25)) / 0.25);
    b = Math.floor(129 - (129 * (importance - 0.25)) / 0.25);
  } else if (importance < 0.75) {
    // Yellow zone
    r = 251;
    g = Math.floor(191 - (68 * (importance - 0.5)) / 0.25);
    b = 0;
  } else {
    // Red zone
    r = 239;
    g = Math.floor(68 - (68 * (importance - 0.75)) / 0.25);
    b = 68;
  }

  return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
}

/**
 * Generate human-readable Grad-CAM description
 */
function generateGradCAMDescription(explanation: any): string {
  const factorImportance = explanation.factor_importance;
  const sortedFactors = Object.entries(factorImportance)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([factor]) => factor);

  return `The model's prediction is primarily influenced by ${sortedFactors.join(' and ')}. 
          These factors have the strongest gradient signals in the network, indicating they are critical to the risk assessment.`;
}

export default router;
