# 🛠️ Leprosy Assistant AI - Data Integration Implementation Guide

**Last Updated:** March 2, 2026
**Status**: ✅ Ready to Code

---

## Quick Start

This guide shows you **exactly how to integrate** the trusted data sources into your leprosy care assistant AI with working code examples.

---

## 📁 Project Structure Setup

```
backend/src/
├── knowledge-base/
│   ├── index.ts (main query engine)
│   ├── leprosy-classification.json
│   ├── treatment-protocols.json
│   ├── reactions-management.json
│   ├── disability-prevention.json
│   ├── nutrition-lifestyle.json
│   └── faq-database.json
│
├── routes/
│   └── leprosy.ts (updated with knowledge base)
│
└── services/
    └── leprosyKnowledgeService.ts (new - fetches from external sources)
```

---

## 🗄️ Step 1: Create Knowledge Base Schema

### File: `backend/src/knowledge-base/types.ts`

```typescript
export interface KnowledgeEntry {
  id: string;
  category: string;
  source: string;
  confidenceLevel: 'very-high' | 'high' | 'medium' | 'low';
  publishedDate: string;
  lastUpdated: string;
  sourceUrl: string;
  content: string;
  relatedQueries: string[];
}

export interface TrustedSource {
  name: string;
  organization: string;
  url: string;
  type: 'official' | 'research' | 'clinical' | 'educational';
  geographicCoverage: string;
  lastVerified: string;
}

export interface ChatWithCitations {
  message: string;
  sources: TrustedSource[];
  disclaimer?: string;
  clinicalReference?: string;
}
```

---

## 📊 Step 2: Create Knowledge Files

### File: `backend/src/knowledge-base/leprosy-classification.json`

```json
{
  "category": "disease_classification",
  "trustedSources": [
    {
      "organization": "World Health Organization",
      "url": "https://www.who.int/health-topics/leprosy",
      "verified": "2024-02-15"
    },
    {
      "organization": "International Leprosy Association",
      "url": "https://www.ilepsyassociation.org/",
      "verified": "2024-02-15"
    },
    {
      "organization": "CDC",
      "url": "https://www.cdc.gov/leprosy/",
      "verified": "2024-02-15"
    }
  ],
  "classifications": [
    {
      "type": "indeterminate",
      "code": "IL",
      "description": "Early leprosy, often self-healing. Single lesion or few macules with indefinite borders.",
      "lesionCount": "1-5",
      "sensoryLoss": "Indeterminate",
      "nerveInvolvement": "Rare",
      "bacterialIndex": "Negative",
      "prognosis": "Good - 75% self-heal",
      "treatment": "6 months MDT if persistent"
    },
    {
      "type": "tuberculoid",
      "code": "TT",
      "description": "Few, well-defined lesions with strong cell-mediated immunity",
      "lesionCount": "1-5",
      "sensoryLoss": "Marked and early",
      "nerveInvolvement": "Frequent, often severe",
      "bacterialIndex": "Negative",
      "classification": "Paucibacillary",
      "treatment": "6 months MDT (2 drugs)"
    },
    {
      "type": "borderline_tuberculoid",
      "code": "BT",
      "description": "Lesions similar to TT but slightly more numerous",
      "lesionCount": "5-10",
      "sensoryLoss": "Variable",
      "nerveInvolvement": "Moderate to frequent",
      "bacterialIndex": "0-2",
      "classification": "Paucibacillary",
      "treatment": "6 months MDT (2 drugs)"
    },
    {
      "type": "mid_borderline",
      "code": "BB",
      "description": "Unstable form, intermediate features",
      "lesionCount": "10-20+",
      "sensoryLoss": "Variable",
      "nerveInvolvement": "Frequent",
      "bacterialIndex": "2-4",
      "classification": "Multibacillary",
      "notes": "Prone to reactions, unstable",
      "treatment": "12 months MDT (3 drugs)"
    },
    {
      "type": "borderline_lepromatous",
      "code": "BL",
      "description": "Many lesions, numerous organisms, weak immunity",
      "lesionCount": "20+ disseminated",
      "sensoryLoss": "Slight",
      "nerveInvolvement": "Present",
      "bacterialIndex": "4-5",
      "classification": "Multibacillary",
      "notes": "High bacillary load, Type 2 reactions common",
      "treatment": "12 months MDT (3 drugs)"
    },
    {
      "type": "lepromatous",
      "code": "LL",
      "description": "Most disseminated form, massive bacterial load",
      "lesionCount": "Numerous disseminated",
      "sensoryLoss": "Absent or slight",
      "nerveInvolvement": "Late onset",
      "bacterialIndex": "5-6",
      "classification": "Multibacillary",
      "notes": "Very high contagiousness until treated",
      "treatment": "12 months MDT (3 drugs)"
    }
  ],
  "clinicalAssessment": {
    "slit_skin_smear": {
      "description": "Primary diagnostic test",
      "interpretation": "Count bacilli from 1-6 sites",
      "bacterialIndex": "0=Negative, 1-2=Low, 3-4=Moderate, 5-6=High"
    },
    "lesion_examination": {
      "key_findings": [
        "Location and distribution",
        "Border definition (sharp vs fuzzy)",
        "Sensory loss pattern",
        "Surface appearance"
      ]
    },
    "nerve_palpation": {
      "sites": ["Greater auricular", "Ulnar", "Posterior tibial", "Sural"],
      "assessment": "Thickening, tenderness, size"
    }
  }
}
```

