# 🔌 Tinea Detection API Reference

## Base URL
```
http://localhost:4000/api
```

---

## POST /detect/tinea

Analyzes an image to detect tinea fungal infection and classify into one of 7 types.

### Request

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | file | Yes | Image file (JPG, PNG, WebP) |

**Size Limits:**
- Max file size: 10MB
- Supported formats: JPEG, JPG, PNG, WebP

### Example Requests

#### cURL
```bash
curl -X POST http://localhost:4000/api/detect/tinea \
  -F "file=@skin_image.jpg"
```

#### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:4000/api/detect/tinea', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

#### Python/Requests
```python
import requests

with open('skin_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:4000/api/detect/tinea',
        files=files
    )
    
data = response.json()
print(data)
```

#### Node.js/Axios
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('skin_image.jpg'));

const response = await axios.post(
  'http://localhost:4000/api/detect/tinea',
  form,
  { headers: form.getHeaders() }
);

console.log(response.data);
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "tineaType": "Tinea Corporis (Body Ringworm)",
  "affected_area": "Arms, Legs, Chest, Back",
  "severity": "Moderate",
  "confidence": 0.82,
  "details": "Tinea Corporis (Body Ringworm) detected with 82.0% confidence. Characteristics include: Circular or ring-shaped red rash, Clear center with raised, scaly edges, Itching and mild burning sensation, Usually 1-3 cm in diameter. Treatment typically requires 2-4 weeks.",
  "recommendations": [
    "Consult a dermatologist for professional diagnosis and treatment",
    "Maintain proper hygiene and cleanliness",
    "Keep the affected area clean and dry",
    "Avoid scratching or picking at affected areas",
    "Wear loose, breathable clothing",
    "Change clothes if they become damp or sweaty",
    "Apply topical antifungal cream 2-3 times daily",
    "Avoid sharing towels, clothing, or bedding",
    "Launder clothes in hot water"
  ],
  "totalInferences": 60,
  "totalPositiveCount": 49,
  "totalNegativeCount": 11,
  "totalAccuracy": 81.67,
  "ensembleRuns": 3,
  "ensembleVote": {
    "positive": 3,
    "negative": 0
  },
  "message": "CONFIRMED: Tinea Corporis (Body Ringworm) detected in 49/60 analyses across 3 verification runs. Please consult a dermatologist and follow recommended treatment."
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "No file uploaded"
}
```

### Error Response (415 Unsupported Media Type)

```json
{
  "error": "Only image files are allowed (JPG, PNG, WebP)"
}
```

### Error Response (413 Payload Too Large)

```json
{
  "error": "File size exceeds limit of 10MB"
}
```

### Error Response (500 Server Error)

```json
{
  "error": "Detection failed",
  "message": "Internal server error occurred"
}
```

---

## Response Field Descriptions

### Core Detection Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether detection completed successfully |
| `tineaType` | string | Detected tinea type (one of 7 types or "No Tinea Detected") |
| `affected_area` | string | Body area affected by the detected tinea |
| `severity` | string | Severity level: "None", "Mild", "Moderate", or "Severe" |
| `confidence` | number | Confidence score (0.0 to 1.0) |

### Analysis Fields

| Field | Type | Description |
|-------|------|-------------|
| `details` | string | Detailed analysis including characteristics and duration |
| `recommendations` | array | Array of treatment recommendations |
| `message` | string | Human-readable result summary |

### Ensemble Detection Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalInferences` | number | Total number of ML inferences run (60) |
| `totalPositiveCount` | number | Number of positive detections (0-60) |
| `totalNegativeCount` | number | Number of negative detections (0-60) |
| `totalAccuracy` | number | Accuracy percentage (0-100) |
| `ensembleRuns` | number | Number of ensemble runs (3) |
| `ensembleVote` | object | Voting counts across ensemble runs |

---

## Tinea Type Reference

### Possible Values for `tineaType`

1. **Tinea Corporis (Body Ringworm)**
   - Area: Arms, Legs, Chest, Back
   - Characteristics: Ring-shaped red rash, clear center, raised edges

2. **Tinea Cruris (Jock Itch)**
   - Area: Groin & Inner Thighs
   - Characteristics: Red rash, clear borders, scaling

