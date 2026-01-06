# Leprosy Care Assistant - Personalization Feature Guide

## Overview
The Leprosy Care Assistant now includes a comprehensive **Profile Tab** that allows users to input their personal health metadata. This data is used by the AI assistant to provide **personalized, relevant guidance** tailored to each patient's specific condition and lifestyle.

## Features Implemented

### 1. **Frontend Profile Management Tab**
**Location**: `frontend/app/leprosy/assistant/page.tsx` - Profile Tab

#### User Input Sections:

**A. Personal Information**
- Age (number)
- Gender (Male/Female/Other)
- Weight (kg)
- Height (cm)

**B. Medical Information**
- **Leprosy Type**: Tuberculoid, Borderline, Lepromatous, Unknown
- **Treatment Status**: Ongoing, Completed, Not Started
- **Treatment Duration**: Months on MDT
- **Current Medications**: Add/remove multiple medications
- **Known Allergies**: Add/remove multiple allergies
- **Other Medical Conditions**: Add/remove comorbidities (e.g., Diabetes, Hypertension)

**C. Leprosy-Specific Information**
- **Affected Areas**: Add/remove specific body areas affected (e.g., "Left hand", "Right foot")
- **Nerve Involvement**: Checkbox for confirmed nerve damage
- **Eye Involvement**: Checkbox for ocular manifestations
- **Treatment Response**: Rating (Excellent/Good/Moderate/Poor/Unknown)

**D. Lifestyle Information**
- **Occupation**: Text field
- **Physical Activity Level**: Sedentary/Light/Moderate/Vigorous
- **Diet Type**: Vegetarian/Non-Vegetarian/Vegan
- **Sleep Hours**: Average hours per day (0-24)
- **Smoking Status**: Never/Former/Current

**E. Additional Information**
- **Treatment Goals**: Add/remove multiple goals (e.g., "Complete treatment", "Improve sensation")
- **Notes**: Free-text notes field for additional concerns

### 2. **Backend API Endpoints**

**Endpoint 1: Create/Update User Profile**
```
POST /api/leprosy/profile
Headers: Authorization: Bearer {token}
Body: Full profile object
Response: { success: true, profile: {...} }
```

**Endpoint 2: Retrieve User Profile**
```
GET /api/leprosy/profile
Headers: Authorization: Bearer {token}
Response: { success: true, profile: {...} }
```

**Endpoint 3: Delete User Profile**
```
DELETE /api/leprosy/profile
Headers: Authorization: Bearer {token}
Response: { success: true, message: "Profile deleted" }
```

### 3. **Database Model**
**File**: `backend/src/models/LeprosyUserProfile.ts`

The model stores:
- `userId`: Indexed field for quick lookups
- All profile sections with appropriate validation
- Timestamps for creation and updates
- Array fields for multiple values (medications, allergies, affected areas, etc.)

## Personalization Logic

### A. Leprosy Type-Specific Guidance
When user asks about **medications**:
- **Tuberculoid patients**: "Your MDT typically lasts 6 months..."
- **Lepromatous patients**: "Your MDT will be for 12 months..."

### B. Affected Areas-Specific Guidance
When user asks about **skin monitoring**:
- If affected areas are provided: "Pay special attention to your known affected areas: [areas]. Monitor these closely..."

### C. Nerve Involvement-Specific Guidance
When user asks about **nerves/sensation**:
- If nerve involvement confirmed: "It's critical to: (1) Perform daily sensation tests, (2) Do specific nerve exercises, (3) Wear protective gear, (4) Report any worsening immediately..."

### D. Eye Involvement-Specific Guidance
When user asks about **eyes/vision**:
- If eye involvement confirmed: "Daily eye care is essential. Use protective glasses, apply lubricating drops, report vision changes immediately..."

### E. Physical Activity-Specific Guidance
When user asks about **exercise/activity**:
- **Sedentary lifestyle**: "Start slowly with light activity: 10-minute walks, gentle stretching..."
- **Vigorous lifestyle**: "Maintain movement but adapt your routine. Avoid high-impact activities that risk injury..."

### F. Smoking Status-Specific Guidance
When user asks about **smoking/alcohol**:
- **Current smoker**: "Quitting is strongly recommended during treatment. Discuss nicotine replacement therapy..."
- **Former smoker**: "Great that you've quit! This supports better healing..."

### G. Comorbidity-Specific Guidance
When user asks about **complications**:
- If comorbidities exist: "Given your existing conditions [conditions], complications may interact differently. Ensure your doctor knows about all conditions..."

## Response Categories (Enhanced)

The AI assistant recognizes and responds to questions in these categories with personalized guidance:

1. **Medication Adherence** - Now includes leprosy type-specific timelines
2. **Skin Monitoring** - Now mentions specific affected areas
3. **Nerve Health** - Now references confirmed nerve involvement
4. **Treatment Efficacy** - General leprosy cure information
5. **Contagiousness** - Transmission and isolation information
6. **Eye Care** - Now specific if eye involvement confirmed
7. **Nutrition & Diet** - General dietary guidance
8. **Smoking & Alcohol** - Now personalized by smoking status
9. **Exercise & Activity** - Now tailored to activity level
10. **Medical Appointments** - Importance of follow-up care
11. **Complications & Reactions** - Now accounts for comorbidities
12. **Daily Care Routine** - Practical daily management tips

## User Experience Flow

1. **First Visit**: User lands on Assistant → Encouraged to fill Profile first
2. **Profile Setup**: User fills out Profile tab (can be partial)
3. **Save Profile**: Click "Save Profile" button → Success message
4. **Chat Usage**: Move to Chat tab → AI provides personalized responses based on profile
5. **Updates**: User can return to Profile tab anytime to update information

## Technical Implementation

### Frontend State Management
```typescript
const [profile, setProfile] = useState({
  personalInfo: { age, gender, weight, height },
  medical: { leprosyType, treatmentDuration, medications[], ... },
  leprosy: { affectedAreas[], nerveInvolvement, eyeInvolvement, ... },
  lifestyle: { occupation, physicalActivity, dietType, sleepHours, smokingStatus },
  goals: [],
  notes: ''
})
```

### Backend Logic
```typescript
// Fetch profile in chat endpoint
const userProfile = await LeprosyUserProfile.findOne({ userId })

// Pass to response generator
const reply = generateAssistantResponse(message, userProfile)

// Use profile data for personalization
if (userProfile?.medical?.leprosyType === 'tuberculoid') {
  // Personalized response for tuberculoid
}
```

## Benefits

1. **Better Guidance**: Responses are tailored to individual patient needs
2. **Increased Relevance**: Users feel the assistant understands their specific situation
3. **Safety**: Comorbidities and allergies inform guidance
4. **Engagement**: Personal data makes interactions more meaningful
5. **Progress Tracking**: Goals and treatment response help monitor journey

## Future Enhancements

1. Add profile photo
2. Integration with symptom logs for trend analysis
3. PDF export of personalized health plan
4. Medication reminder notifications
5. Integration with wearable health devices
6. Doctor access to anonymized profile data
7. Progress charts and recovery timeline
8. Personalized exercise video recommendations

## Error Handling

- All API endpoints include proper error handling
- Profile load fails gracefully (user can still use chat)
- Invalid data submissions return helpful error messages
- Toast notifications inform user of success/failure

## Security & Privacy

- Profile accessible only via authenticated routes
- User ID indexed for quick secure access
- Can be deleted anytime by user
- Data stored in MongoDB with proper indexing

---

**Implementation Date**: [Current Date]
**Version**: 1.0
**Status**: Ready for Testing
