// ============================================
// CRISISNET - MESH NETWORK CORE
// P2P Node Management & Discovery
// ============================================

import { Node, Connection } from '@/types'
import { CryptoUtils } from '../crypto/blockchain'

// ============================================
// NODE CONFIGURATION
// ============================================

const NODE_CONFIG = {
  MAX_CONNECTIONS: 8,
  MIN_CONNECTIONS: 2,
  DISCOVERY_INTERVAL: 5000,
  HEARTBEAT_INTERVAL: 3000,
  TIMEOUT: 10000,
  MAX_RANGE: 500, // meters in simulation
}

// ============================================
// MESH NETWORK CLASS
// ============================================

export class MeshNetwork {
  private nodes: Map<string, Node> = new Map()
  private connections: Connection[] = []
  private localNodeId: string | null = null
  
  constructor() {}
  
  /**
   * Initialize the mesh network
   */
  initialize(): void {
    this.localNodeId = CryptoUtils.generateId()
    console.log('Mesh Network Initialized:', this.localNodeId)
  }
  
  /**
   * Create a new node
   */
  createNode(name: string, x: number, y: number): Node {
    const node: Node = {
      id: CryptoUtils.generateId(),
      name,
      x,
      y,
      status: 'online',
      battery: 100,
      signalStrength: 100,
      connections: [],
      lastSeen: new Date(),
      messageCount: 0,
      ipAddress: this.generateIpAddress()
    }
    
    this.nodes.set(node.id, node)
    this.discoverConnections(node)
    return node
  }
  
  /**
   * Generate random IP address for simulation
   */
  private generateIpAddress(): string {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }
  
  /**
   * Discover nearby nodes and establish connections
   */
  discoverConnections(node: Node): void {
    const nearbyNodes = this.findNearbyNodes(node, NODE_CONFIG.MAX_RANGE)
    
    // Connect to nearest nodes up to MAX_CONNECTIONS
    nearbyNodes
      .slice(0, NODE_CONFIG.MAX_CONNECTIONS)
      .forEach(nearbyNode => {
        if (!node.connections.includes(nearbyNode.id)) {
          this.establishConnection(node, nearbyNode)
        }
      })
  }
  
  /**
   * Find nodes within range
   */
  private findNearbyNodes(node: Node, range: number): Node[] {
    return Array.from(this.nodes.values())
      .filter(n => n.id !== node.id)
      .map(n => ({
        node: n,
        distance: this.calculateDistance(node, n)
      }))
      .filter(({ distance }) => distance <= range)
      .sort((a, b) => a.distance - b.distance)
      .map(({ node }) => node)
  }
  
  /**
   * Calculate distance between two nodes
   */
  calculateDistance(nodeA: Node, nodeB: Node): number {
    return Math.sqrt(
      Math.pow(nodeB.x - nodeA.x, 2) + 
      Math.pow(nodeB.y - nodeA.y, 2)
    )
  }
  
  /**
   * Establish connection between two nodes
   */
  establishConnection(nodeA: Node, nodeB: Node): Connection {
    const distance = this.calculateDistance(nodeA, nodeB)
    
    const connection: Connection = {
      nodeA: nodeA.id,
      nodeB: nodeB.id,
      strength: Math.max(0, 100 - (distance / NODE_CONFIG.MAX_RANGE * 50)),
      latency: 10 + (distance / 10),
      active: true
    }
    
    // Update both nodes
    nodeA.connections.push(nodeB.id)
    nodeB.connections.push(nodeA.id)
    
    this.connections.push(connection)
    return connection
  }
  
  /**
   * Remove a node from the network
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (!node) return
    
    // Remove connections
    node.connections.forEach(connId => {
      const connectedNode = this.nodes.get(connId)
      if (connectedNode) {
        connectedNode.connections = connectedNode.connections.filter(id => id !== nodeId)
      }
    })
    
    // Remove from connections list
    this.connections = this.connections.filter(
      c => c.nodeA !== nodeId && c.nodeB !== nodeId
    )
    
    this.nodes.delete(nodeId)
  }
  
  /**
   * Update node status
   */
  updateNodeStatus(nodeId: string, status: Node['status']): void {
    const node = this.nodes.get(nodeId)
    if (node) {
      node.status = status
      node.lastSeen = new Date()
    }
  }
  
  /**
   * Self-healing: Reconnect isolated nodes
   */
  healNetwork(): void {
    this.nodes.forEach(node => {
      // Check for isolated nodes
      if (node.connections.length < NODE_CONFIG.MIN_CONNECTIONS && node.status === 'online') {
        this.discoverConnections(node)
      }
      
      // Check for dead connections
      node.connections = node.connections.filter(connId => {
        const connectedNode = this.nodes.get(connId)
        return connectedNode && connectedNode.status === 'online'
      })
    })
  }
  
  /**
   * Get all nodes
   */
  getNodes(): Node[] {
    return Array.from(this.nodes.values())
  }
  
  /**
   * Get all connections
   */
  getConnections(): Connection[] {
    return this.connections
  }
  
  /**
   * Get node by ID
   */
  getNode(id: string): Node | undefined {
    return this.nodes.get(id)
  }
  
  /**
   * Get network statistics
   */
  getStats() {
    const nodes = this.getNodes()
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === 'online').length,
      offlineNodes: nodes.filter(n => n.status === 'offline').length,
      totalConnections: this.connections.length,
      avgConnections: nodes.length > 0 
        ? nodes.reduce((acc, n) => acc + n.connections.length, 0) / nodes.length 
        : 0
    }
  }
  
  /**
   * Simulate node failure
   */
  simulateFailure(nodeId: string): void {
    this.updateNodeStatus(nodeId, 'offline')
    this.healNetwork()
  }
  
  /**
   * Simulate node recovery
   */
  simulateRecovery(nodeId: string): void {
    const node = this.nodes.get(nodeId)
    if (node) {
      node.status = 'online'
      this.discoverConnections(node)
    }
  }
}

// Export singleton instance
export const meshNetwork = new MeshNetwork()
