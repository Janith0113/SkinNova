# Tinea Detection - System Architecture Diagram

## Overall Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                │
│                     (localhost:3000)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              FRONTEND - React + Next.js                      │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  1. Dashboard (/)                                            │ │
│  │     └─ Tinea Detection Card                                  │ │
│  │        └─ "🚀 Start Tinea Scan" Button                      │ │
│  │                                                              │ │
│  │  2. Tinea Detect (/tinea/detect)                             │ │
│  │     ├─ Image Upload UI                                       │ │
│  │     │  ├─ File Input                                         │ │
│  │     │  └─ Drag & Drop                                        │ │
│  │     │                                                        │ │
│  │     ├─ Image Preview                                         │ │
│  │     │                                                        │ │
│  │     ├─ Analysis State                                        │ │
│  │     │  └─ Loading Spinner                                    │ │
│  │     │                                                        │ │
│  │     ├─ Results Display                                       │ │
│  │     │  ├─ Tinea Type                                         │ │
│  │     │  ├─ Confidence Score                                   │ │
│  │     │  └─ Severity Color                                     │ │
│  │     │                                                        │ │
│  │     └─ Error Display 🆕                                      │ │
│  │        ├─ Error Message                                      │ │
│  │        └─ Troubleshooting Tips                               │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         CONSOLE LOGGING (DevTools F12 → Console)             │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  🔄 Sending image to backend...                              │ │
│  │  📍 Backend URL: http://localhost:4000/api/detect/tinea      │ │
│  │  📦 File: {name: '...', size: ..., type: '...'}              │ │
│  │  ✅ Backend response received: {status: 200, ...}            │ │
│  │  📊 Analysis results: {success: true, ...}                   │ │
│  │  ✨ Analysis successful!                                      │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└──────────┬──────────────────────────────────────────────────────────┘
           │
           │  HTTP POST Request
           │  Content-Type: multipart/form-data
           │  Body: FormData { file: <image> }
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND - Node.js/Express                     │
│                     (localhost:4000)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │          API Route: POST /api/detect/tinea                   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  1. Middleware: Multer File Upload                           │ │
│  │     ├─ Validate file type (JPG, PNG, WebP)                   │ │
│  │     └─ Validate file size (max 10MB)                         │ │
│  │                                                              │ │
│  │  2. File Handler                                             │ │
│  │     ├─ Check file exists                                     │ │
│  │     └─ Get file path                                         │ │
│  │                                                              │ │
│  │  3. Prediction Generation                                    │ │
│  │     ├─ Mock: Random type from list                           │ │
│  │     │  └─ ['Tinea Corporis', 'Tinea Pedis', ...]             │ │
│  │     └─ Real (future): ML Model inference                     │ │
│  │        └─ model.predict(imagePath)                           │ │
│  │                                                              │ │
│  │  4. Response Generation                                      │ │
│  │     └─ JSON: {success, tineaType, confidence, message}       │ │
│  │                                                              │ │
│  │  5. Cleanup                                                  │ │
│  │     └─ Delete temporary file                                 │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              ERROR HANDLING FLOW                             │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  ❌ No file uploaded                                          │ │
│  │     └─ Return 400: "No file uploaded"                        │ │
│  │                                                              │ │
│  │  ❌ Invalid file type                                         │ │
│  │     └─ Return 400: "Only image files allowed"                │ │
│  │                                                              │ │
│  │  ❌ File too large                                            │ │
│  │     └─ Return 413: "File too large"                          │ │
│  │                                                              │ │
│  │  ❌ Processing error                                          │ │
│  │     └─ Return 500: Error message                             │ │
│  │     └─ Cleanup: Delete file                                  │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└──────────┬──────────────────────────────────────────────────────────┘
           │
           │  HTTP Response (JSON)
           │  
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SUCCESS RESPONSE                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HTTP Status: 200                                                  │
│  Content-Type: application/json                                    │
│                                                                     │
│  Body:                                                              │
│  {                                                                  │
│    "success": true,                                                 │
│    "tineaType": "Tinea Corporis",                                   │
│    "confidence": 0.87,                                              │
│    "message": "Detected Tinea Corporis with 87% confidence"         │
│  }                                                                  │
│                                                                     │
│  Frontend receives → Parses JSON → Validates data.success           │
│  → Displays results with color coding                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                           OR

