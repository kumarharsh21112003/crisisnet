// ============================================
// CRISISNET - FULL NETWORK SIMULATION
// Realistic Disaster Scenario Simulator
// ============================================

import { Node, Message, Priority, CrisisEvent } from '@/types'

// ============================================
// SIMULATION CONFIGURATION
// ============================================

export const SIMULATION_CONFIG = {
  // Node spawn settings
  minNodes: 8,
  maxNodes: 50,
  spawnInterval: 5000,
  
  // Message settings
  messageInterval: 3000,
  criticalMessageChance: 0.1,
  highMessageChance: 0.25,
  
  // Failure simulation
  nodeFailureRate: 0.02,
  connectionDropRate: 0.05,
  recoveryRate: 0.1,
  
  // Crisis simulation
  crisisChance: 0.001,
  crisisTypes: ['flood', 'earthquake', 'fire', 'storm'] as const,
  
  // Performance
  tickRate: 1000 / 60, // 60 FPS
}

// ============================================
// PREDEFINED MESSAGES (Realistic)
// ============================================

const EMERGENCY_MESSAGES = {
  critical: [
    'URGENT: Building collapsed at Sector 17, multiple people trapped!',
    'SOS! Fire spreading rapidly in residential area, need immediate evacuation',
    'Medical emergency: Heart attack victim, need ambulance NOW',
    'Help! Flood water rising fast, family stuck on rooftop',
    'मदद! घर में आग लगी है, बच्चे फंसे हुए हैं',
    'Emergency: Gas leak detected, area needs immediate evacuation',
    'Critical: Bridge collapse, vehicles in water, send rescue teams',
    'SOS: Earthquake aftershock, building unstable, people injured'
  ],
  high: [
    'Need medical supplies for injured family members',
    'Running out of drinking water, 10 people need help',
    'Elderly person needs evacuation, unable to walk',
    'Children separated from parents at relief camp',
    'खाना और पानी की जरूरत है, 3 दिन से भूखे हैं',
    'Pregnant woman needs medical attention urgently',
    'Power outage for 48 hours, medical equipment failing',
    'Road blocked by debris, cannot reach hospital'
  ],
  normal: [
    'Safe and accounted for at relief camp Zone B',
    'Update: All family members reunited, we are okay',
    'Reached safe zone, need blankets and food',
    'Checking in: Located at government school shelter',
    'हम सुरक्षित हैं, राहत शिविर पहुंच गए',
    'Status update: Power restored in our area',
    'Found lost pet, looking for owner - golden retriever',
    'Volunteers needed at Community Center'
  ]
}

// ============================================
// NODE GENERATOR
// ============================================

export function generateRealisticNode(index: number, areaWidth: number, areaHeight: number): Node {
  const nodeNames = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
    'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'
  ]
  
  // Cluster nodes in groups (simulating neighborhoods)
  const clusterCount = 4
  const clusterIndex = index % clusterCount
  const clusterCenterX = ((clusterIndex % 2) + 0.5) * (areaWidth / 2)
  const clusterCenterY = (Math.floor(clusterIndex / 2) + 0.5) * (areaHeight / 2)
  
  const x = clusterCenterX + (Math.random() - 0.5) * (areaWidth / 3)
  const y = clusterCenterY + (Math.random() - 0.5) * (areaHeight / 3)
  
  return {
    id: `node-${Date.now()}-${index}`,
    name: nodeNames[index % nodeNames.length] + (index >= nodeNames.length ? `-${Math.floor(index / nodeNames.length)}` : ''),
    x: Math.max(50, Math.min(areaWidth - 50, x)),
    y: Math.max(50, Math.min(areaHeight - 50, y)),
    status: 'online',
    battery: 70 + Math.random() * 30,
    signalStrength: 60 + Math.random() * 40,
    connections: [],
    lastSeen: new Date(),
    messageCount: 0,
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }
}

// ============================================
// MESSAGE GENERATOR
// ============================================

