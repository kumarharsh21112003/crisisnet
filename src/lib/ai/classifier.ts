// ============================================
// CRISISNET - AI MESSAGE CLASSIFIER
// Advanced NLP-based Priority Classification
// ============================================

import { Priority, AIClassification } from '@/types'

// ============================================
// KEYWORD DATABASES
// ============================================

const CRITICAL_KEYWORDS = {
  medical: [
    'bleeding', 'dying', 'heart attack', 'stroke', 'unconscious',
    'not breathing', 'chest pain', 'seizure', 'allergic reaction',
    'choking', 'drowning', 'overdose', 'suicide', 'poison'
  ],
  disaster: [
    'fire', 'trapped', 'collapse', 'explosion', 'gas leak',
    'building falling', 'buried', 'smoke', 'can\'t escape'
  ],
  violence: [
    'attack', 'shooting', 'stabbing', 'hostage', 'robbery',
    'assault', 'threat', 'weapon', 'gun'
  ],
  emergency: [
    'sos', 'emergency', 'help now', 'urgent', 'critical',
    'life threatening', 'dying', 'dead', 'please help'
  ]
}

const HIGH_KEYWORDS = {
  medical: [
    'injured', 'hurt', 'wound', 'broken bone', 'fracture',
    'fever', 'vomiting', 'diarrhea', 'dehydrated', 'sick'
  ],
  needs: [
    'food', 'water', 'medicine', 'shelter', 'clothes',
    'blanket', 'first aid', 'bandage', 'supplies'
  ],
  vulnerable: [
    'children', 'baby', 'elderly', 'pregnant', 'disabled',
    'wheelchair', 'oxygen', 'dialysis', 'insulin'
  ],
  situation: [
    'stranded', 'isolated', 'flooded', 'no power', 'no food',
    'running out', 'can\'t move', 'stuck'
  ]
}

const NORMAL_KEYWORDS = [
  'safe', 'okay', 'fine', 'reached', 'found',
  'checking in', 'update', 'status', 'information'
]

// ============================================
// LANGUAGE DETECTION (Hindi, English, etc.)
// ============================================

const HINDI_PATTERNS = [
  /मदद/, /बचाओ/, /आग/, /पानी/, /खाना/, /दवाई/,
  /जल्दी/, /मर/, /घायल/, /फंस/, /सुरक्षित/
]

const HINDI_CRITICAL = ['मदद', 'बचाओ', 'मर रहा', 'खून', 'आग']
const HINDI_HIGH = ['घायल', 'पानी चाहिए', 'खाना चाहिए', 'बच्चे', 'बुजुर्ग']

// ============================================
// SENTIMENT ANALYSIS (Simple lexicon-based)
// ============================================

const NEGATIVE_WORDS = [
  'help', 'danger', 'trapped', 'fear', 'scared', 'hurt',
  'pain', 'emergency', 'crisis', 'bad', 'worse', 'terrible'
]

const POSITIVE_WORDS = [
  'safe', 'okay', 'rescued', 'found', 'good', 'fine',
  'reached', 'survived', 'thank', 'relief'
]

// ============================================
// CORE CLASSIFIER CLASS
// ============================================

export class AIMessageClassifier {
  private static instance: AIMessageClassifier
  
  private constructor() {}
  
  static getInstance(): AIMessageClassifier {
    if (!AIMessageClassifier.instance) {
      AIMessageClassifier.instance = new AIMessageClassifier()
    }
    return AIMessageClassifier.instance
  }
  
