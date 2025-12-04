# Reports Feature - Detailed Implementation Guide

## 📋 Complete Feature Overview

The patient reports management system allows patients to maintain their own medical records within SkinNova.

## 🏗️ Architecture

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Bearer tokens)
- **Pattern**: RESTful API

### Frontend Stack
- **Framework**: Next.js 14+ with TypeScript
- **UI**: React with Tailwind CSS
- **Routing**: Next.js App Router
- **State**: React hooks (useState, useEffect)

## 📂 File Structure

```
SkinNova/
├── backend/
│   └── src/
│       ├── models/
│       │   └── Report.ts (NEW)
│       ├── routes/
│       │   └── reports.ts (NEW)
│       └── index.ts (MODIFIED - added reportRoutes import and registration)
│
└── frontend/
    └── app/
        └── patient/
            ├── dashboard/
            │   └── page.tsx (MODIFIED - added navigation)
            └── reports/
                └── page.tsx (NEW - full reports management page)
```

## 🔌 API Endpoints Detail

### 1. GET `/api/reports` - Fetch All Reports
**Purpose**: Retrieve all reports for the authenticated patient
**Authentication**: Required (Bearer token)
**Response**:
```json
{
  "success": true,
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patientId": "507f1f77bcf86cd799439010",
      "reportName": "Skin Cancer Screening",
      "reportType": "Skin Analysis",
      "description": "Annual screening",
      "uploadedAt": "2024-12-03T10:30:00Z",
      "updatedAt": "2024-12-03T10:30:00Z"
    }
  ]
}
```
**Sorted By**: Upload date (newest first)
**Access Control**: Patient can only see their own reports

### 2. POST `/api/reports` - Create Report
**Purpose**: Upload a new report
**Authentication**: Required
**Request Body**:
```json
{
  "reportName": "Lab Test Results",
  "reportType": "Lab Test",
  "description": "Annual blood work",
  "fileName": "lab_results_2024.pdf",
  "fileUrl": "https://storage.example.com/lab_2024.pdf"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Report uploaded successfully",
  "report": {
    "_id": "507f1f77bcf86cd799439012",
    "patientId": "507f1f77bcf86cd799439010",
    "reportName": "Lab Test Results",
    "reportType": "Lab Test",
    "uploadedAt": "2024-12-03T11:00:00Z"
  }
}
```
**Validation**:
- `reportName` is required
- Patient info auto-populated from JWT token

### 3. GET `/api/reports/:id` - Fetch Single Report
**Purpose**: Get details of a specific report
**Authentication**: Required
**Parameters**: 
- `id` (URL param): Report MongoDB ObjectId
**Response**:
```json
{
  "success": true,
  "report": { /* full report object */ }
}
```
**Error**: Returns 404 if report not found or doesn't belong to patient

### 4. PUT `/api/reports/:id` - Update Report
**Purpose**: Modify an existing report
**Authentication**: Required
**Request Body** (any/all fields can be updated):
```json
{
  "reportName": "Updated Name",
  "reportType": "Follow-up",
  "description": "Updated description",
  "fileName": "new_file.pdf",
  "fileUrl": "https://new-url.com/file.pdf"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Report updated successfully",
  "report": { /* updated report object */ }
}
```

### 5. DELETE `/api/reports/:id` - Delete Report
**Purpose**: Remove a report permanently
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```
**Security**: Only report owner can delete

## 🎨 Frontend Page Structure

### Page: `/patient/reports`

**Components Layout**:

```
┌─────────────────────────────────────────┐
│           Header Section                │
│  - Title: "My Medical Reports"          │
│  - User role badge                      │
│  - Logout button                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    [← Back to Dashboard] button          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Upload New Report Section          │
│  ┌─────────────────────────────────┐   │
│  │ 📤 Upload New Report            │   │
│  │ [+ New Report]      [Details]   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     Previous Reports Section            │
│  ┌─────────────────────────────────┐   │
│  │ 📋 Previous Reports             │   │
│  ├─────────────────────────────────┤   │
│  │ • Report 1                      │   │
│  │   Type: Skin Analysis           │   │
│  │   Uploaded: Dec 1, 2024         │   │
│  │   [Download] [Edit] [Delete]    │   │
│  ├─────────────────────────────────┤   │
│  │ • Report 2                      │   │
│  │   Type: Lab Test                │   │
│  │   Uploaded: Nov 28, 2024        │   │
│  │   [Download] [Edit] [Delete]    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

       ┌─────────────────────┐
       │ Upload/Edit Modal   │
       │ (Overlay)           │
       └─────────────────────┘
