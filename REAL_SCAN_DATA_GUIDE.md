# SkinNova Patient Dashboard - Real Scan Data Integration

## Overview
The patient dashboard UI has been successfully updated to display real scan data from the backend. The system now:

1. **Fetches scan history** from MongoDB for each disease type
2. **Displays dynamic data** including:
   - Last scan timestamp (calculated automatically)
   - AI Risk Level (average confidence from recent scans)
   - Recent scan results with area, condition, and status
3. **Falls back to default data** if no scans exist yet

## How to Test

### Step 1: Create Sample Scan Data
Before testing, create sample scans for your patient account:

```bash
curl -X POST http://localhost:4000/api/analysis/create-sample-scans \
  -H "Content-Type: application/json" \
  -d '{"patientId": "YOUR_PATIENT_ID"}'
```

**Note:** Replace `YOUR_PATIENT_ID` with your actual patient MongoDB ID. You can get this from:
- Login to the app
- Open browser Developer Tools (F12)
- Go to Application > Local Storage
- Look for the `user` key and find the `_id` field

### Step 2: Log In to the Dashboard
1. Navigate to http://localhost:3000
2. Log in with your patient account
3. You should see the updated dashboard

### Step 3: View the Real Data
The dashboard will display:

#### Status Cards (Top Section)
- **Last Scan**: Will show "1 day ago", "3 days ago", etc. based on real scan data
- **AI Risk Level**: Will show "Low", "Medium", or "High" based on average confidence
- **Upcoming Plan**: Based on disease type

#### Recent Skin Checks
- Shows up to 3 most recent scans
- Displays scan area, condition, confidence, and status
- Status badges auto-color based on condition (Stable=green, Improving=blue, etc.)

#### Disease Tabs
Switch between these to see different scan data:
- Psoriasis
- Tinea
- Leprosy
- Skin Cancer

## Backend Endpoints

### Get All Scans (Authenticated)
```bash
GET /api/analysis/all-scans
Authorization: Bearer YOUR_TOKEN
```
Returns all scans grouped by disease type.

### Get Scans by Disease Type (Authenticated)
```bash
GET /api/analysis/scan-history/psoriasis
Authorization: Bearer YOUR_TOKEN
```
Returns scans for a specific disease type.

### Save a New Scan (Authenticated)
```bash
POST /api/analysis/save-scan
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "diseaseType": "psoriasis",
  "skinCondition": "Psoriasis",
  "confidence": 0.92,
  "scanArea": "Elbows",
  "scanStatus": "Stable",
  "reportName": "Psoriasis Scan - Elbows"
}
```

### Create Sample Scans (For Testing)
```bash
POST /api/analysis/create-sample-scans
Content-Type: application/json

{
  "patientId": "YOUR_PATIENT_ID"
}
```
Creates sample scans if they don't already exist for the patient.

## Database Schema Updates

### Report Model Enhanced Fields
```typescript
diseaseType: 'psoriasis' | 'tinea' | 'leprosy' | 'skinCancer'
skinCondition: string
confidence: number (0-1)
scanArea: string
scanStatus: 'Stable' | 'Improving' | 'Monitor' | 'Needs review' | 'Healed' | 'Under treatment'
imagePath: string
```

## Frontend Updates

### New State Variables
```typescript
scanData: { [key: string]: any[] }  // Scans grouped by disease type
loadingScans: boolean               // Loading state for scans
```

### New Functions
- `fetchAllScans()` - Fetches all scans from backend
- `getTimeSinceScan()` - Calculates "X days ago" format
- `getRecentScans()` - Gets last 3 scans for selected disease
- `getLatestScanDate()` - Gets formatted time since last scan
- `getAverageRiskLevel()` - Calculates risk from average confidence

### UI Components Updated
1. Status Cards - Now show real data instead of hardcoded values
2. Recent Skin Checks Section - Displays actual scan results
3. Falls back to default template data if no scans exist

## Sample Data Structure

Each scan includes:
```json
{
  "patientId": "6478...",
  "reportName": "Psoriasis Scan - Elbows",
  "reportType": "Skin Analysis",
  "diseaseType": "psoriasis",
  "skinCondition": "Psoriasis",
  "confidence": 0.92,
  "scanArea": "Elbows",
  "scanStatus": "Stable",
  "uploadedAt": "2024-01-01T10:00:00Z"
}
```

## Troubleshooting

### Scans Not Showing
1. Check browser console (F12) for errors
2. Verify patient ID is correct in localStorage
3. Check MongoDB connection in backend terminal
4. Run `create-sample-scans` endpoint to generate test data

### Risk Level Shows "No data"
- This is normal if no scans exist yet
- Run the create-sample-scans endpoint to add test data

### Time Since Scan Shows "No scans yet"
- Patient has no scans for that disease type
- All scans must have a `diseaseType` field and `uploadedAt` date

## Future Enhancements

1. Add scan image display functionality
2. Implement scan comparison between dates
3. Add predictive recommendations based on trend
4. Create scan history timeline view
5. Add export functionality for reports

## Files Modified

- `backend/src/models/Report.ts` - Added scan-specific fields
- `backend/src/routes/newDetection.ts` - Added scan history endpoints
- `frontend/app/patient/dashboard/page.tsx` - Updated to fetch and display real data
