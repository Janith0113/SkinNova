# Leprosy Care Assistant - Implementation Guide

## Overview

The Leprosy Care Assistant is a comprehensive personalized support system designed specifically for leprosy patients. It provides AI-powered chat support, symptom tracking, lifestyle schedules, and a Q&A platform for self-care management.

## Features

### 1. **AI Chat Assistant** 💬
- Real-time conversational support for leprosy-related questions
- Intelligent responses about:
  - Medication and MDT adherence
  - Skin monitoring and patch detection
  - Nerve function and sensation management
  - Treatment progress and cure rates
  - Disease transmission and contagiousness
  - Eye care (if affected)
  - Diet and nutrition guidance
  - Exercise and physical activity recommendations
  - Doctor visits and appointments
  - Complications and reactions management
  - Daily care routines

**Key Features:**
- Persistent chat history stored in database
- Context-aware responses
- 24/7 availability
- Non-judgmental support

### 2. **Symptom Tracking** 📋
Track the following symptoms with detailed notes:
- New or changing skin patches
- Numbness or loss of sensation
- Weakness in hands or feet
- Eye issues or vision problems
- Painful or thickened nerves
- Other custom symptoms and observations

**Features:**
- Date and time stamped logs
- Detailed notes for each entry
- Historical tracking
- Easy sharing with healthcare providers

### 3. **Lifestyle Schedule** 📅
Personalized daily schedule including:
- Morning and evening medications
- Skin care routines
- Nerve function checks
- Light exercise sessions
- Symptom documentation
- Weekly reviews

**Schedule Details:**
- Activity descriptions and guidance
- Time-specific reminders
- Progressive routine from Monday to Sunday
- Tips for consistency and adherence

### 4. **Q&A Platform** ❓
Comprehensive FAQ database with 8+ common questions covering:
- **Detection:** How to identify new patches
- **Care:** Daily skin and personal care
- **Prevention:** Avoiding complications
- **Medication:** Importance of adherence
- **Lifestyle:** Exercise and nutrition
- **Medical:** Doctor visit frequency
- **Nutrition:** Dietary recommendations
- **Complications:** Managing reactions

**Features:**
- Searchable database
- Expandable/collapsible answers
- Category-based organization
- Continuously updated

## Frontend Implementation

### Files Created/Modified

1. **[frontend/app/leprosy/assistant/page.tsx](frontend/app/leprosy/assistant/page.tsx)** (NEW)
   - Main page component for the leprosy assistant
   - Tab-based navigation for all four features
   - Responsive design with Tailwind CSS
   - Real-time message handling
   - Form validation and submission

2. **[frontend/app/patient/dashboard/page.tsx](frontend/app/patient/dashboard/page.tsx)** (MODIFIED)
   - Added "💬 Care Assistant" button on leprosy card
   - Only visible when "Leprosy" disease tab is selected
   - Navigates to `/leprosy/assistant` route

### Component Features

- **Responsive Design:** Works on mobile, tablet, and desktop
- **Real-time Updates:** Messages update instantly
- **Clean UI:** Red/orange gradient theme for leprosy
- **Accessibility:** Proper semantic HTML and ARIA labels
- **State Management:** React hooks for all features
- **Error Handling:** Graceful fallback responses

## Backend Implementation

### Files Created/Modified

1. **[backend/src/models/SymptomLog.ts](backend/src/models/SymptomLog.ts)** (NEW)
   - MongoDB schema for storing symptom logs
   - Fields: userId, symptoms object, notes, timestamp
   - Indexed by userId for fast queries

2. **[backend/src/models/LeprosyAssistantChat.ts](backend/src/models/LeprosyAssistantChat.ts)** (NEW)
   - MongoDB schema for chat history
   - Stores user and assistant messages
   - Automatic message length management (last 100 messages)

3. **[backend/src/routes/leprosy.ts](backend/src/routes/leprosy.ts)** (NEW)
   - Complete API endpoints for leprosy features
   - Endpoints included:
     - `POST /symptom-log` - Log new symptoms
     - `GET /symptom-logs` - Get symptom history
     - `GET /latest-symptom-log` - Get most recent log
     - `POST /chat/leprosy-assistant` - Chat endpoint
     - `GET /chat-history` - Retrieve chat messages
     - `DELETE /chat-history` - Clear chat history

4. **[backend/src/index.ts](backend/src/index.ts)** (MODIFIED)
   - Imported leprosy routes
   - Registered routes at `/api/leprosy` prefix

### API Endpoints