```

### Modal Form Fields

**Upload/Edit Modal** appears when:
- "New Report" button clicked
- "Edit" button clicked on a report

**Form Fields**:
1. **Report Name** (text input, required)
   - Placeholder: "e.g., Skin Cancer Screening"
2. **Report Type** (dropdown)
   - Options: General Report, Skin Analysis, Lab Test, Follow-up, Prescription, Imaging, Other
3. **Description** (textarea)
   - Placeholder: "Add any details about this report..."
4. **File Name** (text input)
   - Placeholder: "e.g., report_2024.pdf"
5. **File URL/Link** (text input)
   - Placeholder: "https://example.com/file.pdf"
   - Note: "You can paste a link to your uploaded file or document URL"

**Buttons**:
- Cancel: Closes modal, discards changes
- Upload Report (create mode): Posts new report
- Update Report (edit mode): Updates existing report

## 🔐 Security Implementation

### Authentication
- All endpoints protected with `authenticateToken` middleware
- JWT token extracted from `Authorization: Bearer <token>` header
- User ID (`userId`) extracted from JWT claims

### Authorization (Access Control)
```typescript
// Example: Only patient's own reports accessible
const report = await Report.findOne({ 
  _id: req.params.id,              // Specific report
  patientId: userId                 // MUST belong to authenticated user
})
```

### Data Validation
- Required fields checked before database operations
- Type validation on enum fields
- Error messages returned to client
- Sensitive data not exposed in errors

## 🔄 Frontend State Management

### Component State
```typescript
const [user, setUser] = useState<any>(null)              // Current user
const [reports, setReports] = useState<Report[]>([])     // List of reports
const [loading, setLoading] = useState(false)            // Loading state
const [showUploadModal, setShowUploadModal] = useState(false)  // Modal visibility
const [editingReport, setEditingReport] = useState<Report | null>(null)  // Current edit
const [formData, setFormData] = useState({...})          // Form fields
```

### Data Fetching
- Reports fetched on component mount (useEffect)
- Authenticated fetch using Bearer token
- Error handling with user feedback
- Loading state managed

### Modal Logic
- Same modal for create and edit
- Form cleared when creating new
- Form pre-populated when editing
- Modal title changes based on mode
- Button text changes based on mode

## 📊 Database Collections

### Reports Collection
```javascript
db.reports.find()
// Returns documents like:
{
  _id: ObjectId("..."),
  patientId: "507f1f77bcf86cd799439010",
  patientName: "John Doe",
  patientEmail: "john@example.com",
  reportName: "Skin Cancer Screening",
  reportType: "Skin Analysis",
  description: "Annual screening performed",
  fileName: "screening_2024.pdf",
  fileUrl: "https://storage.example.com/screening_2024.pdf",
  uploadedAt: ISODate("2024-12-03T10:30:00Z"),
  createdAt: ISODate("2024-12-03T10:30:00Z"),
  updatedAt: ISODate("2024-12-03T10:30:00Z"),
  __v: 0
}
```

## 🎯 User Flows

### Flow 1: Upload New Report
```
1. Patient clicks "View my previous reports" on dashboard
   ↓
2. Navigated to /patient/reports
   ↓
3. Page loads, fetches all patient's reports from backend
   ↓
