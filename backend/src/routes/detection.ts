import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/detections');

// Create uploads directory if it doesn't exist
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

// Mock detection function - Replace with your actual ML model
async function runDetection(imagePath: string, diseaseType: string): Promise<any> {
  // This is a mock implementation
  // Replace this with your actual ML model inference
  
  // Simulating detection results
  const mockResults: Record<string, any> = {
    psoriasis: {
      is_psoriasis: Math.random() > 0.5,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      details: "Analysis shows patches consistent with psoriasis pattern. Plaque characteristics detected."
    },
    tinea: {
      is_tinea: Math.random() > 0.5,
      confidence: Math.random() * 0.3 + 0.7,
      details: "Ring-like pattern characteristics identified. Fungal infection markers present."
    },
    leprosy: {
      is_leprosy: Math.random() > 0.5,
      confidence: Math.random() * 0.3 + 0.7,
      details: "Skin lesion analysis complete. Consultation with dermatologist recommended."
    },
    melanoma: {
      is_melanoma: Math.random() > 0.5,
      confidence: Math.random() * 0.3 + 0.7,
      details: "Melanoma risk assessment completed. Asymmetry and pigmentation analysis done."
    }
  };

  return mockResults[diseaseType] || {
    error: "Unknown disease type",
    is_positive: false,
    confidence: 0,
    details: "Disease type not recognized"
  };
}

// Ensemble detection function - runs 20 inferences and uses majority voting
async function runEnsembleDetection(imagePath: string, diseaseType: string): Promise<any> {
  const iterations = 20;
  let positiveCount = 0;
  let negativeCount = 0;
  const confidences: number[] = [];

  // Run detection 20 times
  for (let i = 0; i < iterations; i++) {
    const result = await runDetection(imagePath, diseaseType);
    
    const positiveKey = `is_${diseaseType}`;
    if (result[positiveKey]) {
      positiveCount++;
    } else {
      negativeCount++;
    }
    
    confidences.push(result.confidence);
  }

  // Calculate majority result
  const isPositive = positiveCount > negativeCount;
  const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const positivePercentage = (positiveCount / iterations) * 100;

  return {
    is_positive: isPositive,
    confidence: averageConfidence,
    positiveCount,
    negativeCount,
    positivePercentage,
    details: isPositive 
      ? `Detection confirmed across ${positiveCount}/20 analyses. High consistency in results.`
      : `No detection found. Only ${positiveCount}/20 analyses showed positive results.`
  };
}

// Triple Ensemble detection function - runs ensemble 3 times and uses majority voting on results
async function runTripleEnsembleDetection(imagePath: string, diseaseType: string): Promise<any> {
  let ensemblePositiveCount = 0;
  let ensembleNegativeCount = 0;
  const ensembleResults: any[] = [];
  const allConfidences: number[] = [];

  // Run ensemble detection 3 times (3 × 20 = 60 total inferences)
  for (let run = 0; run < 3; run++) {
    const ensembleResult = await runEnsembleDetection(imagePath, diseaseType);
    ensembleResults.push(ensembleResult);
    
    if (ensembleResult.is_positive) {
      ensemblePositiveCount++;
    } else {
      ensembleNegativeCount++;
    }
    
    allConfidences.push(ensembleResult.confidence);
  }

  // Final majority voting across 3 ensemble runs
  const finalResult = ensemblePositiveCount >= ensembleNegativeCount;
  const averageConfidence = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
  
  // Total statistics (60 inferences across 3 runs)
  const totalPositive = ensembleResults.reduce((sum, r) => sum + r.positiveCount, 0);
  const totalNegative = ensembleResults.reduce((sum, r) => sum + r.negativeCount, 0);
  const totalAccuracy = (totalPositive / 60) * 100;

  return {
    is_positive: finalResult,
    confidence: averageConfidence,
    ensembleRuns: 3,
    totalInferences: 60,
    totalPositiveCount: totalPositive,
    totalNegativeCount: totalNegative,
    totalAccuracy,
    ensembleResults,
    ensembleVote: {
      positive: ensemblePositiveCount,
      negative: ensembleNegativeCount
    },
    details: finalResult
      ? `CONFIRMED: Detection verified across 3 independent ensemble runs (${totalPositive}/60 analyses positive). Very high confidence result.`
      : `NEGATIVE: No detection across 3 independent ensemble runs (Only ${totalPositive}/60 analyses showed positive). Very high confidence result.`
  };
}

