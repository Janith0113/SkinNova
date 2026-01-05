# Leprosy Care Assistant - Quick Start

## What Was Created

### 🎯 User-Facing Features
1. **Personalized AI Chat** - Ask questions, get guidance
2. **Symptom Logger** - Track symptoms with timestamps
3. **Daily Schedule** - Medication and care reminders
4. **Q&A Database** - 8+ comprehensive FAQs

### 📁 Files Created

**Frontend:**
- `frontend/app/leprosy/assistant/page.tsx` - Main assistant page

**Backend:**
- `backend/src/models/SymptomLog.ts` - Symptom storage
- `backend/src/models/LeprosyAssistantChat.ts` - Chat history
- `backend/src/routes/leprosy.ts` - API endpoints

**Documentation:**
- `LEPROSY_ASSISTANT_GUIDE.md` - Full guide

### 🔧 Files Modified

**Frontend:**
- `frontend/app/patient/dashboard/page.tsx` - Added "Care Assistant" button

**Backend:**
- `backend/src/index.ts` - Registered leprosy routes

## How to Use

### For Patients

**1. Access the Assistant:**
- Go to Patient Dashboard
- Click "Leprosy" tab
- Click "💬 Care Assistant" button

**2. Available Tabs:**
- **AI Chat:** Ask questions, get personalized responses
- **Symptoms:** Log current symptoms with notes
- **Schedule:** View daily care routine
- **Q&A:** Search and browse FAQs

### Features Overview

| Feature | Purpose | Data Saved |
|---------|---------|-----------|
| Chat | Ask questions, get guidance | Chat history |
| Symptoms | Track health status | Symptom logs with timestamp |
| Schedule | Daily care routine | Personalized schedule |
| Q&A | Common questions answered | FAQ database |

## API Endpoints

### Symptom Management
```
POST   /api/leprosy/symptom-log          - Log symptoms
GET    /api/leprosy/symptom-logs         - Get history
GET    /api/leprosy/latest-symptom-log   - Get latest entry
```

### Chat Management
```
POST   /api/leprosy/chat/leprosy-assistant - Send message
GET    /api/leprosy/chat-history           - Get chat history
DELETE /api/leprosy/chat-history           - Clear chat
```

## Testing

### Test Symptom Logging
1. Go to Symptoms tab
2. Select some symptoms
3. Add notes
4. Click "Log Symptoms"
5. Should see success message

### Test Chat
1. Go to AI Chat tab
2. Type a question (e.g., "How important is medication?")
3. Click Send
4. Should get relevant response
5. Try different topics:
   - Medication
   - Skin patches
   - Nerves
   - Exercise
   - Diet

### Test Q&A
1. Go to Q&A tab
2. Search for terms (e.g., "medication", "skin", "doctor")
3. Click questions to expand/collapse
4. Try category filtering

### Test Schedule
1. Go to Schedule tab
2. View weekly routine
3. Check all activities are displayed

## Integration Points

### In Dashboard
- Leprosy card shows "Care Assistant" button
- Button only visible when Leprosy tab is selected
- Clicking navigates to `/leprosy/assistant`

### Database
- SymptomLog: Stores all symptom entries
- LeprosyAssistantChat: Stores all messages
- Both indexed by userId for performance

## Smart Features

✅ **Intelligent Chat Responses**
- Detects keywords (medication, skin, nerves, etc.)
- Provides relevant, contextual answers
- Falls back to helpful default response
- Maintains conversation history

✅ **Symptom Tracking**
- Checkbox selection for common symptoms
- Free-text notes for detailed description
- Timestamps for all entries
- Historical tracking for patterns

✅ **Schedule Management**
- Pre-configured weekly routine
- Activity descriptions and guidance
- Monday-Sunday coverage
- Reminder-friendly format

✅ **Searchable Q&A**
- Real-time search filtering
- Category organization
- Expandable answers
- Easy to share with doctors

## Customization

### To Add More FAQs
Edit `frontend/app/leprosy/assistant/page.tsx`:
```typescript
const COMMON_FAQS: FAQ[] = [
  // Add new FAQ here
  {
    id: '9',
    question: 'Your question?',
    answer: 'Your answer here',
    category: 'Category'
  }
]
```

### To Customize Schedule
Edit `frontend/app/leprosy/assistant/page.tsx`:
```typescript
const DEFAULT_SCHEDULE: ScheduleItem[] = [
  // Modify or add activities
  {
    id: '1',
    day: 'Monday',
    time: '08:00 AM',
    activity: 'Your activity',
    description: 'Description'
  }
]
```

### To Add Chat Responses
Edit `backend/src/routes/leprosy.ts` in `generateAssistantResponse()`:
```typescript
if (lowerMessage.includes('your-keyword')) {
  const responses = [
    'Your response here'
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}
```

## Important Notes

⚠️ **This is Not Medical Advice**
- The assistant provides guidance and support
- Always consult healthcare provider for medical decisions
- Not a replacement for professional care
- Emergency symptoms require immediate medical attention

✅ **Data Security**
- All data requires authentication
- Chat history stored securely
- Symptom logs encrypted
- User privacy protected

## Troubleshooting

**Chat not working?**
- Check internet connection
- Ensure logged in
- Try browser refresh
- Check backend is running

**Symptoms not saving?**
- Check all required fields
- Ensure authentication token valid
- Check browser console for errors
- Verify MongoDB connection

**Q&A not loading?**
- Clear browser cache
- Check API endpoints
- Verify frontend code loaded
- Try different browser

## Next Steps

1. **Deploy:**
   - Push code to repository
   - Deploy frontend and backend
   - Verify all endpoints working

2. **Test:**
   - Create test user account
   - Test all features thoroughly
   - Check mobile responsiveness
   - Verify data persistence

3. **Monitor:**
   - Track usage statistics
   - Collect user feedback
   - Monitor error logs
   - Plan improvements

4. **Improve:**
   - Integrate with AI API (OpenAI)
   - Add photo-based tracking
   - Create data visualizations
   - Expand FAQ database

## Support

For issues or questions:
1. Check this guide first
2. Review implementation files
3. Check browser console for errors
4. Check backend logs for API errors
5. Contact development team

---

**Quick Version:** 1.0
**Date:** January 2026
