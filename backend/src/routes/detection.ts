import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

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

// Helper to run disease detection with timeout and proper response handling
const runDiseaseDetection = (
  diseaseType: 'tinea' | 'leprosy' | 'melanoma',
  pythonScript: string,
  imagePath: string,
  res: Response
) => {
  const pythonBinary = process.env.PYTHON_BINARY || 'python';
  const pythonProcess = spawn(pythonBinary, [pythonScript, imagePath], {
    windowsHide: true,
  });

  let outputData = '';
  let errorData = '';
  let responded = false;

  const cleanup = () => {
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (unlinkError) => {
        if (unlinkError) {
          console.error(`Error deleting ${diseaseType} upload:`, unlinkError);
        }
      });
    }
  };

  const sendOnce = (status: number, payload: Record<string, unknown>) => {
    if (responded) return;
    responded = true;
    cleanup();
    res.status(status).json(payload);
  };

  const timeout = setTimeout(() => {
    pythonProcess.kill();
    sendOnce(504, { error: `${diseaseType} prediction timed out` });
  }, 60000);

  pythonProcess.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  pythonProcess.on('error', (error) => {
    clearTimeout(timeout);
    sendOnce(500, {
      error: `Failed to spawn Python process for ${diseaseType}`,
      message: error.message,
    });
  });

  pythonProcess.on('close', (code) => {
    clearTimeout(timeout);

    if (responded) return;

    if (code !== 0) {
      return sendOnce(500, {
        error: `${diseaseType} prediction failed`,
        stdout: outputData,
        stderr: errorData,
      });
    }

    try {
      const result = JSON.parse(outputData.trim());

      if (result?.error) {
        return sendOnce(500, { error: result.error });
      }

      const rawConfidence = Number(result?.confidence ?? 0);
      const confidence = rawConfidence > 1 ? rawConfidence / 100 : rawConfidence;

      if (diseaseType === 'tinea') {
        const label = result?.label || (result?.is_tinea ? 'Tinea Detected' : 'Normal Skin');
        return sendOnce(200, {
          success: true,
          label,
          confidence,
          is_tinea: Boolean(result?.is_tinea ?? label === 'Tinea Detected'),
          rawPrediction: result?.raw_prediction ?? null,
          mock: Boolean(result?.mock),
          message: label === 'Tinea Detected'
            ? 'Tinea detected. Please review the result with a dermatologist.'
            : 'No tinea detected by the model.',
        });
      }

      if (diseaseType === 'leprosy') {
        const label = result?.label || (result?.is_leprosy ? 'Leprosy Skin' : 'Normal Skin');
        return sendOnce(200, {
          success: true,
          label,
          confidence,
          is_leprosy: Boolean(result?.is_leprosy ?? label === 'Leprosy Skin'),
          rawPrediction: result?.raw_prediction ?? null,
          mock: Boolean(result?.mock),
          message: label === 'Leprosy Skin'
            ? 'Leprosy detected. Please review the result with a dermatologist.'
            : 'No leprosy detected by the model.',
        });
      }

      if (diseaseType === 'melanoma') {
        const label = result?.label || (result?.is_melanoma ? 'Melanoma' : 'Not Melanoma');
        return sendOnce(200, {
          success: true,
          label,
          confidence,
          is_melanoma: Boolean(result?.is_melanoma ?? label === 'Melanoma'),
          rawPrediction: result?.raw_prediction ?? null,
          mock: Boolean(result?.mock),
          message: label === 'Melanoma'
            ? 'Melanoma detected. Please review the result with a dermatologist.'
            : 'No melanoma detected by the model.',
        });
      }
    } catch (parseError) {
      return sendOnce(500, {
        error: 'Failed to parse prediction output',
        details: outputData,
        stderr: errorData,
      });
    }
  });
};

router.post('/tinea', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const pythonScript = path.join(__dirname, '../../models/tinea_predict.py');
    runDiseaseDetection('tinea', pythonScript, imagePath, res);
  } catch (error) {
    console.error('Error running tinea detection:', error);
    res.status(500).json({
      error: 'Tinea detection request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/leprosy', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const pythonScript = path.join(__dirname, '../../models/leprosy_predict.py');
    runDiseaseDetection('leprosy', pythonScript, imagePath, res);
  } catch (error) {
    console.error('Error running leprosy detection:', error);
    res.status(500).json({
      error: 'Leprosy detection request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/melanoma', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const pythonScript = path.join(__dirname, '../../models/melanoma_predict.py');
    runDiseaseDetection('melanoma', pythonScript, imagePath, res);
  } catch (error) {
    console.error('Error running melanoma detection:', error);
    res.status(500).json({
      error: 'Melanoma detection request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