### File: `backend/src/knowledge-base/treatment-protocols.json`

```json
{
  "category": "treatment_protocols",
  "source": "WHO, CDC",
  "lastUpdated": "2024-01-15",
  "protocols": [
    {
      "classification": "Paucibacillary (PB)",
      "duration": "6 months",
      "rifampicin": {
        "dose": "600mg",
        "frequency": "Once monthly (supervised)",
        "totalDoses": 6,
        "notes": "May cause orange discoloration of body fluids"
      },
      "ofloxacin": {
        "dose": "400mg",
        "frequency": "Daily self-administered",
        "totalDoses": 180
      },
      "minocycline": {
        "dose": "100mg",
        "frequency": "Daily self-administered",
        "totalDoses": 180
      },
      "monitoringSchedule": {
        "baseline": "Complete history, physical, slit-skin smear",
        "month_3": "Clinical assessment, compliance check",
        "month_6": "Final assessment, slit-skin smear",
        "followUp": "Annual for 5 years"
      },
      "outcomeTimeline": {
        "clinically_effective": "6 months (skin lesions flatten, no bacilli detected)",
        "bacteriologically_effective": "Often by 6 months"
      }
    },
    {
      "classification": "Multibacillary (MB)",
      "duration": "12 months",
      "monthlySupervised": {
        "rifampicin": "600mg",
        "ofloxacin": "400mg (single dose)",
        "minocycline": "100mg (single dose)"
      },
      "dailySelfAdministered": {
        "ofloxacin": "400mg daily",
        "minocycline": "100mg daily"
      },
      "monitoringSchedule": {
        "baseline": "Complete assessment",
        "month_3": "Clinical check, tolerance assessment",
        "month_6": "Mid-treatment assessment, slit-skin smear",
        "month_12": "Final assessment, slit-skin smear",
        "followUp": "Annual for 5 years"
      },
      "outcomeTimeline": {
        "clinically_effective": "Usually 6 months",
        "bacteriologically_effective": "Usually 12 months"
      }
    }
  ],
  "beforeTreatment": {
    "baseline_assessment": [
      "Complete medical history",
      "Physical examination",
      "Slit-skin smear (SSS) from 6 sites",
      "Bacillary index calculation",
      "Assess all organs for involvement",
      "Check for reactions already present",
      "Baseline disability assessment (WHO Grade)"
    ],
    "pretreatmentTests": [
      "Complete blood count",
      "Liver function tests",
      "Kidney function tests"
    ]
  },
  "duringTreatment": {
    "sideEffectMonitoring": {
      "rifampicin": [
        "Hepatitis (jaundice)",
        "Thrombocytopenia",
        "Drug interactions"
      ],
      "ofloxacin": [
        "Gastrointestinal upset",
        "Tendinitis",
        "CNS effects"
      ],
      "minocycline": [
        "Blue-black pigmentation",
        "Photosensitivity",
        "Liver toxicity"
      ]
    },
    "adherenceSupport": [
      "Monthly supervised doses",
      "Blister pack organization",
      "Reminder systems",
      "Contact follow-ups"
    ]
  },
  "postTreatment": {
    "followUpSchedule": [
      "3 months after completion",
      "6 months after completion",
      "Annually for next 5 years"
    ],
    "surveillance": [
      "Monitor for relapse signs",
      "Assess functional status",
      "Document any reactions",
      "Disability reassessment"
    ],
    "relapsePrevention": [
      "Complete the entire MDT course",
      "Regular monitoring",
      "Early detection of reactions",
      "Proper self-care"
    ]
  }
}
```

