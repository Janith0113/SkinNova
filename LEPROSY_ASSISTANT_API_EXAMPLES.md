# Leprosy Care Assistant - API Examples & Usage Guide

## Authentication

All API requests require a JWT token in the Authorization header:

```bash
Authorization: Bearer {token}
```

Get your token from login response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "123...", "email": "patient@example.com" }
}
```

## API Endpoints Reference

### Base URL
```
http://localhost:4000/api/leprosy
```

---

## 1. Symptom Logging

### Create/Log Symptom Entry
**Endpoint:** `POST /symptom-log`

**Request:**
```bash
curl -X POST http://localhost:4000/api/leprosy/symptom-log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_from_token",
    "symptoms": {
      "skinPatches": true,
      "numbness": false,
      "weakness": true,
      "eyeIssues": false,
      "painfulNerves": false,
      "other": "Slight redness on left arm"
    },
    "notes": "Noticed new patch on left forearm, size approximately 5cm. No pain but some itching. Temperature slightly different from surrounding skin."
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Symptoms logged successfully",
  "symptomLog": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "user_123",
    "symptoms": {
      "skinPatches": true,
      "numbness": false,
      "weakness": true,
      "eyeIssues": false,
      "painfulNerves": false,
      "other": "Slight redness on left arm"
    },
    "notes": "Noticed new patch on left forearm...",
    "timestamp": "2026-01-05T10:30:00.000Z",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T10:30:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Missing required fields"
}
```

---

## 2. Retrieve Symptom History

### Get All Symptom Logs (Last 30)
**Endpoint:** `GET /symptom-logs`

**Request:**
```bash
curl -X GET http://localhost:4000/api/leprosy/symptom-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": "user_123",
      "symptoms": {
        "skinPatches": true,
        "numbness": false,
        "weakness": true,
        "eyeIssues": false,
        "painfulNerves": false,
        "other": ""
      },
      "notes": "Left forearm patch improving",
      "timestamp": "2026-01-05T10:30:00.000Z",
      "createdAt": "2026-01-05T10:30:00.000Z",
      "updatedAt": "2026-01-05T10:30:00.000Z"
    },
    {
      "_id": "65a0b2c3d4e5f6g7h8i9j0k0",
      "userId": "user_123",
      "symptoms": {
        "skinPatches": false,
        "numbness": true,
        "weakness": false,
        "eyeIssues": false,
        "painfulNerves": true,
        "other": ""
      },
      "notes": "Sensation loss in fingertips",
      "timestamp": "2026-01-02T14:15:00.000Z",
      "createdAt": "2026-01-02T14:15:00.000Z",
      "updatedAt": "2026-01-02T14:15:00.000Z"
    }
  ]
}
```

### Get Latest Symptom Log
**Endpoint:** `GET /latest-symptom-log`

**Request:**
```bash
curl -X GET http://localhost:4000/api/leprosy/latest-symptom-log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "latestLog": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "user_123",
    "symptoms": {
      "skinPatches": true,
      "numbness": false,
      "weakness": true,
      "eyeIssues": false,
      "painfulNerves": false,
      "other": "Slight redness"
    },
    "notes": "Left forearm patch improving",
    "timestamp": "2026-01-05T10:30:00.000Z",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T10:30:00.000Z"
  }
}
```

---

## 3. Chat with AI Assistant

### Send Message to Assistant
**Endpoint:** `POST /chat/leprosy-assistant`

**Request Examples:**

#### Example 1: Medication Question
```bash
curl -X POST http://localhost:4000/api/leprosy/chat/leprosy-assistant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How important is it to take my medications on time?",
    "userId": "user_123",
    "context": "leprosy_care"
  }'
```

**Response:**
```json
{
  "success": true,
  "reply": "Medication adherence is critical for leprosy treatment. Take your MDT (Multi-Drug Therapy) medications exactly as prescribed, typically for 6-12 months depending on classification. Set daily reminders to avoid missing doses. If you experience side effects, report them to your healthcare provider immediately—do not stop medication on your own.",
  "context": "leprosy_care"
}
```

#### Example 2: Skin Monitoring Question
```bash
curl -X POST http://localhost:4000/api/leprosy/chat/leprosy-assistant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I found a new patch on my skin. What should I do?",
    "userId": "user_123",
    "context": "leprosy_care"
  }'
```

**Response:**
```json
{
  "success": true,
  "reply": "Monitor your skin regularly for changes in existing patches or new lesions. Document any changes with photos and notes. Report new patches immediately to your healthcare provider. Check for loss of sensation in affected areas using temperature and touch tests.",
  "context": "leprosy_care"
}
```

#### Example 3: Nerve-Related Question
```bash
curl -X POST http://localhost:4000/api/leprosy/chat/leprosy-assistant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I check if I have nerve damage?",
    "userId": "user_123",
    "context": "leprosy_care"
  }'
