# LEPROSY RISK ANALYSIS - INTEGRATION GUIDE

## Quick Integration into Leprosy Assistant Page

### Step 1: Update the Assistant Page Component

Locate: `frontend/app/leprosy/assistant/page.tsx`

Add the RiskAnalysis import at the top:
```typescript
import RiskAnalysisComponent from '../components/RiskAnalysis'
```

### Step 2: Add Risk Analysis Tab to Tab List

Find the existing tab rendering code (typically around state setup for active tab), and add:

```typescript
const tabs = [
  { id: 'chat', label: 'Chat Assistant', icon: '💬' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'symptoms', label: 'Symptom Log', icon: '📋' },
  { id: 'risk-analysis', label: 'Risk Analysis', icon: '⚠️' },  // NEW
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'faq', label: 'FAQ', icon: '❓' },
]
```

### Step 3: Add Tab Content Rendering

Locate the tab content switch/render statement and add:

```typescript
{activeTab === 'risk-analysis' && (
  <div className="py-8">
    <RiskAnalysisComponent />
  </div>
)}
```

Complete example structure:
```typescript
const [activeTab, setActiveTab] = useState('chat')

const tabs = [
  { id: 'chat', label: 'Chat Assistant', icon: '💬' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'symptoms', label: 'Symptom Log', icon: '📋' },
  { id: 'risk-analysis', label: 'Risk Analysis', icon: '⚠️' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
]

return (
  <div className="space-y-6">
    {/* Tab Navigation */}
    <div className="border-b border-gray-200">
      <div className="flex gap-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>

    {/* Tab Content */}
    <div>
      {activeTab === 'chat' && <ChatComponent />}
      {activeTab === 'profile' && <ProfileComponent />}
      {activeTab === 'symptoms' && <SymptomLogComponent />}
      {activeTab === 'risk-analysis' && <RiskAnalysisComponent />}  {/* NEW */}
      {activeTab === 'appointments' && <AppointmentsComponent />}
    </div>
  </div>
)
```

### Step 4: Install Required Dependencies (Frontend)

The RiskTrendsChart component uses Recharts. Install it:

```bash
cd frontend
npm install recharts
```

### Step 5: Verify API Route Integration

Make sure your backend is configured with the leprosy routes:

In your backend main app file (e.g., `backend/src/app.ts` or `backend/src/index.ts`):

```typescript
import leprosyRoutes from './routes/leprosy'

// Add route
app.use('/api/leprosy', leprosyRoutes)
```

### Step 6: Test Integration

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. Start your frontend dev server:
```bash
cd frontend
npm run dev
```

3. Navigate to: `http://localhost:3000/leprosy/assistant`

4. Click the new "Risk Analysis" tab (⚠️)

5. If no assessment exists yet, click "Calculate Risk Score"

6. Explore the different tabs (Overview, Breakdown, Trends, Predictions)

### Step 7: Auto-Trigger Risk Calculation (Optional)

To automatically calculate risk whenever a patient logs symptoms or updates their profile:

**In SymptomLog component (after submitting new symptom):**
```typescript
const handleSubmitSymptom = async (symptomData: any) => {
  // Save symptom...
  await saveSymptom(symptomData)
  
  // Auto-trigger risk calculation
  await fetch('/api/leprosy/risk-assessment/auto-trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}
```

**In ProfileComponent (after updating profile):**
```typescript
const handleProfileUpdate = async (profileData: any) => {
  // Update profile...
  await updateProfile(profileData)
  
  // Auto-trigger risk calculation
  await fetch('/api/leprosy/risk-assessment/auto-trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### Step 8: Seed Test Data

Run the seeding script to populate your database with test patient data:

```bash
cd backend
npx ts-node seed-leprosy-data.ts
```

Output will show sample patient IDs:
```
✓ Inserted 5 patient profiles
✓ Inserted 25 symptom logs

Sample patient IDs for testing:
  - patient_001
  - patient_002
  - patient_003
  - patient_004
  - patient_005