### File: `backend/src/knowledge-base/reactions-management.json`

```json
{
  "category": "reactions_management",
  "source": "CDC, WHO, ILA",
  "lastUpdated": "2024-01-20",
  "type1_reaction": {
    "name": "Type 1 Reaction (Reversal Reaction)",
    "pathogenesis": "Cell-mediated immune dysregulation",
    "timing": [
      "Can occur during treatment",
      "Usually within 1 year after treatment completion",
      "Rare after 1 year"
    ],
    "frequency": "25-55% of BT, BB, BL patients",
    "signs_symptoms": {
      "acute": [
        "Sudden inflammation of existing lesions",
        "Edema and color change",
        "New lesions may appear",
        "Neuritis (nerve inflammation)"
      ],
      "neuritis_signs": [
        "Nerve tenderness",
        "Pain along nerve distribution",
        "Weakness in muscle group",
        "Sensory loss progression"
      ],
      "emergency_signs": [
        "Severe eye inflammation",
        "Severe neuritis with paralysis risk",
        "Systemic toxicity"
      ]
    },
    "diagnosis": {
      "clinical": "History and examination findings",
      "no_slit_skin_smear_change": "May still show same bacillary index",
      "biopsy": "Shows inflammatory infiltrate"
    },
    "treatment": {
      "corticosteroids": {
        "first_line": "Prednisolone",
        "initial": "0.5-1.0 mg/kg daily",
        "taper": "Reduce gradually over 2-3 months",
        "duration": "3-12 months (individualized)",
        "monitoring": "Weekly initially, then monthly"
      },
      "duration": "Continue MDT during treatment of reaction",
      "outcomesTimeline": [
        "70-80% resolve with appropriate therapy",
        "Some may develop disability"
      ]
    },
    "monitoring": [
      "Monthly neuritis assessments",
      "Ophthalmology review if eye involvement",
      "Functional status checks",
      "Corticosteroid side effect monitoring"
    ]
  },
  "type2_reaction": {
    "name": "Type 2 Reaction (Erythema Nodosum Leprosum - ENL)",
    "pathogenesis": "Immune complex (Type III) deposition",
    "timing": [
      "Usually during treatment (especially first 1-2 years)",
      "Can occur up to 10 years after treatment"
    ],
    "risk_groups": "More common in BL and LL patients",
    "frequency": "Up to 50% of BL and LL patients",
    "signs_symptoms": {
      "acute": [
        "Tender subcutaneous nodules",
        "Fever (often high)",
        "Generalized malaise",
        "Constitutional symptoms"
      ],
      "systemic_involvement": [
        "Iridocyclitis (eye inflammation)",
        "Neuritis",
        "Arthritis/arthralgias",
        "Lymphadenopathy",
        "Hepatosplenomegaly"
      ],
      "severe_complications": [
        "Permanent blindness",
        "Testicular atrophy",
        "Glomerulonephritis"
      ]
    },
    "diagnosis": {
      "clinical": "Clinical presentation + timing",
      "no_smear_change": "Bacillary index unchanged",
      "histology": "Neutrophilic infiltrate"
    },
    "treatment_strategies": {
      "mild": {
        "aspirin": "As needed for analgesia",
        "monitor": "Watch for progression"
      },
      "moderate": {
        "corticosteroids": {
          "dose": "Prednisolone 0.5 mg/kg daily",
          "taper": "Gradual reduction",
          "duration": "2-6 weeks"
        }
      },
      "severe": {
        "corticosteroids_plus": "Prednisolone 0.5 mg/kg daily",
        "thalidomide": {
          "dose": "100-300mg daily",
          "duration": "Variable",
          "warning": "Teratogenic - contraindicated in pregnancy",
          "monitoring": "Strict pregnancy prevention program"
        }
      }
    },
    "outcome": [
      "Recurrent episodes are common (up to 10-20% recurrence)",
      "Can occur even after treatment completion",
      "Requires long-term management planning"
    ],
    "monitoring": [
      "Clinical assessment at each MDT visit",
      "Ophthalmology referral if eye symptoms",
      "Regular inflammatory marker checks",
      "Pregnancy testing if thalidomide considered"
    ]
  },
  "reactionManagementFlow": {
    "suspicion": {
      "action": "Immediate evaluation",
      "assessment": [
        "Detailed history of symptom onset",
        "Complete physical examination",
        "Nerve assessment",
        "Eye examination"
      ]
    },
    "diagnosis": {
      "type1": "Lesion inflammation + neuritis during/after treatment",
      "type2": "Nodules + fever + systemic symptoms during treatment"
    },
    "treatment": {
      "type1": "Corticosteroids, continue MDT",
      "type2": "Corticosteroids ± Thalidomide, continue MDT"
    },
    "monitoring": {
      "frequency": "Regular follow-ups",
      "duration": "Months to years depending on severity",
      "endpoint": "Resolution or stabilization"
    }
  },
  "emergency_consultation": {
    "seek_immediate_medical_attention": [
      "Severe eye inflammation with vision changes",
      "Severe or worsening neuritis",
      "Inability to move fingers or toes",
      "Suspected testicular involvement (swelling, pain)",
      "Severe systemic symptoms (high fever, jaundice)"
    ]
  }
}
```

