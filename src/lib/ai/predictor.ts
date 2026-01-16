// ============================================
// CRISISNET - CRISIS PREDICTOR
// ML-based Disaster Pattern Analysis
// ============================================

import { Message, CrisisEvent, Node, Priority } from '@/types'

// ============================================
// CRISIS PATTERN DATABASE
// ============================================

const CRISIS_PATTERNS = {
  flood: {
    keywords: ['flood', 'water rising', 'drowning', 'stuck', 'rain', 'dam', 'overflow'],
    messageThreshold: 5,
    radiusKm: 10
  },
  earthquake: {
    keywords: ['earthquake', 'tremor', 'shaking', 'building collapse', 'rubble', 'aftershock'],
    messageThreshold: 3,
    radiusKm: 50
  },
  fire: {
    keywords: ['fire', 'smoke', 'burning', 'flames', 'evacuation', 'heat'],
    messageThreshold: 2,
    radiusKm: 5
  },
  storm: {
    keywords: ['storm', 'cyclone', 'hurricane', 'wind', 'tornado', 'lightning'],
    messageThreshold: 4,
    radiusKm: 30
  }
}

// ============================================
// CRISIS PREDICTOR CLASS
// ============================================

export class CrisisPredictor {
  private messageHistory: Message[] = []
  private predictions: CrisisEvent[] = []
  private alertThreshold = 0.7
  
  constructor() {}
  
  /**
   * Add message to analysis pool
   */
  addMessage(message: Message): void {
    this.messageHistory.push(message)
    
    // Keep only recent messages (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    this.messageHistory = this.messageHistory.filter(m => m.timestamp > oneHourAgo)
    
    // Analyze patterns
    this.analyzePatterns()
  }
  
  /**
   * Analyze message patterns for crisis prediction
   */
  private analyzePatterns(): void {
    Object.entries(CRISIS_PATTERNS).forEach(([type, pattern]) => {
      const matchingMessages = this.messageHistory.filter(msg =>
        pattern.keywords.some(keyword => 
          msg.content.toLowerCase().includes(keyword)
        )
      )
      
      if (matchingMessages.length >= pattern.messageThreshold) {
        this.createPrediction(type as CrisisEvent['type'], matchingMessages)
      }
    })
  }
  
  /**
   * Create crisis prediction
   */
  private createPrediction(
    type: CrisisEvent['type'],
    messages: Message[]
  ): void {
    // Calculate center of crisis (average location of messages)
    // In real scenario, we'd use actual GPS coordinates
    const existingPrediction = this.predictions.find(
      p => p.type === type && 
      Date.now() - p.timestamp.getTime() < 30 * 60 * 1000 // Within 30 mins
    )
    
    if (existingPrediction) {
      // Update existing prediction
      existingPrediction.severity = this.calculateSeverity(messages)
      this.updateAffectedNodes(existingPrediction)
    } else {
      // Create new prediction
      const patternType = type as keyof typeof CRISIS_PATTERNS
      const pattern = CRISIS_PATTERNS[patternType]
      const event: CrisisEvent = {
        id: `crisis-${Date.now()}`,
        type,
        severity: this.calculateSeverity(messages),
        location: this.estimateLocation(messages),
        radius: pattern ? pattern.radiusKm : 10,
        timestamp: new Date(),
        affectedNodes: []
      }
      
      this.predictions.push(event)
    }
  }
  
  /**
   * Calculate severity based on message content
   */
  private calculateSeverity(messages: Message[]): CrisisEvent['severity'] {
    const criticalCount = messages.filter(m => m.priority === 'critical').length
    const highCount = messages.filter(m => m.priority === 'high').length
    
    if (criticalCount >= 3 || (criticalCount >= 1 && messages.length >= 10)) {
      return 'critical'
    }
    if (criticalCount >= 1 || highCount >= 5) {
      return 'high'
    }
    if (highCount >= 2 || messages.length >= 5) {
      return 'medium'
    }
    return 'low'
  }
  
  /**
   * Estimate crisis location (simulated)
   */
  private estimateLocation(messages: Message[]): { lat: number; lng: number } {
    // In real scenario, this would use actual GPS data from messages
    // For simulation, return random location near Bihar/Delhi
    return {
      lat: 25.5 + (Math.random() - 0.5) * 2,
      lng: 85.0 + (Math.random() - 0.5) * 2
    }
  }
  
  /**
   * Update affected nodes for a crisis
   */
  private updateAffectedNodes(event: CrisisEvent): void {
    // This would be called with actual node data
    // For now, just log
    console.log(`Updating affected nodes for ${event.type} crisis`)
  }
  
  /**
   * Get all active predictions
   */
  getPredictions(): CrisisEvent[] {
    return this.predictions.filter(p =>
      Date.now() - p.timestamp.getTime() < 60 * 60 * 1000 // Active in last hour
    )
  }
  
  /**
   * Get crisis heatmap data
   */
  getHeatmapData(): Array<{ lat: number; lng: number; intensity: number }> {
    return this.predictions.map(p => ({
      lat: p.location.lat,
      lng: p.location.lng,
      intensity: p.severity === 'critical' ? 1.0 :
                 p.severity === 'high' ? 0.75 :
                 p.severity === 'medium' ? 0.5 : 0.25
    }))
  }
  
  /**
   * Get resource allocation suggestions
   */
  getResourceSuggestions(nodes: Node[]): Array<{
    type: string
    location: { lat: number; lng: number }
    priority: Priority
    suggestedResources: string[]
  }> {
    return this.predictions.map(p => ({
      type: p.type,
      location: p.location,
      priority: p.severity === 'critical' ? 'critical' as Priority :
                p.severity === 'high' ? 'high' as Priority : 'normal' as Priority,
      suggestedResources: this.getSuggestedResources(p.type)
    }))
  }
  
  /**
   * Get suggested resources based on crisis type
   */
  private getSuggestedResources(type: CrisisEvent['type']): string[] {
    switch (type) {
      case 'flood':
        return ['Boats', 'Life Jackets', 'Pumps', 'Drinking Water', 'First Aid']
      case 'earthquake':
        return ['Search & Rescue Teams', 'Medical Kits', 'Cranes', 'Tents', 'Generators']
      case 'fire':
        return ['Fire Trucks', 'Extinguishers', 'Water Tankers', 'Burns Medicine', 'Ambulances']
      case 'storm':
        return ['Shelters', 'Food Supplies', 'Blankets', 'Communication Equipment', 'Generators']
      default:
        return ['First Aid', 'Food', 'Water', 'Shelter', 'Communication']
    }
  }
  
  /**
   * Calculate crisis probability
   */
  calculateCrisisProbability(messages: Message[]): {
    flood: number
    earthquake: number
    fire: number
    storm: number
  } {
    const result = { flood: 0, earthquake: 0, fire: 0, storm: 0 }
    
    Object.entries(CRISIS_PATTERNS).forEach(([type, pattern]) => {
      const matchCount = messages.filter(msg =>
        pattern.keywords.some(keyword =>
          msg.content.toLowerCase().includes(keyword)
        )
      ).length
      
      result[type as keyof typeof result] = Math.min(1, matchCount / (pattern.messageThreshold * 2))
    })
    
    return result
  }
}

export const crisisPredictor = new CrisisPredictor()
