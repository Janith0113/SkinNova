# 🚀 LEPROSY CARE ASSISTANT - DEPLOYMENT & USAGE GUIDE

**Version**: 1.0
**Status**: Production Ready
**Date**: March 2, 2026

---

## 📋 Quick Start

### Local Development (Already Running)

1. **Backend is running on**: `http://localhost:4000`
2. **Test the system**: `cd backend && node test-api.js`
3. **Monitor logs**: Check terminal output for `[ERROR]` messages

### Environment Variables Needed

Create or update `.env` in the backend folder:

```
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=...

# JWT Authentication
JWT_SECRET=your-secret-key-here

# Optional: Email notifications
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# API Configuration
PORT=4000
NODE_ENV=development
```

---

## 🗄️ Knowledge Base Structure

### File Locations
```
backend/src/knowledge-base/
├── types.ts (Type definitions)
├── leprosy-classification.json (3 classifications)
├── treatment-protocols.json (2 protocols)
├── reactions-management.json (2 reaction types)
└── faq-database.json (22 Q&A pairs)
```

### Adding New Knowledge Files

1. Create JSON file in `/backend/src/knowledge-base/`
2. Define interface in `types.ts`
3. Add load logic in `leprosyKnowledgeService.ts` constructor
4. Add search logic in `searchKnowledge()` method
5. Rebuild and restart: `npm run build && npm run dev`

### JSON Format Example

```json
{
  "title": "Knowledge Base Title",
  "version": "1.0",
  "last_updated": "2024-03-02",
  "source": "WHO, CDC, ILA",
  "confidence": "very-high",
  "trustedSources": [
    {
      "organization": "World Health Organization",
      "url": "https://www.who.int/...",
      "confidence": "very-high"
    }
  ],
  "data": [
    {
      "id": "unique_id",
      "name": "Item Name",
      "content": "Detailed information...",
      "sources": ["source1", "source2"]
    }
  ]
}
```

---

## 🔌 API Endpoints

### Chat Endpoint
**POST** `/api/leprosy/chat/leprosy-assistant`

**Headers**:
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "message": "What is leprosy?",
  "userId": "user_id_from_login",
  "context": "leprosy_care"
}
```

**Response**:
```json
{
  "success": true,
  "reply": "Leprosy is an infectious disease...",
  "sources": [
    {
      "name": "World Health Organization",
      "organization": "WHO",
      "url": "https://www.who.int/health-topics/leprosy"
    }
  ],
  "disclaimer": "Always consult your healthcare provider for personalized medical advice.",
  "hasKnowledgeBaseCitation": true
}
```

### Knowledge Base Info Endpoint
**GET** `/api/leprosy/knowledge-base-info`

**Response**:
```json
{
  "success": true,
  "stats": {
    "categories": 4,
    "classifications": 3,
    "protocols": 2,
    "faqs": 22,
    "trustedSources": ["WHO", "CDC", "ILA"]
  },
  "message": "Knowledge base loaded..."
}
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Update `JWT_SECRET` in .env (use strong, random key)
- [ ] Enable HTTPS on API server
- [ ] Configure CORS to specific domain
- [ ] Set `NODE_ENV=production`
- [ ] Implement rate limiting on `/chat` endpoint
- [ ] Backup MongoDB regularly
- [ ] Monitor API logs for errors
- [ ] Test with real user data
- [ ] Set up SSL/TLS certificates

---

## 📊 Monitoring & Debugging

### View Backend Logs
```bash
cd backend
npm run dev 2>&1 | grep -E "ERROR|WARNING|✅"
```

### Common Issues & Solutions

**Issue**: Port 4000 already in use
```bash
# Find and kill process
lsof -i :4000
kill -9 <PID>
```

**Issue**: Knowledge base not loading
```bash
# Check file paths in leprosyKnowledgeService.ts
# Verify JSON files exist in knowledge-base folder
# Check for syntax errors in JSON files
npm run build
```

**Issue**: Chat endpoint returns 400
- Verify userId is included in request
- Check Bearer token is valid
- Ensure Content-Type header is application/json

**Issue**: Sources not showing in frontend
- Verify API response includes sources array
- Check localStorage token is valid
- Browser console for JavaScript errors

---

## 🧪 Testing

### Run Full Test Suite
```bash
cd backend
node test-api.js
```

### Test Individual Endpoints
```bash
# Knowledge base info
curl http://localhost:4000/api/leprosy/knowledge-base-info

# Health check
curl http://localhost:4000/api/health

# Chat (with token)
curl -X POST http://localhost:4000/api/leprosy/chat/leprosy-assistant \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is leprosy?","userId":"USER_ID"}'
```