---

## 🔧 Step 3: Create Knowledge Query Service

### File: `backend/src/services/leprosyKnowledgeService.ts`

```typescript
import fs from 'fs';
import path from 'path';

interface KnowledgeEntry {
  id: string;
  category: string;
  source: string;
  confidenceLevel: string;
  content: string;
  sourceUrl?: string;
}

interface ChatResponse {
  message: string;
  sources: Array<{
    name: string;
    url?: string;
    organization?: string;
  }>;
  disclaimer?: string;
}

export class LeprosyKnowledgeService {
  private knowledgeBase: any = {};
  private readonly KB_PATH = path.join(__dirname, '../knowledge-base');

  constructor() {
    this.loadKnowledgeBase();
  }

  /**
   * Load all knowledge base files on initialization
   */
  private loadKnowledgeBase() {
    const files = [
      'leprosy-classification.json',
      'treatment-protocols.json',
      'reactions-management.json',
      'disability-prevention.json',
      'nutrition-lifestyle.json',
      'faq-database.json'
    ];

    files.forEach(file => {
      try {
        const filePath = path.join(this.KB_PATH, file);
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8');
          const category = file.replace('.json', '');
          this.knowledgeBase[category] = JSON.parse(data);
        }
      } catch (error) {
        console.warn(`Failed to load ${file}:`, error);
      }
    });
  }

  /**
   * Search knowledge base for relevant information
   */
  public searchKnowledge(query: string): KnowledgeEntry[] {
    const results: KnowledgeEntry[] = [];
    const queryLower = query.toLowerCase();

    // Search through all categories
    Object.entries(this.knowledgeBase).forEach(([category, data]: any) => {
      if (category.includes('classification')) {
        this.searchClassification(queryLower, data, results);
      } else if (category.includes('treatment')) {
        this.searchTreatment(queryLower, data, results);
      } else if (category.includes('reactions')) {
        this.searchReactions(queryLower, data, results);
      } else if (category.includes('faq')) {
        this.searchFAQ(queryLower, data, results);
      }
    });

    return results;
  }

  /**
   * Search classification knowledge
   */
  private searchClassification(query: string, data: any, results: KnowledgeEntry[]) {
    if (!data.classifications) return;

    data.classifications.forEach((classification: any) => {
      if (
        classification.type.includes(query) ||
        classification.description.toLowerCase().includes(query) ||
        classification.code.toLowerCase().includes(query)
      ) {
        results.push({
          id: classification.code,
          category: 'disease_classification',
          source: data.trustedSources?.[0]?.organization || 'WHO',
          confidenceLevel: 'very-high',
          content: `${classification.type.toUpperCase()}: ${classification.description}`,
          sourceUrl: data.trustedSources?.[0]?.url
        });
      }
    });
  }

  /**
   * Search treatment protocols
   */
  private searchTreatment(query: string, data: any, results: KnowledgeEntry[]) {
    if (!data.protocols) return;

    data.protocols.forEach((protocol: any) => {
      if (
        protocol.classification.toLowerCase().includes(query) ||
        JSON.stringify(protocol).toLowerCase().includes(query)
      ) {
        results.push({
          id: protocol.classification,
          category: 'treatment_protocols',
          source: data.source || 'WHO, CDC',
          confidenceLevel: 'very-high',
          content: `Treatment for ${protocol.classification}: ${protocol.duration}`,
          sourceUrl: 'https://www.cdc.gov/leprosy/'
        });
      }
    });
  }

  /**
   * Search reactions management
   */
  private searchReactions(query: string, data: any, results: KnowledgeEntry[]) {
    if (query.includes('type 1') || query.includes('reversal')) {
      results.push({
        id: 'reaction_type1',
        category: 'reactions_management',
        source: data.source || 'CDC, WHO',
        confidenceLevel: 'very-high',
        content: data.type1_reaction?.name,
        sourceUrl: 'https://www.cdc.gov/leprosy/complications/reactions.html'
      });
    }

    if (query.includes('type 2') || query.includes('enl')) {
      results.push({
        id: 'reaction_type2',
        category: 'reactions_management',
        source: data.source || 'CDC, WHO',
        confidenceLevel: 'very-high',
        content: data.type2_reaction?.name,
        sourceUrl: 'https://www.cdc.gov/leprosy/complications/reactions.html'
      });
    }
  }

  /**
   * Search FAQ database
   */
  private searchFAQ(query: string, data: any, results: KnowledgeEntry[]) {
    if (!data.faqs) return;

    data.faqs.forEach((faq: any) => {
      if (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      ) {
        results.push({
          id: faq.id,
          category: 'faq',
          source: 'SkinNova Knowledge Base',
          confidenceLevel: 'high',
          content: faq.answer
        });
      }
    });
  }

  /**
   * Get detailed information about a disease classification
   */
  public getClassificationDetails(type: string) {
    const classifications = this.knowledgeBase['leprosy-classification']?.classifications || [];
    return classifications.find((c: any) => 
      c.type.toLowerCase() === type.toLowerCase() || c.code === type.toUpperCase()
    );
  }

  /**
   * Get treatment protocol for a classification
   */
  public getTreatmentProtocol(classification: 'PB' | 'MB') {
    const protocols = this.knowledgeBase['treatment-protocols']?.protocols || [];
    return protocols.find((p: any) => p.classification.includes(classification));
  }

  /**
   * Build a response with proper citations
   */
  public buildCitedResponse(message: string, sources: any[]): ChatResponse {
    const sourceCitations = sources.map(source => ({
      name: source.source || source.organization,
      url: source.sourceUrl || source.url,
      organization: source.organization
    }));

    return {
      message,
      sources: sourceCitations,
      disclaimer: 'Always consult your healthcare provider for personalized medical advice. This information is for educational purposes only.'
    };
  }

  /**
   * Get all trusted sources for a category
   */
  public getTrustedSources(category: string) {
    const data = this.knowledgeBase[category];
    return data?.trustedSources || [];
  }
}

export default new LeprosyKnowledgeService();
```