#### Symptom Logging
```
POST /api/leprosy/symptom-log
Authorization: Bearer {token}
Body: {
  userId: string,
  symptoms: {
    skinPatches: boolean,
    numbness: boolean,
    weakness: boolean,
    eyeIssues: boolean,
    painfulNerves: boolean,
    other: string
  },
  notes: string
}
Response: { success: true, symptomLog: {...} }
```

#### Get Symptom History
```
GET /api/leprosy/symptom-logs
Authorization: Bearer {token}
Response: { success: true, logs: [...] }
```

#### Chat with Assistant
```
POST /api/leprosy/chat/leprosy-assistant
Authorization: Bearer {token}
Body: {
  message: string,
  userId: string,
  context: string
}
Response: { success: true, reply: string, context: string }
```

#### Get Chat History
```
GET /api/leprosy/chat-history
Authorization: Bearer {token}
Response: { success: true, messages: [...] }
```

#### Clear Chat History
```
DELETE /api/leprosy/chat-history
Authorization: Bearer {token}
Response: { success: true, message: "Chat history cleared" }
```

## AI Response Generation

The assistant uses intelligent keyword matching to provide relevant responses for:

1. **Medication-related queries**
   - Importance of MDT adherence
   - Dosage instructions
   - Side effect management
   - Resistance prevention

2. **Skin monitoring**
   - Patch detection techniques
   - Documentation methods
   - Sensation testing
   - Progress tracking

3. **Nerve management**
   - Daily sensation checks
   - Exercise recommendations
   - Protective measures
   - Complication prevention

4. **Treatment and prognosis**
   - Cure rates and timeline
   - Treatment duration
   - Recovery expectations
   - Follow-up requirements

5. **Contagiousness**
   - Transmission routes
   - Non-infectious status timeline
   - Contact precautions
   - Family member monitoring

6. **Lifestyle and wellness**
   - Eye care protocols
   - Nutrition guidelines
   - Exercise safety
   - Daily routines

## Usage Flow

### For Patients

1. **Access the Assistant**
   - Go to Patient Dashboard
   - Select "Leprosy" from disease tabs
   - Click "💬 Care Assistant" button

2. **Use Chat Feature**
   - Ask questions about treatment
   - Get guidance on symptoms
   - Receive medication reminders
   - Get lifestyle tips

3. **Track Symptoms**
   - Switch to "Symptoms" tab
   - Check relevant symptoms
   - Add detailed notes
   - Submit log

4. **Follow Schedule**
   - View daily care activities
   - Set phone reminders
   - Track adherence
   - Document completion

5. **Get Answers**
   - Browse Q&A section
   - Search for specific topics
   - Expand questions for answers
   - Share with healthcare provider

## Technical Details

### Database Models

**SymptomLog:**
- userId (indexed)
- symptoms (object with 6 boolean/string fields)
- notes (text)
- timestamp
- createdAt, updatedAt

**LeprosyAssistantChat:**
- userId (unique, indexed)
- messages array (100 max)
  - text
  - sender ('user' | 'assistant')
  - timestamp

### Authentication

All endpoints require JWT authentication via `requireAuth` middleware:
- Token passed in Authorization header
- userId extracted from token
- User must be authenticated patient

### Error Handling

- Input validation for all endpoints
- Graceful fallback responses
- Detailed error logging
- User-friendly error messages
- Automatic response generation if API fails

## Deployment Checklist

- [ ] MongoDB collections created
- [ ] Backend routes registered in index.ts
- [ ] Frontend page created
- [ ] Dashboard button added
- [ ] Test symptom logging
- [ ] Test chat functionality
- [ ] Test FAQ search
- [ ] Verify schedule display
- [ ] Test on mobile devices
- [ ] Test authentication

## Future Enhancements

1. **Integration with AI Services**
   - OpenAI API integration for advanced responses
   - Machine learning-based symptom analysis
   - Predictive health insights

2. **Data Visualization**
   - Symptom trend charts
   - Progress dashboards
   - Medication adherence graphs

3. **Additional Features**
   - Photo-based symptom tracking
   - Doctor appointment integration
   - Medication reminders with notifications
   - Community support forum
   - Resource library
   - Telemedicine consultation booking

4. **Personalization**
   - User-customized schedule
   - Preferred language support
   - Accessibility features
   - Dark mode theme

## Support and Maintenance

For issues or questions:
1. Check FAQ database
2. Use symptom tracking to document issues
3. Ask assistant for guidance
4. Contact healthcare provider
5. Report technical issues to admin

## Important Notes

- This assistant complements, not replaces, professional medical care
- Always consult healthcare provider for medical decisions
- Emergency symptoms require immediate medical attention
- Keep regular doctor appointments
- Maintain medication adherence
- Document all symptoms and concerns

---

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Active