```

### Step 9: Test with Sample Data

If your app has user authentication, you can test with:
```
User ID: patient_001 (or any from seed output)
```

Navigate through the Risk Analysis tabs and verify:
- [ ] Gauge animates to correct score
- [ ] Component breakdown shows 6 items with correct percentages
- [ ] Trends chart appears (may show "insufficient data" for first patient, but data loads if you've seeded)
- [ ] Critical factors display with red alerts
- [ ] Recommendations list appears
- [ ] Blue protective factors section shows positive factors

### Styling Notes

All components use Tailwind CSS classes. Ensure your project has Tailwind configured:

```tailwind.config.js
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    // Your plugins
  ],
}
```

Required Tailwind utilities (should be standard):
- Grid: `grid`, `grid-cols-*`
- Colors: `bg-*`, `text-*`, `border-*`
- Spacing: `p-*`, `m-*`, `gap-*`
- Flex: `flex`, `items-center`, `justify-between`
- Shadows: `shadow`, `rounded-lg`
- Borders: `border`
- Transitions: `transition`

### Troubleshooting

**Issue:** "RiskScoreGauge is not a function"
- **Solution:** Ensure all component files are in `frontend/app/leprosy/components/`

**Issue:** Charts not rendering
- **Solution:** Install Recharts: `npm install recharts`

**Issue:** "Cannot find module 'leprosyRiskAnalysisService'"
- **Solution:** Ensure `backend/src/services/leprosyRiskAnalysisService.ts` exists

**Issue:** API 404 errors
- **Solution:** Verify leprosy routes are registered in backend main app file

**Issue:** No data showing in trends
- **Solution:** Run seed script first, then refresh page

**Issue:** Gauge animates too fast/slow
- **Solution:** Adjust animation interval in RiskScoreGauge.tsx:
```typescript
// Current: updates every 15ms
// Change value to 30ms for slower, 8ms for faster
const interval = setInterval(() => {
  // ...
}, 15) // Adjust this value
```

### Production Deployment Notes

Before deploying to production:

1. **Database backups** - Enable automatic MongoDB backups
2. **Environment variables** - Set appropriate MONGODB_URI
3. **API rate limiting** - Consider adding rate limits to risk endpoints
4. **Caching** - Risk assessment caches for 24 hours (adjust if needed)
5. **Logging** - All calculations logged; monitor for errors
6. **HTTPS** - Ensure all API calls use HTTPS in production
7. **CORS** - Configure CORS headers if frontend/backend on different domains

### Performance Optimization (Optional)

For deployments with many patients:

1. **Enable caching layer:**
```typescript
// In leprosyRiskAnalysisService.ts
const cache = new Map()

async calculateRiskScore(userId: string) {
  // Check cache first
  const cached = cache.get(userId)
  if (cached && Date.now() - cached.timestamp < 24*60*60*1000) {
    return cached.data
  }
  
  // Calculate...
}
```

2. **Add database indexes:**
```typescript
// In leprosy.ts routes
LeprosyRiskAssessment.collection.createIndex({ userId: 1, timestamp: -1 })
```

3. **Pagination for history:**
```typescript
// Already implemented in GET /risk-assessment/history
// Defaults to 12 records, adjust 'limit' query param
```

---

## Summary

The Risk Analysis component is now fully integrated into your Leprosy Assistant page! 

**Files Modified:**
- ✅ `frontend/app/leprosy/assistant/page.tsx` (Tab added)
- ✅ `frontend/app/leprosy/components/RiskAnalysis.tsx` (NEW)
- ✅ `frontend/app/leprosy/components/RiskScoreGauge.tsx` (NEW)
- ✅ `frontend/app/leprosy/components/RiskComponentBreakdown.tsx` (NEW)
- ✅ `frontend/app/leprosy/components/RiskTrendsChart.tsx` (NEW)
- ✅ `frontend/app/leprosy/components/CriticalFactorsPanel.tsx` (NEW)
- ✅ `frontend/app/leprosy/components/RecommendationsPanel.tsx` (NEW)
- ✅ `backend/src/routes/leprosy.ts` (7 endpoints added)
- ✅ `backend/src/services/leprosyRiskAnalysisService.ts` (NEW)
- ✅ `backend/src/models/LeprosyRiskAssessment.ts` (NEW)
- ✅ `backend/src/models/SymptomLog.ts` (Enhanced)
- ✅ `backend/src/models/LeprosyUserProfile.ts` (Enhanced)

**Status:** READY FOR TESTING AND DEPLOYMENT 🚀