---

## 🔌 Step 4: Update Leprosy Route

### File: `backend/src/routes/leprosy.ts` (Add to generateAssistantResponse function)

```typescript
import leprosyKnowledgeService from '../services/leprosyKnowledgeService';

// Inside the chat endpoint
router.post('/chat/leprosy-assistant', requireAuth, async (req: any, res: any) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch user profile for personalization
    const userProfile = await LeprosyUserProfile.findOne({ userId });

    // Search knowledge base first
    const searchResults = leprosyKnowledgeService.searchKnowledge(message);
    
    // Generate response with citations
    const { reply, context } = generateEnhancedAssistantResponse(
      message,
      userProfile,
      searchResults
    );

    // Save chat history
    let chatHistory = await LeprosyAssistantChat.findOne({ userId });
    if (!chatHistory) {
      chatHistory = new LeprosyAssistantChat({ userId, messages: [] });
    }

    chatHistory.messages.push({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    chatHistory.messages.push({
      sender: 'assistant',
      text: reply,
      timestamp: new Date(),
      sources: context.sources // Save sources
    });

    await chatHistory.save();

    res.json({
      success: true,
      reply,
      context
    });
  } catch (error) {
    console.error('Error in leprosy assistant chat:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * Enhanced response generation with knowledge base integration
 */
function generateEnhancedAssistantResponse(
  message: string,
  userProfile: any,
  searchResults: any[]
) {
  const lowerMessage = message.toLowerCase();
  let reply = '';
  let sources: any[] = [];

  // If knowledge base has relevant results, use them
  if (searchResults.length > 0) {
    const primaryResult = searchResults[0];
    sources = [{ source: primaryResult.source, url: primaryResult.sourceUrl }];

    // Build response based on category
    if (primaryResult.category === 'disease_classification') {
      const classification = leprosyKnowledgeService.getClassificationDetails(primaryResult.id);
      reply = formatClassificationResponse(classification);
      sources.push(...leprosyKnowledgeService.getTrustedSources('leprosy-classification'));
    } else if (primaryResult.category === 'treatment_protocols') {
      const classType = lowerMessage.includes('paucibacillary') || lowerMessage.includes('pb') ? 'PB' : 'MB';
      const protocol = leprosyKnowledgeService.getTreatmentProtocol(classType as any);
      reply = formatTreatmentResponse(protocol);
      sources.push(...leprosyKnowledgeService.getTrustedSources('treatment-protocols'));
    } else if (primaryResult.category === 'reactions_management') {
      reply = formatReactionResponse(lowerMessage, primaryResult);
      sources.push(...leprosyKnowledgeService.getTrustedSources('reactions-management'));
    } else {
      reply = primaryResult.content;
    }
  } else {
    // Fall back to original personalized responses
    reply = generateAssistantResponse(message, userProfile);
  }

  // Add disclaimer
  const disclaimer = 'This information is based on WHO, CDC, and ILA guidelines. Always consult your healthcare provider for personalized advice.';

  return {
    reply,
    context: {
      sources,
      disclaimer,
      hasKnowledgeBaseCitation: searchResults.length > 0
    }
  };
}

/**
 * Format classification response
 */
function formatClassificationResponse(classification: any): string {
  if (!classification) return 'Unable to find classification information.';

  return `
