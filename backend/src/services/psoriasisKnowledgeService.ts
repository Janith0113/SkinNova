import fs from 'fs'
import path from 'path'
import { KnowledgeBaseData, SearchResult, TrustedSource } from '../knowledge-base/types'

export class PsoriasisKnowledgeService {
  private knowledgeBase: any = {}
  private readonly KB_PATH = path.join(__dirname, '../knowledge-base')

  constructor() {
    this.loadKnowledgeBase()
  }

  private loadKnowledgeBase() {
    const files = [
      'psoriasis-faq.json',
      'psoriasis-guidelines.json'
    ]

    files.forEach(file => {
      try {
        const filePath = path.join(this.KB_PATH, file)
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8')
          const category = file.replace('.json', '')
          this.knowledgeBase[category] = JSON.parse(data)
          console.log(`✅ Loaded psoriasis KB: ${category}`)
        } else {
          console.warn(`⚠️ Psoriasis KB file not found: ${filePath}`)
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load psoriasis KB ${file}:`, error instanceof Error ? error.message : error)
      }
    })
  }

  public reloadKnowledgeBase() {
    this.knowledgeBase = {}
    this.loadKnowledgeBase()
  }

  /**
   * Simple FAQ-focused search. Returns matched FAQ entries with a score.
   */
  public searchKnowledge(query: string): SearchResult[] {
    const results: SearchResult[] = []
    if (!query || !this.knowledgeBase['psoriasis-faq']?.faqs) return results

    const q = query.toLowerCase()
    const words = q.split(' ').filter(w => w.length > 2)

    this.knowledgeBase['psoriasis-faq'].faqs.forEach((faq: any) => {
      const question = faq.question.toLowerCase()
      const answer = faq.answer.toLowerCase()
      let score = 0

      if (question === q) score += 200
      if (question.includes(q)) score += 120
      if (answer.includes(q)) score += 80

      words.forEach(w => {
        if (question.includes(w)) score += 20
        if (answer.includes(w)) score += 8
      })

      if (score > 0) {
        results.push({
          id: faq.id,
          category: 'faq',
          source: faq.source || 'SkinNova Psoriasis KB',
          confidenceLevel: 'high',
          lastUpdated: this.knowledgeBase['psoriasis-faq']?.last_updated || new Date().toISOString(),
          sourceUrl: this.knowledgeBase['psoriasis-faq']?.trustedSources?.[0]?.url || '',
          content: faq.answer,
          relatedQueries: [faq.question],
          matchScore: score
        })
      }
    })

    // Also search guidelines titles/sections
    if (this.knowledgeBase['psoriasis-guidelines']?.sections) {
      this.knowledgeBase['psoriasis-guidelines'].sections.forEach((sec: any) => {
        const title = (sec.title || '').toLowerCase()
        const body = (sec.content || '').toLowerCase()
        let score = 0
        if (title.includes(q)) score += 60
        if (body.includes(q)) score += 30
        words.forEach(w => {
          if (title.includes(w)) score += 8
          if (body.includes(w)) score += 3
        })
        if (score > 0) {
          results.push({
            id: sec.id || title.slice(0, 40),
            category: 'guideline',
            source: this.knowledgeBase['psoriasis-guidelines']?.source || 'Dermatology Guidelines',
            confidenceLevel: 'medium',
            lastUpdated: this.knowledgeBase['psoriasis-guidelines']?.last_updated || new Date().toISOString(),
            sourceUrl: this.knowledgeBase['psoriasis-guidelines']?.trustedSources?.[0]?.url || '',
            content: sec.content || sec.summary || title,
            relatedQueries: [sec.title || 'guideline'],
            matchScore: score
          })
        }
      })
    }

    return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  public getStatistics() {
    return {
      categories: Object.keys(this.knowledgeBase).length,
      faqs: this.knowledgeBase['psoriasis-faq']?.faqs?.length || 0,
      guidelineSections: this.knowledgeBase['psoriasis-guidelines']?.sections?.length || 0,
      trustedSources: this.getTrustedSources()
    }
  }

  public getTrustedSources(): TrustedSource[] {
    const sources: TrustedSource[] = []
    const faqSources = this.knowledgeBase['psoriasis-faq']?.trustedSources || []
    const guideSources = this.knowledgeBase['psoriasis-guidelines']?.trustedSources || []
    ;[...faqSources, ...guideSources].forEach((s: any) => {
      sources.push({
        name: s.name || s.organization || s.title || 'Unknown',
        organization: s.organization || s.name || 'Unknown',
        url: s.url || '',
        type: s.type || 'official'
      })
    })

    if (sources.length === 0) {
      sources.push({ name: 'National Psoriasis Foundation', organization: 'NPF', url: 'https://www.psoriasis.org', type: 'official' })
    }

    return sources
  }
}

export const psoriasisKnowledgeService = new PsoriasisKnowledgeService()

export default psoriasisKnowledgeService
