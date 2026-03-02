/**
 * Leprosy Knowledge Service
 * Manages all knowledge base operations, searches, and retrievals
 */

import fs from 'fs'
import path from 'path'
import {
  KnowledgeEntry,
  SearchResult,
  TrustedSource,
  ChatWithCitations,
  LeprosyClassification,
  TreatmentProtocol
} from '../knowledge-base/types'

export class LeprosyKnowledgeService {
  private knowledgeBase: any = {}
  private readonly KB_PATH = path.join(__dirname, '../knowledge-base')

  constructor() {
    this.loadKnowledgeBase()
  }

  /**
   * Load all knowledge base files on initialization
   */
  private loadKnowledgeBase() {
    const files = [
      'leprosy-classification.json',
      'treatment-protocols.json',
      'reactions-management.json',
      'faq-database.json'
    ]

    let loadedCount = 0
    files.forEach(file => {
      try {
        const filePath = path.join(this.KB_PATH, file)
        console.log(`📂 Checking: ${filePath}`)
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8')
          const category = file.replace('.json', '')
          this.knowledgeBase[category] = JSON.parse(data)
          console.log(`✅ Loaded knowledge base: ${category} (${JSON.stringify(Object.keys(this.knowledgeBase[category]))})`)
          loadedCount++
        } else {
          console.warn(`⚠️ File not found: ${filePath}`)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file}:`, error instanceof Error ? error.message : error)
      }
    })

    console.log(`📚 Knowledge base initialized with ${loadedCount} categories (${Object.keys(this.knowledgeBase).length} total)`)
  }

  /**
   * Reload knowledge base (useful for hot reloading)
   */
  public reloadKnowledgeBase() {
    this.knowledgeBase = {}
    this.loadKnowledgeBase()
  }

  /**
   * Search knowledge base for relevant information
   */
  public searchKnowledge(query: string): SearchResult[] {
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(' ').filter(w => w.length > 2)

    console.log(`🔍 Searching KB for: "${query}" (words: ${queryWords})`)

    // Search through all categories
    Object.entries(this.knowledgeBase).forEach(([category, data]: any) => {
      if (category.includes('classification')) {
        this.searchClassification(queryLower, queryWords, data, results)
      } else if (category.includes('treatment')) {
        this.searchTreatment(queryLower, queryWords, data, results)
      } else if (category.includes('reactions')) {
        this.searchReactions(queryLower, queryWords, data, results)
      } else if (category.includes('faq')) {
        this.searchFAQ(queryLower, queryWords, data, results)
      }
    })

    console.log(`📊 Found ${results.length} results`)

    // Sort by match score (highest first)
    return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  /**
   * Search classification knowledge
   */
  private searchClassification(query: string, queryWords: string[], data: any, results: SearchResult[]) {
    if (!data.classifications) return

    data.classifications.forEach((classification: any) => {
      const name = classification.name || classification.type || ''
      const code = classification.code || classification.id || ''
      const desc = classification.clinical_description || classification.description || ''
      const bodyText = `${name} ${code} ${desc}`.toLowerCase()
      let score = 0

      // Exact matches
      if (name && name.toLowerCase() === query) score += 100
      if (code && code.toLowerCase() === query) score += 100

      // Word matches
      queryWords.forEach(word => {
        if (bodyText.includes(word)) {
          score += 10
        }
      })

      // General content matches
      if (bodyText.includes(query)) score += 5

      if (score > 0) {
        const sources = data.trustedSources?.map((source: any) => ({
          name: source.organization,
          url: source.url,
          organization: source.organization
        })) || []

        results.push({
          id: code,
          category: 'disease_classification',
          source: data.trustedSources?.[0]?.organization || 'WHO',
          confidenceLevel: 'very-high',
          lastUpdated: data.last_updated || new Date().toISOString(),
          sourceUrl: data.trustedSources?.[0]?.url || '',
          content: `${name?.toUpperCase() || 'Leprosy Form'}: ${desc}`,
          relatedQueries: [name, code],
          matchScore: score,
          clinicalReference: classification.diagnostic_criteria ? `BI: ${classification.diagnostic_criteria.bacterial_index || 'varies'}` : undefined
        })
      }
    })
  }

  /**
   * Search treatment protocols
   */
  private searchTreatment(query: string, queryWords: string[], data: any, results: SearchResult[]) {
    if (!data.protocols) return

    data.protocols.forEach((protocol: any) => {
      const bodyText = `${protocol.classification} ${protocol.description} ${protocol.overview}`.toLowerCase()
      let score = 0

      // Exact classification match
      if (protocol.classification.toLowerCase().includes(query)) score += 100

      // Word matches
      queryWords.forEach(word => {
        if (bodyText.includes(word)) score += 10
      })

      // Duration matches
      if (query.includes('6 month') && protocol.duration_months === 6) score += 50
      if (query.includes('12 month') && protocol.duration_months === 12) score += 50

      if (score > 0) {
        const sources = [
          { name: data.source || 'WHO, CDC', url: 'https://www.cdc.gov/leprosy/', organization: 'CDC' }
        ]

        results.push({
          id: protocol.classification,
          category: 'treatment_protocols',
          source: data.source || 'WHO, CDC',
          confidenceLevel: 'very-high',
          lastUpdated: data.last_updated || new Date().toISOString(),
          sourceUrl: 'https://www.cdc.gov/leprosy/diagnosis/treatment-guidelines.html',
          content: `Treatment for ${protocol.classification}: ${protocol.duration_months} months`,
          relatedQueries: ['treatment', 'MDT', protocol.classification],
          matchScore: score,
          clinicalReference: `Duration: ${protocol.duration_months} months`
        })
      }
    })
  }

  /**
   * Search reactions management
   */
  private searchReactions(query: string, queryWords: string[], data: any, results: SearchResult[]) {
    const hasType1 = query.includes('type 1') || query.includes('reversal') || query.includes('reaction')
    const hasType2 = query.includes('type 2') || query.includes('enl') || query.includes('erythema')

    if (hasType1 && data.type1_reaction) {
      results.push({
        id: 'reaction_type1',
        category: 'reactions_management',
        source: data.source || 'CDC, WHO',
        confidenceLevel: 'very-high',
        lastUpdated: data.last_updated || new Date().toISOString(),
        sourceUrl: 'https://www.cdc.gov/leprosy/complications/reactions.html',
        content: data.type1_reaction?.name || 'Type 1 Reaction (Reversal Reaction)',
        relatedQueries: ['type 1 reaction', 'reversal reaction', 'neuritis'],
        matchScore: 90,
        clinicalReference: 'Cell-mediated immune dysregulation'
      })
    }

    if (hasType2 && data.type2_reaction) {
      results.push({
        id: 'reaction_type2',
        category: 'reactions_management',
        source: data.source || 'CDC, WHO',
        confidenceLevel: 'very-high',
        lastUpdated: data.last_updated || new Date().toISOString(),
        sourceUrl: 'https://www.cdc.gov/leprosy/complications/reactions.html',
        content: data.type2_reaction?.name || 'Type 2 Reaction (Erythema Nodosum Leprosum)',
        relatedQueries: ['type 2 reaction', 'ENL', 'immune complex'],
        matchScore: 90,
        clinicalReference: 'Immune complex deposition'
      })
    }
  }

  /**
   * Search FAQ database
   */
  private searchFAQ(query: string, queryWords: string[], data: any, results: SearchResult[]) {
    if (!data.faqs) return

    // Words that are questions structure - weight less
    const structureWords = new Set(['what', 'are', 'the', 'this', 'that', 'with', 'from', 'have', 'does', 'will', 'can', 'should', 'would', 'could', 'about', 'when', 'where', 'which', 'how'])
    
    // Synonym mapping for better matching
    const synonyms: { [key: string]: string[] } = {
      'food': ['eat', 'diet', 'nutrition', 'nutritious', 'foods', 'meals', 'eating'],
      'eat': ['food', 'diet', 'nutrition', 'nutritious', 'foods', 'meals', 'eating'],
      'diet': ['food', 'eat', 'nutrition', 'nutritious', 'foods', 'meals'],
      'nutrition': ['food', 'eat', 'diet', 'nutritious', 'foods'],
      'medicine': ['medication', 'drug', 'drugs', 'mdt', 'treatment'],
      'medication': ['medicine', 'drug', 'drugs', 'mdt', 'treatment'],
      'symptom': ['symptoms', 'sign', 'signs', 'condition', 'issue', 'problem'],
      'patch': ['patches', 'lesion', 'lesions', 'skin', 'mark', 'marks'],
      'nerve': ['nerves', 'nervi', 'sensation', 'numbness', 'weakness'],
      'exercise': ['activity', 'physical', 'movement', 'sport', 'sports'],
      'care': ['caring', 'caring for', 'management', 'treatment'],
      'wash': ['water', 'clean', 'cleaning', 'cleanse'],
      'eye': ['eyes', 'vision', 'sight', 'see', 'visual']
    }

    data.faqs.forEach((faq: any) => {
      const questionText = faq.question.toLowerCase()
      const answerText = faq.answer.toLowerCase()
      const combinedText = (questionText + ' ' + answerText).toLowerCase()

      let score = 0
      let matchedWords = 0
      let contentWordMatches = 0

      // Exact question match - highest priority
      if (questionText === query) {
        score += 200
        contentWordMatches++
      }

      // Exact phrase match in question or answer
      if (questionText.includes(query)) {
        score += 150
        contentWordMatches++
      } else if (answerText.includes(query)) {
        score += 100
        contentWordMatches++
      }

      // Weighted word matching - content words vs structure words
      queryWords.forEach(word => {
        if (structureWords.has(word)) {
          // Structure words - lower weight
          if (questionText.includes(word)) score += 5
          if (answerText.includes(word)) score += 2
        } else {
          // Content words - higher weight
          let wordFound = false
          if (questionText.includes(word)) {
            score += 25
            matchedWords++
            contentWordMatches++
            wordFound = true
          } else if (answerText.includes(word)) {
            score += 10
            matchedWords++
            contentWordMatches++
            wordFound = true
          }
          
          // Synonym matching if exact word not found
          if (!wordFound && synonyms[word]) {
            synonyms[word].forEach(synonym => {
              if (questionText.includes(synonym)) {
                score += 20
                matchedWords++
                contentWordMatches++
              } else if (answerText.includes(synonym)) {
                score += 8
                matchedWords++
                contentWordMatches++
              }
            })
          }
        }
      })

      // Bonus for matching multiple content words (more specific match)
      if (contentWordMatches >= 2) {
        score += contentWordMatches * 15
      }

      if (score > 0) {
        results.push({
          id: faq.id,
          category: 'faq',
          source: 'SkinNova Knowledge Base',
          confidenceLevel: 'high',
          lastUpdated: data.last_updated || new Date().toISOString(),
          sourceUrl: '',
          content: faq.answer,
          relatedQueries: faq.question.split(' ').slice(0, 3),
          matchScore: score
        })
      }
    })
  }

  /**
   * Get detailed information about a disease classification
   */
  public getClassificationDetails(type: string): LeprosyClassification | null {
    const classifications = this.knowledgeBase['leprosy-classification']?.classifications || []
    return (
      classifications.find((c: any) => c.type.toLowerCase() === type.toLowerCase() || c.code === type.toUpperCase()) ||
      null
    )
  }

  /**
   * Get treatment protocol for a classification
   */
  public getTreatmentProtocol(classification: string): TreatmentProtocol | null {
    const protocols = this.knowledgeBase['treatment-protocols']?.protocols || []
    return (
      protocols.find((p: any) => p.classification.toUpperCase().includes(classification.toUpperCase())) || null
    )
  }

  /**
   * Get all classifications
   */
  public getAllClassifications(): LeprosyClassification[] {
    return this.knowledgeBase['leprosy-classification']?.classifications || []
  }

  /**
   * Get all treatment protocols
   */
  public getAllProtocols(): TreatmentProtocol[] {
    return this.knowledgeBase['treatment-protocols']?.protocols || []
  }

  /**
   * Build a response with proper citations
   */
  public buildCitedResponse(message: string, sources: TrustedSource[]): ChatWithCitations {
    return {
      message,
      sources,
      disclaimer: 'This information is based on WHO, CDC, and ILA guidelines. Always consult your healthcare provider for personalized advice.'
    }
  }

  /**
   * Get all trusted sources for a category
   */
  public getTrustedSources(category: string): TrustedSource[] {
    const data = this.knowledgeBase[category]
    if (!data) return []

    if (data.trustedSources) {
      return data.trustedSources.map((source: any) => ({
        name: source.name || source.organization,
        organization: source.organization,
        url: source.url,
        type: source.type || 'official'
      }))
    }

    // Return default sources if not specified
    return [
      {
        name: 'World Health Organization',
        organization: 'WHO',
        url: 'https://www.who.int/health-topics/leprosy',
        type: 'official'
      },
      {
        name: 'CDC Leprosy Information',
        organization: 'CDC',
        url: 'https://www.cdc.gov/leprosy/',
        type: 'official'
      }
    ]
  }

  /**
   * Format classification for display
   */
  public formatClassificationResponse(classification: LeprosyClassification): string {
    if (!classification) return 'Unable to find classification information.'

    const sources = this.getTrustedSources('leprosy-classification')
    const sourceText = sources.map(s => `[${s.organization}](${s.url})`).join(', ')

    return `**${classification.name.toUpperCase()} (Code: ${classification.code})**

${classification.clinical_description}

**Key Features:**
- Lesion Count: ${classification.diagnostic_criteria?.lesions || 'varies'}
- Sensory Loss: ${classification.diagnostic_criteria?.sensory_loss || 'varies'}
- Nerve Involvement: ${classification.diagnostic_criteria?.nerve_thickening || 'varies'}
- Bacterial Index: ${classification.diagnostic_criteria?.bacterial_index || 'varies'}

**Treatment:** ${classification.treatment?.recommended_regimen || 'MDT as prescribed'}
**Prognosis:** ${classification.prognosis}

📌 **Sources:** ${sourceText}`
  }

  /**
   * Format treatment protocol for display
   */
  public formatTreatmentResponse(protocol: TreatmentProtocol): string {
    if (!protocol) return 'Treatment information not available.'

    const sourceText = protocol.sources.slice(0, 2).join(', ')

    return `**Treatment for ${protocol.classification}**

**Duration:** ${protocol.duration_months} months

**Key Medications:**
- Rifampicin: As per protocol
- Ofloxacin: 400mg daily
- Minocycline: 100mg daily

**Monitoring Schedule:**
- Baseline assessment before treatment
- Regular clinical assessments every 3 months
- Slit-skin smear testing as scheduled
- Post-treatment surveillance annual for 5 years

**Outcomes:**
- Non-infectious status: Usually within 2-3 weeks
- Clinical effectiveness: Lesions flatten significantly
- Bacteriological cure: Usually within ${protocol.duration_months} months

📌 **Sources:**
- WHO MDT Guidelines
- CDC Treatment Guidelines

**Important:** Take all medications as prescribed. Do not miss doses. Always consult your doctor about your specific treatment plan.`
  }

  /**
   * Get knowledge base statistics
   */
  public getStatistics() {
    const stats = {
      categories: Object.keys(this.knowledgeBase).length,
      classifications: this.knowledgeBase['leprosy-classification']?.classifications?.length || 0,
      protocols: this.knowledgeBase['treatment-protocols']?.protocols?.length || 0,
      faqs: this.knowledgeBase['faq-database']?.faqs?.length || 0,
      trustedSources: [
        'World Health Organization (WHO)',
        'Centers for Disease Control and Prevention (CDC)',
        'International Leprosy Association (ILA)'
      ]
    }
    return stats
  }
}

// Create singleton instance
export const leprosyKnowledgeService = new LeprosyKnowledgeService()

export default leprosyKnowledgeService