  /**
   * Main classification method
   * Analyzes message and returns priority with confidence
   */
  classify(message: string): AIClassification {
    const lowerMessage = message.toLowerCase()
    const detectedLanguage = this.detectLanguage(message)
    const keywords = this.extractKeywords(lowerMessage)
    const sentiment = this.analyzeSentiment(lowerMessage)
    
    let priority: Priority = 'normal'
    let confidence = 0.5
    
    // Check for critical keywords
    const criticalScore = this.calculateCriticalScore(lowerMessage)
    if (criticalScore > 0) {
      priority = 'critical'
      confidence = Math.min(0.95, 0.7 + criticalScore * 0.1)
    }
    // Check for high priority
    else if (this.hasHighPriorityKeywords(lowerMessage)) {
      priority = 'high'
      confidence = 0.75
    }
    // Check for normal/low
    else if (this.hasNormalKeywords(lowerMessage)) {
      priority = 'normal'
      confidence = 0.8
    }
    else {
      priority = 'low'
      confidence = 0.6
    }
    
    // Boost confidence if multiple indicators match
    if (sentiment === 'negative' && priority !== 'critical') {
      confidence = Math.min(0.95, confidence + 0.1)
    }
    
    return {
      priority,
      confidence,
      keywords,
      language: detectedLanguage,
      sentiment
    }
  }
  
  /**
   * Calculate critical score based on keyword matches
   */
  private calculateCriticalScore(message: string): number {
    let score = 0
    
    Object.values(CRITICAL_KEYWORDS).forEach(keywords => {
      keywords.forEach(keyword => {
        if (message.includes(keyword)) {
          score += 1
        }
      })
    })
    
    // Check Hindi critical keywords
    HINDI_CRITICAL.forEach(keyword => {
      if (message.includes(keyword)) {
        score += 1.5 // Hindi emergencies might be more urgent
      }
    })
    
    return score
  }
  
  /**
   * Check for high priority keywords
   */
  private hasHighPriorityKeywords(message: string): boolean {
    return Object.values(HIGH_KEYWORDS).some(keywords =>
      keywords.some(keyword => message.includes(keyword))
    ) || HINDI_HIGH.some(keyword => message.includes(keyword))
  }
  
  /**
   * Check for normal keywords
   */
  private hasNormalKeywords(message: string): boolean {
    return NORMAL_KEYWORDS.some(keyword => message.includes(keyword))
  }
  
  /**
   * Detect language of message
   */
  private detectLanguage(message: string): string {
    if (HINDI_PATTERNS.some(pattern => pattern.test(message))) {
      return 'hi' // Hindi
    }
    if (/[\u0900-\u097F]/.test(message)) {
      return 'hi' // Devanagari script
    }
    if (/[\u0B80-\u0BFF]/.test(message)) {
      return 'ta' // Tamil
    }
    if (/[\u0C00-\u0C7F]/.test(message)) {
      return 'te' // Telugu
    }
    return 'en' // Default English
  }
  
  /**
   * Extract important keywords from message
   */
  private extractKeywords(message: string): string[] {
    const words = message.split(/\s+/)
    const allKeywords = [
      ...Object.values(CRITICAL_KEYWORDS).flat(),
      ...Object.values(HIGH_KEYWORDS).flat(),
      ...NORMAL_KEYWORDS
    ]
    
    return words.filter(word => 
      allKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
    )
  }
  
  /**
   * Analyze sentiment of message
   */
  private analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' {
    let negativeScore = 0
    let positiveScore = 0
    
    NEGATIVE_WORDS.forEach(word => {
      if (message.includes(word)) negativeScore++
    })
    
    POSITIVE_WORDS.forEach(word => {
      if (message.includes(word)) positiveScore++
    })
    
    if (negativeScore > positiveScore) return 'negative'
    if (positiveScore > negativeScore) return 'positive'
    return 'neutral'
  }
  
  /**
   * Get priority color for UI
   */
  static getPriorityColor(priority: Priority): string {
    switch (priority) {
      case 'critical': return '#EF4444'
      case 'high': return '#F59E0B'
      case 'normal': return '#10B981'
      case 'low': return '#6B7280'
      default: return '#6B7280'
    }
  }
  
  /**
   * Get routing priority (lower = faster)
   */
  static getRoutingPriority(priority: Priority): number {
    switch (priority) {
      case 'critical': return 1
      case 'high': return 2
      case 'normal': return 3
      case 'low': return 4
      default: return 5
    }
  }
}

// Export singleton instance
export const aiClassifier = AIMessageClassifier.getInstance()
