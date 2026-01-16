// ============================================
// CRISISNET - TYPE DEFINITIONS
// ============================================

export interface Node {
  id: string
  name: string
  x: number
  y: number
  status: 'online' | 'offline' | 'busy' | 'relay'
  battery: number
  signalStrength: number
  connections: string[]
  lastSeen: Date
  messageCount: number
  ipAddress: string
  location?: {
    lat: number
    lng: number
  }
}

export interface Message {
  id: string
  from: string
  to: string
  content: string
  priority: Priority
  timestamp: Date
  hops: string[]
  delivered: boolean
  hash: string
  signature: string
  encrypted: boolean
  ttl: number // Time to live
  retryCount: number
}

export type Priority = 'critical' | 'high' | 'normal' | 'low'

export interface NetworkStats {
  totalNodes: number
  activeNodes: number
  offlineNodes: number
  busyNodes: number
  messagesDelivered: number
  messagesPending: number
  messagesFailed: number
  avgLatency: number
  maxLatency: number
  minLatency: number
  networkHealth: number
  bandwidth: number
  uptime: number
}

export interface Route {
  source: string
  destination: string
  path: string[]
  cost: number
  latency: number
  reliability: number
}

export interface Connection {
  nodeA: string
  nodeB: string
  strength: number
  latency: number
  active: boolean
}

export interface BlockchainEntry {
  index: number
  timestamp: Date
  messageHash: string
  previousHash: string
  nonce: number
  data: string
}

export interface AIClassification {
  priority: Priority
  confidence: number
  keywords: string[]
  language: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface CompressionResult {
  original: string
  compressed: string
  ratio: number
  algorithm: string
}

export interface CrisisEvent {
  id: string
  type: 'flood' | 'earthquake' | 'fire' | 'storm' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  location: { lat: number; lng: number }
  radius: number
  timestamp: Date
  affectedNodes: string[]
}