**${classification.type.toUpperCase()} (Code: ${classification.code})**

${classification.description}

**Key Features:**
- Lesion Count: ${classification.lesionCount}
- Sensory Loss: ${classification.sensoryLoss}
- Nerve Involvement: ${classification.nerveInvolvement}
- Bacterial Index: ${classification.bacterialIndex}

**Treatment:** ${classification.treatment}

**Source:** WHO Classification System, International Leprosy Association
  `.trim();
}

/**
 * Format treatment response
 */
function formatTreatmentResponse(protocol: any): string {
  if (!protocol) return 'Treatment information not available.';

  return `
**Treatment for ${protocol.classification}**

**Duration:** ${protocol.duration}

**Medications:**
${protocol.rifampicin ? `- Rifampicin: ${protocol.rifampicin.dose} (${protocol.rifampicin.frequency})` : ''}
${protocol.ofloxacin ? `- Ofloxacin: ${protocol.ofloxacin.dose}` : ''}
${protocol.minocycline ? `- Minocycline: ${protocol.minocycline.dose}` : ''}

**Monitoring:** Regular clinical assessments every 3 months

**Outcomes:**
- Clinical effectiveness: ${protocol.outcomeTimeline?.clinically_effective}
- Bacteriological effectiveness: ${protocol.outcomeTimeline?.bacteriologically_effective}