┌─────────────────────────────────────────────────────────────────────┐
│              ERROR RESPONSE                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HTTP Status: 500                                                  │
│  Content-Type: application/json                                    │
│                                                                     │
│  Body:                                                              │
│  {                                                                  │
│    "success": false,                                                │
│    "error": "Detection failed",                                     │
│    "message": "An error occurred during image analysis"             │
│  }                                                                  │
│                                                                     │
│  Frontend receives → Checks response.ok (false)                     │
│  → Extracts error message                                          │
│  → Displays error box with troubleshooting                         │
│  → Logs to console with ❌ emoji                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence Diagram

```
Browser              Frontend App              Backend API
  │                      │                          │
  │─── Click "Start  ────▶│                          │
  │  Tinea Scan"         │                          │
  │                      │                          │
  │◀── Navigate to  ──────│                          │
  │   /tinea/detect      │                          │
  │                      │                          │
  │─── Select image ─────▶│                          │
  │                      │ Generate preview         │
  │◀── Show preview ──────│                          │
  │                      │                          │
  │─── Click Analyze ────▶│                          │
  │                      │ 🔄 Log: Sending...       │
  │                      │ Create FormData          │
  │                      │ POST request             │
  │                      │───────────────────────▶  │
  │                      │                   Receive request
  │                      │                   ✅ Log: Response received
  │                      │                   Generate prediction
  │                      │                   Cleanup temp file
  │                      │                   Return JSON
  │                      │◀─────────────────────────│
  │                      │ 📊 Log: Results received  │
  │                      │ Parse JSON               │
  │                      │ Validate data.success    │
  │◀── Show results ──────│ ✨ Log: Success!        │
  │   (if success)       │                          │
  │                      │                          │
  │ [Tinea Type: ...]    │                          │
  │ [Confidence: 87%]    │                          │
  │ [Severity color]     │                          │
  │ [Change] [Reset]     │                          │
  │                      │                          │
  │─── Click Change ─────▶│ Clear state              │
  │                      │ Back to upload           │
  │◀── Reset UI ─────────│                          │
  │                      │                          │
```

---

## Error Handling Flow Diagram

```
User uploads image
    │
    ▼
┌─────────────────┐
│ Browser Console │──────▶ 🔄 Sending image to backend...
│  (with emojis)  │──────▶ 📍 Backend URL: http://localhost:4000/...
└────────┬────────┘──────▶ 📦 File: {name: '...', size: ...}
         │
         ▼
    Fetch Request
    (multipart/form-data)
         │
         ▼
    ┌──────────┐
    │ Backend  │
    │ Responds │
    └────┬─────┘
         │
    ┌────┴────────────────────┐
    │                         │
    ▼ Success (200)           ▼ Error (5xx) or Network Error
┌─────────────────┐      ┌──────────────────────┐
│ Parse JSON      │      │ Check response.ok    │
│ Validate        │      │ → false              │
│ data.success    │      │                      │
└────────┬────────┘      └──────────┬───────────┘
         │                          │
         │ true                     ▼
         │                  ┌──────────────────────┐
         ▼                  │ Check Backend Status │
    ┌─────────────┐        │ - status === 0?      │
    │ Display     │        │ - statusText empty?  │
    │ Results     │        └──────────┬───────────┘
    │             │                   │
    │ Tinea Type  │    ┌──────────────┴─────────────┐
    │ Confidence  │    │                            │
    │ Color       │    ▼                            ▼
    └────┬────────┘  Backend not          Backend error
         │          running              (503/404/etc)
         │              │                    │
         ▼              ▼                    ▼
    Browser  Console:  Console:          Console:
    ✅ Backend      ❌ Backend not      ❌ Backend error:
       response      reachable           503 - Model
       received                          not available
    📊 Analysis
       results    Error Box:          Error Box:
    ✨ Success!   "Backend server     "Backend error:
                  is not running."    503 - Tinea..."

                  Troubleshooting:    Troubleshooting:
                  1. Check backend    1. Check model
                  2. Port 4000        2. Integration
                  3. npm run dev      3. File size
                  └─────────────┬─────┘
                                │
                                ▼
                          User sees detailed
                          error message with
                          actionable steps
```

---

## Component Hierarchy

```
App (/)
├── Layout
│   ├── Navbar
│   ├── Main Content
│   │   ├── Dashboard
│   │   │   ├── Header
│   │   │   ├── Stats Cards
│   │   │   ├── Tinea Detection Card ⭐
│   │   │   │   └─ "🚀 Start Tinea Scan" Button
│   │   │   │      → Navigates to /tinea/detect
│   │   │   └── Other Detection Cards
│   │   │
│   │   └── Tinea Detect (/tinea/detect) ⭐
│   │       ├── Image Upload Section
│   │       │   ├── File Input
│   │       │   └── Drag Drop Area
│   │       │
│   │       ├── Image Preview
│   │       │   ├── Preview Image
│   │       │   └── File Info
│   │       │
│   │       ├── Analysis State
│   │       │   ├── Loading Spinner
│   │       │   └── "Analyzing image..." Text
│   │       │
│   │       ├── Results Section 🎯
│   │       │   ├── Tinea Type Display
│   │       │   ├── Confidence Score
│   │       │   ├── Severity Color Indicator
│   │       │   └── Action Buttons
│   │       │       ├── Change Image
│   │       │       └── Reset
│   │       │
│   │       └── Error Section ⚠️ (NEW)
│   │           ├── Error Icon
│   │           ├── Error Message
│   │           └── Troubleshooting Tips
│   │               ├── Step 1: Check backend running
│   │               ├── Step 2: Verify port 4000
│   │               └── Step 3: Check endpoint exists
│   │
│   ├── Footer
│   └── Medical Disclaimer
│
└── Global Styles
```

---

## File Upload Process Diagram

```
User clicks File Input or Drag-Drops Image
    │
    ▼
handleImageSelect(file)
    │
    ├─ Browser reads file
    │  └─ FileReader API
    │     └─ Generates data URL
    │
    ├─ Display image preview
    │  └─ Preview state updated
    │
    └─ Send to backend
       │
       ├─ Create FormData
       │  └─ Append 'file' field with file blob
       │
       ├─ Log to console
       │  └─ 🔄 Sending...
       │  └─ 📍 Endpoint: /api/detect/tinea
       │  └─ 📦 File info: {name, size, type}
       │
       ├─ Fetch POST request
       │  └─ URL: http://localhost:4000/api/detect/tinea
       │  └─ Headers: Accept: application/json
       │
       └─ Wait for response
          │
          ├─ ✅ Success (200)
          │  ├─ Parse JSON
          │  ├─ Log 📊 Analysis results
          │  ├─ Validate data.success
          │  └─ Display results
          │
          └─ ❌ Error
             ├─ Check response.ok
             ├─ Log ❌ Error details
             ├─ Display error box
             └─ Show troubleshooting tips
```

---

## State Management Diagram

```
Component State (tinea/detect/page.tsx)

preview: string | null
    │
    ├─ null: No image selected
    ├─ data:image/... : Preview showing
    └─ Used for: Image display

predictions: Prediction[]
    │
    ├─ []: No predictions yet
    ├─ [{className: "Tinea Corporis", probability: 0.87}]: Results
    └─ Used for: Results display

loading: boolean
    │
    ├─ true: Analyzing image (show spinner)
    ├─ false: Not analyzing
    └─ Used for: Loading state toggle

error: string | null
    │
    ├─ null: No error
    ├─ "Backend server is not running...": With tips
    └─ Used for: Error display with troubleshooting

Actions:
    ├─ handleImageSelect(file) → Fetch & analyze
    ├─ handleFileSelect(e) → Get file from input
    ├─ handleDrop(e) → Get file from drag-drop
    └─ handleReset() → Clear all states
```

---

## Testing Workflow

```
1. Start Servers
   ├─ Backend: npm run dev (port 4000)
   └─ Frontend: npm run dev (port 3000)
            │
            ▼
2. Open Browser
   └─ http://localhost:3000
            │
            ▼
3. Navigate
   ├─ Click Dashboard
   └─ Click "Start Tinea Scan"
            │
            ▼
4. Test Success Path
   ├─ Upload valid image
   ├─ Check console (F12) for 🔄📍📦✅📊✨ logs
   ├─ Wait for results
   └─ Verify display correct
            │
            ▼
5. Test Error Path
   ├─ Stop backend server
   ├─ Try to upload image
   ├─ See "Backend server is not running"
   ├─ Check error box has troubleshooting
   └─ Check console has ❌ error log
            │
            ▼
6. Test Other Errors
   ├─ Upload invalid file type
   ├─ Upload file > 10MB
   └─ Verify error handling
            │
            ▼
7. Verify Complete
   ✅ All features working
   ✅ Error messages helpful
   ✅ Console logs detailed
   ✅ UI responsive
```

---

## Summary

The tinea detection system now has:
- ✅ Complete request/response flow
- ✅ Comprehensive error handling
- ✅ Detailed console logging
- ✅ User-friendly error messages
- ✅ Working API endpoint
- ✅ File validation and cleanup
- ✅ Ready for ML model integration