```

**Response:**
```json
{
  "success": true,
  "reply": "Nerve involvement is a key feature of leprosy. Perform daily sensation checks on affected areas—test with light touch, temperature, and pin prick. Exercise regularly to maintain nerve function. Report any new numbness, weakness, or pain to your doctor immediately.",
  "context": "leprosy_care"
}
```

#### Example 4: Exercise Question
```bash
curl -X POST http://localhost:4000/api/leprosy/chat/leprosy-assistant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can I exercise while being treated for leprosy?",
    "userId": "user_123",
    "context": "leprosy_care"
  }'
```

**Response:**
```json
{
  "success": true,
  "reply": "Regular, gentle exercise helps maintain nerve and muscle function. Safe activities include: walking, swimming, yoga, stretching, and light strength training. Avoid contact sports and activities that risk injury to affected limbs. Consult your doctor about appropriate activities.",
  "context": "leprosy_care"
}
```

---

## 4. Retrieve Chat History

### Get All Messages
**Endpoint:** `GET /chat-history`

**Request:**
```bash
curl -X GET http://localhost:4000/api/leprosy/chat-history \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "text": "How important is medication?",
      "sender": "user",
      "timestamp": "2026-01-05T10:00:00.000Z"
    },
    {
      "text": "Medication adherence is critical...",
      "sender": "assistant",
      "timestamp": "2026-01-05T10:00:05.000Z"
    },
    {
      "text": "What about exercise?",
      "sender": "user",
      "timestamp": "2026-01-05T10:15:00.000Z"
    },
    {
      "text": "Regular, gentle exercise helps...",
      "sender": "assistant",
      "timestamp": "2026-01-05T10:15:05.000Z"
    }
  ]
}
```

---

## 5. Clear Chat History

### Delete All Chat Messages
**Endpoint:** `DELETE /chat-history`

**Request:**
```bash
curl -X DELETE http://localhost:4000/api/leprosy/chat-history \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

## JavaScript/Fetch Examples

### Log Symptoms (JavaScript)
```javascript
async function logSymptoms() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4000/api/leprosy/symptom-log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: 'user_123',
      symptoms: {
        skinPatches: true,
        numbness: false,
        weakness: true,
        eyeIssues: false,
        painfulNerves: false,
        other: 'Slight redness'
      },
      notes: 'Observation from today'
    })
  });
  
  const data = await response.json();
  console.log('Symptom logged:', data);
}
```

### Send Chat Message (JavaScript)
```javascript
async function sendChatMessage(message) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await fetch('http://localhost:4000/api/leprosy/chat/leprosy-assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: message,
      userId: user._id,
      context: 'leprosy_care'
    })
  });
  
  const data = await response.json();
  return data.reply;
}
```

### Get Symptom History (JavaScript)
```javascript
async function getSymptomLogs() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4000/api/leprosy/symptom-logs', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.logs;
}
```

### Get Chat History (JavaScript)
```javascript
async function getChatHistory() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4000/api/leprosy/chat-history', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.messages;
}
```

---

## Response Keywords & Categories

The AI assistant recognizes these keyword patterns:

### Medication
- Keywords: medication, medicine, mdt, drug, pill
- Response: Importance of adherence, dosage, side effects

### Skin
- Keywords: skin, patch, lesion, spot
- Response: Monitoring, documentation, sensation testing

### Nerves
- Keywords: nerve, sensation, numbness, weakness
- Response: Daily checks, exercises, protective measures

### Cure
- Keywords: cure, curable, recovery, prognosis
- Response: Cure rates, timeline, expectations

### Contagious
- Keywords: contagious, spread, transmit, infectious
- Response: Transmission info, treatment effect on contagiousness

### Eyes
- Keywords: eye, vision, sight, eyebrow
- Response: Eye care, protective measures, monitoring

### Diet
- Keywords: diet, food, nutrition, eat
- Response: Food recommendations, healing support

### Exercise
- Keywords: exercise, activity, sport, physical
- Response: Safe activities, progression, precautions

### Doctor
- Keywords: doctor, appointment, visit, checkup
- Response: Appointment importance, preparation, frequency

### Complications
- Keywords: complication, reaction, type
- Response: Warning signs, treatment, monitoring

---

## Error Responses

### Missing Authentication
```json
{
  "error": "Unauthorized"
}
```

### Invalid Input
```json
{
  "error": "Missing required fields"
}
```

### Database Error
```json
{
  "error": "Failed to log symptoms"
}
```

### Not Found
```json
{
  "error": "Chat not found"
}
```

---

## Rate Limiting & Best Practices

✅ **Recommended:**
- Set 100ms minimum delay between messages
- Use pagination for large datasets
- Cache responses locally
- Handle network errors gracefully

⚠️ **Avoid:**
- Rapid-fire API requests
- Duplicate message submissions
- Missing authentication headers
- Storing sensitive data in localStorage

---

## Testing Checklist

- [ ] Test symptom logging with various symptoms
- [ ] Verify symptom history retrieval
- [ ] Test chat with different keywords
- [ ] Verify chat history persistence
- [ ] Test chat clearing
- [ ] Test error handling
- [ ] Test authentication failures
- [ ] Load testing with multiple messages
- [ ] Database connection failures
- [ ] Network timeout handling

---

**API Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅
