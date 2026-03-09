# Model Files Setup

This directory should contain your Teachable Machine model files:

## Required Files

1. **model.json** - Model architecture and layer configuration
   - Contains the neural network structure
   - Defines input/output specifications
   
2. **metadata.json** - Model metadata
   - Contains class labels
   - Training information
   - Model information (version, timestamp, etc.)

3. **weights.bin** - Model weights
   - Binary file containing all learned parameters
   - Large file (typically 5-10MB)

## Setup Instructions

1. Export your Teachable Machine model from https://teachablemachine.withgoogle.com/
2. Download all model files
3. Place the following files in THIS DIRECTORY:
   - `model.json`
   - `metadata.json`
   - `weights.bin`

## File Verification

You should have:
```
public/
├── model/
│   ├── model.json          ✓
│   ├── metadata.json       ✓
│   └── weights.bin         ✓
```

Do NOT rename these files - the application expects these exact names.

## Testing Model Loading

The application will automatically attempt to load these files when:
1. The page first loads
2. The component initializes

Check browser console (F12) for any loading errors.

## File Sizes Reference

- model.json: ~50-100 KB
- metadata.json: ~1-5 KB
- weights.bin: ~5-10 MB (for MobileNet model)

The application downloads all files on first load (~5-10MB total).