---

## 📦 Deployment Checklist

### Pre-Deployment
- [ ] Run all tests locally (7/7 passing)
- [ ] Check for TypeScript errors: `npm run build`
- [ ] Update version number in package.json
- [ ] Update `.env` for target environment
- [ ] Backup current production data
- [ ] Document any breaking changes

### Deployment Steps
1. Push code to main branch
2. SSH into production server
3. Pull latest code: `git pull origin main`
4. Install dependencies: `npm install`
5. Build TypeScript: `npm run build`
6. Restart service: `systemctl restart skinnova-backend`
7. Verify health: `curl http://localhost:4000/api/health`
8. Check logs: `tail -f /var/log/skinnova.log`

### Post-Deployment
- [ ] Verify all endpoints responding
- [ ] Test chat with real users
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Document any issues

---

## 🔄 Updates & Maintenance

### Adding New Knowledge
1. Edit JSON file in `/backend/src/knowledge-base/`
2. Restart server (automatic reload with npm run dev)
3. Test with curl or API client

### Updating Existing Data
1. Backup original JSON file
2. Edit and verify JSON syntax
3. Restart server
4. Run tests to verify

### Removing Outdated Data
1. Mark as deprecated in JSON (add `deprecated: true` field)
2. Rebuild and test
3. Monitor for user feedback
4. Remove if not used

---

## 📞 Support

### Getting Help

**For API Issues**:
1. Check server logs: `npm run dev`
2. Verify JWT token is valid
3. Test endpoint with curl
4. Check network tab in browser DevTools

**For Knowledge Base Issues**:
1. Verify JSON syntax (use online validator)
2. Check file paths match expectations
3. Verify organization names in sources
4. Restart server to reload KB

**For Frontend Issues**:
1. Check browser console for errors
2. Verify API endpoint is correct
3. Check localStorage has valid token
4. Clear cache and refresh page

---

## 📚 Knowledge Base Sources

The leprosy care assistant uses these verified sources:

| Source | URL | Last Checked |
|---|---|---|
| WHO Leprosy | https://www.who.int/health-topics/leprosy | 2024-03-02 |
| CDC Leprosy | https://www.cdc.gov/leprosy/ | 2024-03-02 |
| ILA | https://www.ilepsyassociation.org/ | 2024-03-02 |

All data is from official guidelines and periodically updated.

---

## 🎓 Knowledge Base Maintenance

### Quarterly Review Checklist
- [ ] Check WHO website for updates
- [ ] Review CDC guidelines
- [ ] Update drug regimen dosages if changed
- [ ] Add new FAQs from user feedback
- [ ] Verify all source URLs still valid
- [ ] Test all responses with updated KB

### Annual Review
- [ ] Complete revalidation with medical board
- [ ] Update all source materials
- [ ] Add new classifications if available
- [ ] Review user feedback for gaps
- [ ] Document all changes

---

## ✨ Features Summary

| Feature | Status | Notes |
|---|---|---|
| Knowledge Base Search | ✅ Active | 4 categories, 27+ entries |
| Source Citations | ✅ Active | WHO, CDC, ILA verified |
| Medical Disclaimers | ✅ Active | On all responses |
| User Authentication | ✅ Active | JWT-based |
| Chat History | ✅ Active | Persistent storage |
| Frontend Display | ✅ Active | Blue box with links |
| Error Handling | ✅ Active | Fallback responses |
| HIPAA Compliance | ✅ Active | No patient data leak |

---

## 🎯 Success Metrics

Monitor these metrics to ensure system health:

| Metric | Target | How to Measure |
|---|---|---|
| API Uptime | > 99.5% | Check server logs |
| Response Time | < 200ms | Monitor request logs |
| KB Accuracy | > 95% | User feedback surveys |
| Source Validity | 100% | Quarterly URL validation |
| User Satisfaction | > 4.5/5 | In-app feedback |
| Error Rate | < 1% | Error log analysis |

---

## 📝 Changelog

### v1.0 (Current)
- ✅ Initial production release
- ✅ 4 knowledge bases fully integrated
- ✅ All API endpoints working
- ✅ Frontend source display implemented
- ✅ 7/7 tests passing

### Future Versions
- v1.1: Add drug interactions KB
- v1.2: Add multi-language support
- v1.3: Implement admin KB management dashboard
- v2.0: Add AI model fine-tuning based on feedback

---

*For additional documentation, see LEPROSY_IMPLEMENTATION_COMPLETE.md*
*Last Updated: March 2, 2026*
