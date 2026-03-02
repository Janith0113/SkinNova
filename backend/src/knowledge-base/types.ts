/**
 * Leprosy Knowledge Base - Type Definitions
 * Defines all types and interfaces for the knowledge system
 */

export interface KnowledgeEntry {
  id: string
  category: string
  source: string
  confidenceLevel: 'very-high' | 'high' | 'medium' | 'low'
  publishedDate?: string
  lastUpdated: string
  sourceUrl: string
  content: string
  relatedQueries: string[]
  clinicalReference?: string
}

export interface TrustedSource {
  name: string
  organization: string
  url: string
  type: 'official' | 'research' | 'clinical' | 'educational'
  geographicCoverage?: string
  lastVerified?: string
}

export interface ChatWithCitations {
  message: string
  sources: TrustedSource[]
  disclaimer?: string
  clinicalReference?: string
}

export interface SearchResult extends KnowledgeEntry {
  matchScore?: number
}

export interface LeprosyClassification {
  id: string
  name: string
  code: string
  clinical_description: string
  diagnostic_criteria: Record<string, any>
  clinical_features: string[]
  progression?: Record<string, any>
  treatment: Record<string, any>
  prognosis: string
  sources: string[]
}

export interface TreatmentProtocol {
  id: string
  classification: string
  duration_months: number
  total_supervised_doses: number
  total_unsupervised_doses?: number
  description: string
  overview: string
  medications: Record<string, any>
  administration_schedule: Record<string, any>
  monitoring: Record<string, any>
  success_metrics: Record<string, any>
  sources: string[]
}

export interface ReactionInfo {
  name: string
  pathogenesis: string
  timing: string[]
  frequency?: string
  signs_symptoms: Record<string, any>
  diagnosis: Record<string, any>
  treatment: Record<string, any>
  monitoring: string[]
}

export interface FAQEntry {
  id: string
  question: string
  answer: string
  category: string
  source?: string
  sources?: TrustedSource[]
}

export interface KnowledgeBaseData {
  category: string
  source?: string
  trustedSources?: TrustedSource[]
  lastUpdated?: string
  confidenceLevel?: string
  [key: string]: any
}