export function generateRandomMessage(nodes: Node[]): Message | null {
  const onlineNodes = nodes.filter(n => n.status === 'online')
  if (onlineNodes.length < 2) return null
  
  // Determine priority
  const rand = Math.random()
  let priority: Priority
  let messagePool: string[]
  
  if (rand < SIMULATION_CONFIG.criticalMessageChance) {
    priority = 'critical'
    messagePool = EMERGENCY_MESSAGES.critical
  } else if (rand < SIMULATION_CONFIG.criticalMessageChance + SIMULATION_CONFIG.highMessageChance) {
    priority = 'high'
    messagePool = EMERGENCY_MESSAGES.high
  } else {
    priority = 'normal'
    messagePool = EMERGENCY_MESSAGES.normal
  }
  
  const fromNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
  let toNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
  while (toNode.id === fromNode.id) {
    toNode = onlineNodes[Math.floor(Math.random() * onlineNodes.length)]
  }
  
  const content = messagePool[Math.floor(Math.random() * messagePool.length)]
  const timestamp = new Date()
  const hash = generateSimpleHash(content + timestamp.getTime())
  
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from: fromNode.name,
    to: toNode.name,
    content,
    priority,
    timestamp,
    hops: [fromNode.name],
    delivered: false,
    hash,
    signature: generateSimpleHash(hash + 'privkey'),
    encrypted: Math.random() > 0.3,
    ttl: priority === 'critical' ? 600 : priority === 'high' ? 300 : 120,
    retryCount: 0
  }
}

function generateSimpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0').toUpperCase()
}

// ============================================
// CRISIS EVENT GENERATOR
// ============================================

export function generateCrisisEvent(nodes: Node[]): CrisisEvent | null {
  if (Math.random() > SIMULATION_CONFIG.crisisChance * 10) return null
  
  const types: CrisisEvent['type'][] = ['flood', 'earthquake', 'fire', 'storm']
  const type = types[Math.floor(Math.random() * types.length)]
  
  // Pick a random area
  const centerNode = nodes[Math.floor(Math.random() * nodes.length)]
  
  const radiusKm = type === 'earthquake' ? 50 :
                   type === 'storm' ? 30 :
                   type === 'flood' ? 15 : 5
  
  const severity: CrisisEvent['severity'] = 
    Math.random() < 0.1 ? 'critical' :
    Math.random() < 0.3 ? 'high' :
    Math.random() < 0.6 ? 'medium' : 'low'
  
  // Calculate affected nodes
  const affectedNodes = nodes
    .filter(n => {
      const distance = Math.hypot(n.x - centerNode.x, n.y - centerNode.y)
      return distance < radiusKm * 5 // Scale for simulation
    })
    .map(n => n.id)
  
  return {
    id: `crisis-${Date.now()}`,
    type,
    severity,
    location: {
      lat: 25.5 + (centerNode.y / 500) - 0.5,
      lng: 85.0 + (centerNode.x / 500) - 0.5
    },
    radius: radiusKm,
    timestamp: new Date(),
    affectedNodes
  }
}

// ============================================
// NETWORK SIMULATOR CLASS
// ============================================

export class NetworkSimulator {
  private nodes: Node[] = []
  private messages: Message[] = []
  private crisisEvents: CrisisEvent[] = []
  private isRunning: boolean = false
  private tickInterval: NodeJS.Timeout | null = null
  private messageInterval: NodeJS.Timeout | null = null
  
  private onNodeUpdate?: (nodes: Node[]) => void
  private onMessageReceived?: (message: Message) => void
  private onCrisisDetected?: (event: CrisisEvent) => void
  private onStatsUpdate?: (stats: SimulationStats) => void
  
  constructor() {}
  
  /**
   * Initialize simulation with nodes
   */
  init(nodeCount: number = 12, areaWidth: number = 400, areaHeight: number = 400): void {
    this.nodes = []
    
    for (let i = 0; i < nodeCount; i++) {
      const node = generateRealisticNode(i, areaWidth, areaHeight)
      this.nodes.push(node)
    }
    
    // Create mesh connections
    this.rebuildConnections()
  }
  