3. **Tinea Pedis (Athlete's Foot)**
   - Area: Feet & Between Toes
   - Characteristics: Cracked skin, itching, white soggy skin

4. **Tinea Capitis (Scalp Ringworm)**
   - Area: Scalp
   - Characteristics: Scaly patches, hair loss, possible swelling

5. **Tinea Unguium (Nail Fungus)**
   - Area: Fingernails & Toenails
   - Characteristics: Thick nails, yellow/white color, brittle

6. **Tinea Faciei (Face Ringworm)**
   - Area: Face (excluding beard)
   - Characteristics: Red scaly patches, clear borders

7. **Tinea Barbae (Beard Ringworm)**
   - Area: Beard & Mustache Area
   - Characteristics: Red patches, hair breaks easily, pustules

8. **No Tinea Detected**
   - Severity: None
   - Status: Healthy skin, no infection detected

---

## Severity Levels

| Level | Confidence Range | Description |
|-------|-----------------|-------------|
| None | N/A | No tinea detected |
| Mild | 0.50 - 0.60 | Early stage or localized infection |
| Moderate | 0.60 - 0.80 | Clear signs of infection |
| Severe | 0.80 - 1.00 | Advanced or extensive infection |

---

## Recommendations Example

Each tinea type receives common recommendations plus type-specific advice:

### Common Recommendations (All Types)
```
1. Consult a dermatologist for professional diagnosis and treatment
2. Maintain proper hygiene and cleanliness
3. Keep the affected area clean and dry
4. Avoid scratching or picking at affected areas
```

### Type-Specific Examples

#### Tinea Corporis
```
- Wear loose, breathable clothing
- Change clothes if damp or sweaty
- Apply topical antifungal cream 2-3 times daily
- Avoid sharing towels or bedding
- Launder clothes in hot water
```

#### Tinea Pedis
```
- Dry feet thoroughly after bathing, especially between toes
- Wear moisture-wicking socks
- Alternate shoes to allow them to dry
- Avoid walking barefoot in public areas
- Apply topical antifungal powder or cream twice daily
```

#### Tinea Capitis
```
- Use prescribed medicated shampoo as directed
- Avoid sharing combs or brushes
- Keep scalp clean and dry
- Consider oral antifungal medication
- Inform school/workplace about infection
```

---

## HTTP Status Codes

| Code | Meaning | Cause |
|------|---------|-------|
| 200 | OK | Successful detection |
| 400 | Bad Request | No file uploaded or invalid format |
| 413 | Payload Too Large | File exceeds 10MB limit |
| 415 | Unsupported Media Type | File is not image format |
| 500 | Server Error | Internal server error during processing |

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:

```typescript
// Example rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

router.post('/tinea', limiter, upload.single('file'), ...);
```

---

## Authentication

Currently no authentication is required. For production, add:

```typescript
// Example authentication middleware
router.post('/tinea', 
  authenticateToken, // Check JWT token
  upload.single('file'), 
  async (req, res) => { ... }
);
```

---

## CORS Configuration

Currently CORS is likely open. For production, restrict:

```typescript
const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
```

---

## Caching Considerations

The API does not cache results. For production optimization:

```typescript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

// Cache successful results by file hash
const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
const cached = cache.get(hash);
if (cached) return cached;
```

---

## Timeout Configuration

Current timeout for image processing:

```typescript
// Default Express timeout is 120 seconds
// For production, consider reducing to 30 seconds:

router.post('/tinea', 
  upload.single('file'), 
  async (req, res) => {
    // Processing should complete within 30 seconds
  }
);
```

---

## Versioning

Current API version: `v1` (implicit)

Future versions:
```
/api/v2/detect/tinea
/api/v3/detect/tinea
```

---

## Webhooks (Future)

For async processing:

```json
POST /api/detect/tinea/async
{
  "image_url": "https://...",
  "callback_url": "https://yourapp.com/callback"
}

Response:
{
  "job_id": "uuid",
  "status": "processing"
}
```

---

## Batch Processing (Future)

For multiple images:

```json
POST /api/detect/tinea/batch
{
  "files": [file1, file2, file3]
}

Response:
{
  "results": [result1, result2, result3]
}
```

---

## WebSocket Support (Future)

For real-time analysis:

```javascript
const ws = new WebSocket('ws://localhost:4000/api/detect/tinea/stream');

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log(result);
};
```

---

## Monitoring & Logging

Each API call logs:
- Timestamp
- Request size
- Processing time
- Response status
- Error details (if any)

Access logs in:
```
backend/logs/detection.log
```

---

## Performance Metrics

Typical response times:

```
File upload:        < 1 second
Image preprocessing: < 0.5 seconds
Ensemble inference: 2-4 seconds (60 inferences)
Response generation: < 0.5 seconds
Total:              ~3-5 seconds
```

---

## Deprecation Policy

- New API versions every 6 months
- Old versions supported for 2 years
- Notification 6 months before deprecation
- Gradual transition period

---

## Support & Documentation

- **API Docs**: `/api/docs` (Swagger/OpenAPI)
- **Status**: `/api/health` (Health check)
- **Version**: `/api/version` (Current API version)

---

**Last Updated**: December 29, 2025
**API Version**: 1.0
**Endpoint**: POST /api/detect/tinea