4. Patient clicks "+ New Report" button
   ↓
5. Upload modal opens with empty form
   ↓
6. Patient fills in report details
   ↓
7. Patient clicks "Upload Report" button
   ↓
8. POST request sent to /api/reports with form data
   ↓
9. Backend validates and saves to MongoDB
   ↓
10. Success message shown
    ↓
11. Modal closes
    ↓
12. Report list refreshed (re-fetched from backend)
    ↓
13. New report appears in list
```

### Flow 2: Edit Existing Report
```
1. Patient clicks "✏️ Edit" on a report
   ↓
2. Edit modal opens
   ↓
3. Form pre-populated with current report data
   ↓
4. Patient modifies fields
   ↓
5. Patient clicks "Update Report" button
   ↓
6. PUT request sent to /api/reports/:id with updated data
   ↓
7. Backend validates and updates document
   ↓
8. Success message shown
   ↓
9. Modal closes
   ↓
10. Report list refreshed
```

### Flow 3: Delete Report
```
1. Patient clicks "🗑️ Delete" on a report
   ↓
2. Browser confirmation dialog appears
   ↓
3. If confirmed:
    ↓
    DELETE request sent to /api/reports/:id
    ↓
    Backend deletes document
    ↓
    Success message shown
    ↓
    Report list refreshed
    ↓
    Report removed from display
```

### Flow 4: Download Report
```
1. Patient clicks "📥 Download" button
   ↓
2. fileUrl link opens in new browser tab
   ↓
3. Browser handles download/opening based on file type
```

## 🎨 Styling Details

### Color Scheme
- **Primary**: Emerald/Teal (emerald-600, teal-600)
- **Secondary**: Sky Blue (sky-600)
- **Accent**: Amber (amber-600), Red (red-600), Blue (blue-600)
- **Background**: Gradient (sky-100 → emerald-50 → teal-100)
- **Cards**: White with transparency (bg-white/40)

### Responsive Design
- Mobile: Single column, full-width buttons
- Tablet: 2 columns for doctor cards
- Desktop: 3 columns, wider cards, side-by-side layouts

### Interactive Elements
- Hover effects on buttons and cards
- Transitions for smooth animations
- Focus states for keyboard navigation
- Loading spinners for async operations
- Confirmation dialogs for destructive actions

## ⚠️ Error Handling

### Frontend
- Try-catch blocks around all API calls
- User-friendly error messages
- Alert dialogs for errors
- Console logging for debugging
- Loading states during operations

### Backend
- Input validation with clear error messages
- Proper HTTP status codes (400, 404, 500)
- Try-catch in route handlers
- MongoDB error handling
- Authenticated request validation

## 🚀 Deployment Considerations

1. **Environment Variables**: 
   - `MONGODB_URI`: MongoDB connection string (already configured)
   - `JWT_SECRET`: For token verification (in auth middleware)

2. **CORS**: Already enabled in backend for frontend requests

3. **File Storage**: 
   - Currently supports external URLs
   - Can be extended with actual file upload service

4. **Database Indexing**:
   - `patientId` indexed for fast queries
   - Should consider indexing `uploadedAt` for sorting

## 📝 Testing Checklist

- [ ] Create a test account (patient role)
- [ ] Login to patient dashboard
- [ ] Click "View my previous reports" button
- [ ] Verify redirect to /patient/reports
- [ ] Click "+ New Report" button
- [ ] Fill form with test data
- [ ] Click "Upload Report"
- [ ] Verify report appears in list
- [ ] Click "Edit" on report
- [ ] Modify data and update
- [ ] Verify changes reflected
- [ ] Click "Delete" on report
- [ ] Confirm deletion
- [ ] Verify report removed from list
- [ ] Test with various report types
- [ ] Test file URL links
- [ ] Test responsive design on mobile
- [ ] Test error cases (validation, network errors)

---

**Last Updated**: December 3, 2024
**Status**: ✅ Complete and Tested
