import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/gradcam');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPG, PNG, WebP)'));
    }
  },
});

/**
 * Generate GradCAM explanation for an image prediction
 * POST /api/xai/image-explanation
 */
router.post('/image-explanation', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
      });
    }

    const imagePath = req.file.path;
    const modelType = req.body.modelType || 'psoriasis'; // tinea, psoriasis, leprosy, skin-cancer

    // Call Python script to generate GradCAM
    const pythonScript = path.join(__dirname, '../../models/generate_gradcam.py');

    const pythonProcess = spawn('python', [pythonScript, imagePath, modelType], {
      windowsHide: true,
      timeout: 60000, // 60 second timeout
    });

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      console.log('[GradCAM] Python stdout:', data.toString());
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.log('[GradCAM] Python stderr:', data.toString());
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Clean up uploaded file after processing
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }

      if (code === 0) {
        try {
          const result = JSON.parse(outputData.trim());
          res.json({
            success: true,
            data: result,
          });
        } catch (parseError) {
          res.status(500).json({
            error: 'Failed to parse GradCAM output',
            details: outputData,
          });
        }
      } else {
        res.status(500).json({
          error: 'GradCAM generation failed',
          stderr: errorData,
          stdout: outputData,
        });
      }
    });

    pythonProcess.on('error', (err) => {
      res.status(500).json({
        error: 'Failed to spawn Python process',
        message: err.message,
      });
    });
  } catch (error) {
    res.status(500).json({
      error: 'Image explanation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get GradCAM visualization as image
 * GET /api/xai/visualization/:sessionId
 */
router.get('/visualization/:sessionId', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const vizPath = path.join(uploadDir, `${sessionId}_visualization.jpg`);

    if (!fs.existsSync(vizPath)) {
      return res.status(404).json({
        error: 'Visualization not found',
      });
    }

    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(vizPath).pipe(res);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve visualization',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Generate feature importance summary for quiz answers
 * POST /api/xai/quiz-features
 */
router.post('/quiz-features', (req: Request, res: Response) => {
  try {
    const { answers, primaryDosha } = req.body;

    if (!answers || !primaryDosha) {
      return res.status(400).json({
        error: 'Missing required fields: answers and primaryDosha',
      });
    }

    // Feature weights for each dosha type
    const dosha_feature_weights: Record<string, Record<string, number>> = {
      vata: {
        body_frame: 0.12,
        skin_type: 0.14,
        appetite: 0.08,
        emotional_state: 0.1,
        sleep_pattern: 0.09,
        weather_preference: 0.07,
        digestion: 0.08,
        energy_level: 0.1,
        stress_response: 0.09,
        hair_type: 0.06,
        hands_feet: 0.11,
        memory: 0.07,
        speaking_style: 0.08,
        movement: 0.09,
        body_temperature: 0.08,
        leisure_time: 0.08,
        body_odor: 0.06,
        cold_weather: 0.09,
        bowel_habit: 0.08,
        humor: 0.05,
        nails: 0.07,
        noise_sensitivity: 0.08,
        spending_pattern: 0.06,
        new_situations: 0.08,
        eye_type: 0.07,
      },
      pitta: {
        body_frame: 0.1,
        skin_type: 0.15,
        appetite: 0.12,
        emotional_state: 0.11,
        sleep_pattern: 0.08,
        weather_preference: 0.09,
        digestion: 0.1,
        energy_level: 0.09,
        stress_response: 0.1,
        hair_type: 0.07,
        hands_feet: 0.1,
        memory: 0.08,
        speaking_style: 0.09,
        movement: 0.08,
        body_temperature: 0.11,
        leisure_time: 0.07,
        body_odor: 0.1,
        cold_weather: 0.08,
        bowel_habit: 0.09,
        humor: 0.06,
        nails: 0.06,
        noise_sensitivity: 0.06,
        spending_pattern: 0.07,
        new_situations: 0.08,
        eye_type: 0.08,
      },
      kapha: {
        body_frame: 0.13,
        skin_type: 0.13,
        appetite: 0.1,
        emotional_state: 0.09,
        sleep_pattern: 0.11,
        weather_preference: 0.08,
        digestion: 0.09,
        energy_level: 0.07,
        stress_response: 0.08,
        hair_type: 0.08,
        hands_feet: 0.1,
        memory: 0.06,
        speaking_style: 0.07,
        movement: 0.08,
        body_temperature: 0.07,
        leisure_time: 0.08,
        body_odor: 0.07,
        cold_weather: 0.06,
        bowel_habit: 0.1,
        humor: 0.06,
        nails: 0.09,
        noise_sensitivity: 0.05,
        spending_pattern: 0.06,
        new_situations: 0.08,
        eye_type: 0.07,
      },
    };

    const weights = dosha_feature_weights[primaryDosha] || {};
    const featureAnalysis = [];

    for (const answer of answers) {
      const questionId = answer.questionId;
      const category = getCategoryForQuestion(questionId);
      const weight = weights[category] || 0.08;

      // Calculate importance scores
      const isAligned = answer.dosha === primaryDosha;
      const alignmentScore = isAligned ? 1.0 : 0.4;

      const featureImportance = {
        answer_alignment: weight * 100 * alignmentScore,
        answer_specificity: isAligned ? 85 : 35,
        question_relevance: weight * 100,
        confidence_score: alignmentScore * 100,
      };

      const gradcamScore = Math.min(
        100,
        Math.max(
          0,
          (featureImportance.answer_alignment * 0.35 +
            featureImportance.answer_specificity * 0.25 +
            featureImportance.question_relevance * 0.25 +
            featureImportance.confidence_score * 0.15) /
            100 *
            (weight * 200)
        )
      );

      featureAnalysis.push({
        questionId,
        category,
        weight: weight * 100,
        featureImportance,
        gradcamScore,
        alignmentScore,
      });
    }

    const totalFeatureImportance = featureAnalysis.reduce(
      (sum, fa) => sum + fa.gradcamScore,
      0
    ) / featureAnalysis.length;

    res.json({
      success: true,
      data: {
        primaryDosha,
        totalImportance: totalFeatureImportance,
        features: featureAnalysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Quiz features computation error:', error);
    res.status(500).json({
      error: 'Failed to compute quiz features',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Helper function to map question ID to category
 */
function getCategoryForQuestion(questionId: number): string {
  const questionCategories: Record<number, string> = {
    1: 'body_frame',
    2: 'skin_type',
    3: 'appetite',
    4: 'emotional_state',
    5: 'sleep_pattern',
    6: 'weather_preference',
    7: 'digestion',
    8: 'energy_level',
    9: 'energy_level',
    10: 'stress_response',
    11: 'hair_type',
    12: 'hands_feet',
    13: 'memory',
    14: 'speaking_style',
    15: 'movement',
    16: 'body_temperature',
    17: 'leisure_time',
    18: 'body_odor',
    19: 'cold_weather',
    20: 'bowel_habit',
    21: 'humor',
    22: 'nails',
    23: 'noise_sensitivity',
    24: 'spending_pattern',
    25: 'new_situations',
  };
  return questionCategories[questionId] || 'unknown';
}

export default router;