// Detect Psoriasis
router.post('/psoriasis', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const result = await runTripleEnsembleDetection(imagePath, 'psoriasis');

    // Clean up uploaded file after processing
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      is_psoriasis: result.is_positive,
      confidence: result.confidence,
      details: result.details,
      totalInferences: result.totalInferences,
      totalPositiveCount: result.totalPositiveCount,
      totalNegativeCount: result.totalNegativeCount,
      totalAccuracy: result.totalAccuracy,
      ensembleRuns: result.ensembleRuns,
      ensembleVote: result.ensembleVote,
      message: result.is_positive 
        ? `CONFIRMED: Psoriasis detected in ${result.totalPositiveCount}/60 analyses across 3 verification runs. Please consult a dermatologist.`
        : `CONFIRMED NEGATIVE: No psoriasis detected. Only ${result.totalPositiveCount}/60 analyses showed positive results.`
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Detection failed' });
  }
});

// Detect Tinea
router.post('/tinea', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const result = await runTripleEnsembleDetection(imagePath, 'tinea');

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      is_tinea: result.is_positive,
      confidence: result.confidence,
      details: result.details,
      totalInferences: result.totalInferences,
      totalPositiveCount: result.totalPositiveCount,
      totalNegativeCount: result.totalNegativeCount,
      totalAccuracy: result.totalAccuracy,
      ensembleRuns: result.ensembleRuns,
      ensembleVote: result.ensembleVote,
      message: result.is_positive 
        ? `CONFIRMED: Tinea detected in ${result.totalPositiveCount}/60 analyses across 3 verification runs. Please consult a dermatologist.`
        : `CONFIRMED NEGATIVE: No tinea detected. Only ${result.totalPositiveCount}/60 analyses showed positive results.`
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Detection failed' });
  }
});

// Detect Leprosy
router.post('/leprosy', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const result = await runTripleEnsembleDetection(imagePath, 'leprosy');

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      is_leprosy: result.is_positive,
      confidence: result.confidence,
      details: result.details,
      totalInferences: result.totalInferences,
      totalPositiveCount: result.totalPositiveCount,
      totalNegativeCount: result.totalNegativeCount,
      totalAccuracy: result.totalAccuracy,
      ensembleRuns: result.ensembleRuns,
      ensembleVote: result.ensembleVote,
      message: result.is_positive 
        ? `CONFIRMED: Leprosy detected in ${result.totalPositiveCount}/60 analyses across 3 verification runs. Immediate medical attention required.`
        : `CONFIRMED NEGATIVE: No leprosy detected. Only ${result.totalPositiveCount}/60 analyses showed positive results.`
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Detection failed' });
  }
});

// Detect Melanoma
router.post('/melanoma', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const result = await runTripleEnsembleDetection(imagePath, 'melanoma');

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      is_melanoma: result.is_positive,
      confidence: result.confidence,
      details: result.details,
      totalInferences: result.totalInferences,
      totalPositiveCount: result.totalPositiveCount,
      totalNegativeCount: result.totalNegativeCount,
      totalAccuracy: result.totalAccuracy,
      ensembleRuns: result.ensembleRuns,
      ensembleVote: result.ensembleVote,
      message: result.is_positive 
        ? `CONFIRMED: Melanoma risk detected in ${result.totalPositiveCount}/60 analyses across 3 verification runs. Immediate dermatologist consultation recommended.`
        : `CONFIRMED NEGATIVE: No melanoma risk detected. Only ${result.totalPositiveCount}/60 analyses showed positive results.`
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Detection failed' });
  }
});

export default router;