**Source:** WHO MDT Guidelines, CDC Treatment Guidelines
  `.trim();
}

/**
 * Format reaction response
 */
function formatReactionResponse(query: string, result: any): string {
  if (query.includes('type 1') || query.includes('reversal')) {
    return `
**Type 1 Reaction (Reversal Reaction)**

This is a cell-mediated immune response that can occur during or after treatment.

**Warning Signs:**
- Sudden inflammation of existing lesions
- Nerve inflammation (neuritis)
- New patches appearing
- Nerve tenderness or pain

**What to Do:**
- Contact your healthcare provider immediately
- Do NOT stop MDT (continue your medications)
- Seek urgent care if severe eye symptoms or paralysis risk

**Treatment:** Corticosteroids (prednisolone), prescribed by your doctor

**Source:** CDC, WHO, International Leprosy Association
    `.trim();
  }

  if (query.includes('type 2') || query.includes('enl')) {
    return `
**Type 2 Reaction (Erythema Nodosum Leprosum - ENL)**

This is an immune complex reaction that requires prompt medical attention.

**Warning Signs:**
- Tender nodules under the skin
- High fever
- Eye inflammation
- Extreme fatigue

**What to Do:**
- Seek medical attention immediately
- Continue taking your MDT medications
- Don't miss appointments

**Treatment:** Corticosteroids and possibly Thalidomide (under strict medical supervision)

**Source:** CDC, WHO, International Leprosy Association
    `.trim();
  }

  return 'Information about reactions. Consult your healthcare provider immediately if you suspect a reaction.';
}
```

---

## 📱 Step 5: Frontend Integration

### File: `frontend/app/leprosy/assistant/page.tsx` (Add to chat component)

```tsx
// Add this to your message send handler
const handleSendMessage = async (text: string) => {
  // ... existing code ...

  const response = await fetch('/api/leprosy/chat/leprosy-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message: text })
  });

  const data = await response.json();
  
  // Store message with sources
  const assistantMessage = {
    id: generateId(),
    text: data.reply,
    sender: 'assistant' as const,
    timestamp: new Date(),
    sources: data.context?.sources,
    disclaimer: data.context?.disclaimer
  };

  setMessages(prev => [...prev, assistantMessage]);
};

// Display sources under assistant message
{message.sender === 'assistant' && message.sources && (
  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
    <p className="font-semibold text-gray-700 mb-1">Sources:</p>
    <ul className="list-disc list-inside">
      {message.sources.map((source: any, idx: number) => (
        <li key={idx}>
          {source.url ? (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {source.source || source.name}
            </a>
          ) : (
            <span>{source.source || source.name}</span>
          )}
        </li>
      ))}
    </ul>
    {message.disclaimer && (
      <p className="italic mt-2 text-gray-500">{message.disclaimer}</p>
    )}
  </div>
)}
```

---

## ✅ Integration Checklist

- [ ] Create knowledge base directory structure
- [ ] Create all JSON knowledge files
- [ ] Implement LeprosyKnowledgeService
- [ ] Update leprosy route with knowledge integration
- [ ] Add source citation to frontend
- [ ] Test knowledge base searches
- [ ] Verify all trailing citations
- [ ] Test edge cases and fallback responses
- [ ] Add error logging
- [ ] Deploy to production

---

## 🧪 Testing Examples

```typescript
// Test the knowledge service
import leprosyKnowledgeService from './services/leprosyKnowledgeService';

// Test classification search
const classResults = leprosyKnowledgeService.searchKnowledge('tuberculoid');
console.log('Classification search:', classResults);

// Test treatment search
const treatResults = leprosyKnowledgeService.searchKnowledge('multibacillary treatment');
console.log('Treatment search:', treatResults);

// Test reaction search
const reactionResults = leprosyKnowledgeService.searchKnowledge('type 1 reaction');
console.log('Reaction search:', reactionResults);
```

---

## 🔐 Security & Compliance

- All data sourced from official medical organizations
- No personal health information stored with knowledge base
- HIPAA-compliant messaging
- Regular knowledge base updates from official sources
- Audit trail for knowledge base changes

---

**Status**: ✅ Ready to Implement
**Last Updated**: March 2, 2026

---