  /**
   * Rebuild mesh connections
   */
  private rebuildConnections(): void {
    this.nodes.forEach(node => {
      const nearby = this.nodes
        .filter(n => n.id !== node.id && n.status === 'online')
        .map(n => ({
          node: n,
          distance: Math.hypot(n.x - node.x, n.y - node.y)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .map(item => item.node.id)
      
      node.connections = nearby
    })
  }
  
  /**
   * Start simulation
   */
  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    
    // Main tick loop
    this.tickInterval = setInterval(() => this.tick(), SIMULATION_CONFIG.tickRate * 10)
    
    // Message generation loop
    this.messageInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const message = generateRandomMessage(this.nodes)
        if (message) {
          this.handleNewMessage(message)
        }
      }
    }, SIMULATION_CONFIG.messageInterval)
    
    console.log('[Simulator] Started')
  }
  
  /**
   * Stop simulation
   */
  stop(): void {
    this.isRunning = false
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
    
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
      this.messageInterval = null
    }
    
    console.log('[Simulator] Stopped')
  }
  
  /**
   * Simulation tick
   */
  private tick(): void {
    // Update node states
    this.nodes = this.nodes.map(node => {
      // Battery drain
      let battery = node.battery - Math.random() * 0.2
      
      // Random failures
      let status = node.status
      if (node.status === 'online' && Math.random() < SIMULATION_CONFIG.nodeFailureRate) {
        status = 'offline'
      } else if (node.status === 'offline' && Math.random() < SIMULATION_CONFIG.recoveryRate) {
        status = 'online'
        battery = 100 // Assume recharge
      }
      
      // Signal fluctuation
      const signalStrength = Math.max(30, Math.min(100, 
        node.signalStrength + (Math.random() - 0.5) * 5
      ))
      
      return {
        ...node,
        battery: Math.max(0, battery),
        status,
        signalStrength,
        lastSeen: status === 'online' ? new Date() : node.lastSeen
      }
    })
    
    // Rebuild connections after status changes
    this.rebuildConnections()
    
    // Check for crisis events
    const crisis = generateCrisisEvent(this.nodes)
    if (crisis) {
      this.crisisEvents.push(crisis)
      this.onCrisisDetected?.(crisis)
      
      // Affect nodes in crisis zone
      crisis.affectedNodes.forEach(nodeId => {
        const node = this.nodes.find(n => n.id === nodeId)
        if (node && Math.random() < 0.3) {
          node.status = 'offline'
        }
      })
    }
    
    // Notify listeners
    this.onNodeUpdate?.(this.nodes)
    this.onStatsUpdate?.(this.getStats())
  }
  
  /**
   * Handle new message
   */
  private handleNewMessage(message: Message): void {
    this.messages.push(message)
    this.onMessageReceived?.(message)
    
    // Simulate routing and delivery
    const deliveryTime = message.priority === 'critical' ? 500 :
                         message.priority === 'high' ? 1000 : 2000
    
    setTimeout(() => {
      // Find path through mesh
      const onlineNodes = this.nodes.filter(n => n.status === 'online')
      const hops = [message.from]
      
      // Simulate routing through mesh
      let current = this.nodes.find(n => n.name === message.from)
      const target = this.nodes.find(n => n.name === message.to)
      
      if (current && target) {
        for (let i = 0; i < 5 && current && current.name !== target.name; i++) {
          if (current.connections.length === 0) break
          const nextId: string = current.connections[Math.floor(Math.random() * current.connections.length)]
          const next: Node | undefined = this.nodes.find(n => n.id === nextId)
          if (next && !hops.includes(next.name)) {
            hops.push(next.name)
            current = next
          }
        }
        hops.push(target.name)
      }
      
      // Mark as delivered
      this.messages = this.messages.map(m => 
        m.id === message.id ? { ...m, hops, delivered: true } : m
      )
      
      // Update node message counts
      hops.forEach(nodeName => {
        const node = this.nodes.find(n => n.name === nodeName)
        if (node) node.messageCount++
      })
      
    }, deliveryTime)
  }
  
  /**
   * Get simulation stats
   */
  getStats(): SimulationStats {
    const online = this.nodes.filter(n => n.status === 'online').length
    const delivered = this.messages.filter(m => m.delivered).length
    
    return {
      totalNodes: this.nodes.length,
      onlineNodes: online,
      offlineNodes: this.nodes.length - online,
      totalMessages: this.messages.length,
      deliveredMessages: delivered,
      pendingMessages: this.messages.length - delivered,
      activeCrises: this.crisisEvents.filter(c => 
        Date.now() - c.timestamp.getTime() < 60 * 60 * 1000
      ).length,
      networkHealth: Math.floor((online / Math.max(this.nodes.length, 1)) * 100),
      avgBattery: Math.floor(
        this.nodes.reduce((acc, n) => acc + n.battery, 0) / Math.max(this.nodes.length, 1)
      ),
      avgSignal: Math.floor(
        this.nodes.reduce((acc, n) => acc + n.signalStrength, 0) / Math.max(this.nodes.length, 1)
      )
    }
  }
  
  /**
   * Get current nodes
   */
  getNodes(): Node[] {
    return [...this.nodes]
  }
  
  /**
   * Get messages
   */
  getMessages(): Message[] {
    return [...this.messages]
  }
  
  /**
   * Set event listeners
   */
  on(event: 'nodeUpdate' | 'message' | 'crisis' | 'stats', callback: Function): void {
    switch (event) {
      case 'nodeUpdate':
        this.onNodeUpdate = callback as any
        break
      case 'message':
        this.onMessageReceived = callback as any
        break
      case 'crisis':
        this.onCrisisDetected = callback as any
        break
      case 'stats':
        this.onStatsUpdate = callback as any
        break
    }
  }
  
  /**
   * Manually trigger crisis
   */
  triggerCrisis(type: CrisisEvent['type']): void {
    const centerNode = this.nodes[Math.floor(Math.random() * this.nodes.length)]
    
    const crisis: CrisisEvent = {
      id: `crisis-${Date.now()}`,
      type,
      severity: 'high',
      location: { lat: 25.5, lng: 85.0 },
      radius: 20,
      timestamp: new Date(),
      affectedNodes: this.nodes.slice(0, 5).map(n => n.id)
    }
    
    this.crisisEvents.push(crisis)
    this.onCrisisDetected?.(crisis)
    
    // Affect nodes
    crisis.affectedNodes.forEach(nodeId => {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node) node.status = 'offline'
    })
  }
  
  /**
   * Add new node dynamically
   */
  addNode(): Node {
    const newNode = generateRealisticNode(this.nodes.length, 400, 400)
    this.nodes.push(newNode)
    this.rebuildConnections()
    return newNode
  }
  
  /**
   * Send custom message
   */
  sendMessage(content: string, from: string, to: string): Message | null {
    const fromNode = this.nodes.find(n => n.name === from)
    const toNode = this.nodes.find(n => n.name === to)
    
    if (!fromNode || !toNode) return null
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      from,
      to,
      content,
      priority: 'normal', // Will be classified
      timestamp: new Date(),
      hops: [from],
      delivered: false,
      hash: generateSimpleHash(content + Date.now()),
      signature: '',
      encrypted: true,
      ttl: 300,
      retryCount: 0
    }
    
    this.handleNewMessage(message)
    return message
  }
}

// ============================================
// TYPES
// ============================================

export interface SimulationStats {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
  totalMessages: number
  deliveredMessages: number
  pendingMessages: number
  activeCrises: number
  networkHealth: number
  avgBattery: number
  avgSignal: number
}

// Export singleton
export const simulator = new NetworkSimulator()
