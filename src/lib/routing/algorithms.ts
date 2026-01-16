// ============================================
// CRISISNET - ROUTING ALGORITHMS
// Ant Colony Optimization + Dijkstra
// ============================================

import { Node, Route, Priority } from '@/types'

// ============================================
// ROUTING CONFIGURATION
// ============================================

const ROUTING_CONFIG = {
  ACO_ITERATIONS: 100,
  ANT_COUNT: 10,
  PHEROMONE_INITIAL: 1.0,
  PHEROMONE_EVAPORATION: 0.5,
  ALPHA: 1.0, // Pheromone importance
  BETA: 2.0,  // Heuristic importance
  Q: 100,     // Pheromone deposit factor
}

// ============================================
// DIJKSTRA'S ALGORITHM
// ============================================

export class DijkstraRouter {
  /**
   * Find shortest path using Dijkstra's algorithm
   */
  findShortestPath(
    nodes: Node[],
    sourceId: string,
    destinationId: string
  ): Route | null {
    const distances: Map<string, number> = new Map()
    const previous: Map<string, string | null> = new Map()
    const unvisited: Set<string> = new Set()
    
    // Initialize
    nodes.forEach(node => {
      distances.set(node.id, Infinity)
      previous.set(node.id, null)
      unvisited.add(node.id)
    })
    distances.set(sourceId, 0)
    
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minNode: string | null = null
      let minDistance = Infinity
      
      unvisited.forEach(nodeId => {
        const distance = distances.get(nodeId) || Infinity
        if (distance < minDistance) {
          minDistance = distance
          minNode = nodeId
        }
      })
      
      if (minNode === null || minNode === destinationId) break
      
      unvisited.delete(minNode)
      
      // Update distances for neighbors
      const currentNode = nodes.find(n => n.id === minNode)
      if (!currentNode) continue
      
      currentNode.connections.forEach(neighborId => {
        if (!unvisited.has(neighborId)) return
        
        const neighbor = nodes.find(n => n.id === neighborId)
        if (!neighbor || neighbor.status !== 'online') return
        
        const edgeCost = this.calculateEdgeCost(currentNode, neighbor)
        const newDistance = (distances.get(minNode!) || 0) + edgeCost
        
        if (newDistance < (distances.get(neighborId) || Infinity)) {
          distances.set(neighborId, newDistance)
          previous.set(neighborId, minNode)
        }
      })
    }
    
    // Reconstruct path
    const path: string[] = []
    let current: string | null = destinationId
    
    while (current !== null) {
      path.unshift(current)
      current = previous.get(current) || null
    }
    
    if (path[0] !== sourceId) return null
    
    return {
      source: sourceId,
      destination: destinationId,
      path,
      cost: distances.get(destinationId) || Infinity,
      latency: this.estimateLatency(path, nodes),
      reliability: this.calculateReliability(path, nodes)
    }
  }
  
  /**
   * Calculate edge cost between two nodes
   */
  private calculateEdgeCost(nodeA: Node, nodeB: Node): number {
    const distance = Math.sqrt(
      Math.pow(nodeB.x - nodeA.x, 2) + 
      Math.pow(nodeB.y - nodeA.y, 2)
    )
    
    // Factor in signal strength and battery
    const signalFactor = (200 - nodeA.signalStrength - nodeB.signalStrength) / 200
    const batteryFactor = (200 - nodeA.battery - nodeB.battery) / 200
    
    return distance * (1 + signalFactor * 0.5 + batteryFactor * 0.3)
  }
  
  /**
   * Estimate latency for a path
   */
  private estimateLatency(path: string[], nodes: Node[]): number {
    let totalLatency = 0
    
    for (let i = 0; i < path.length - 1; i++) {
      const nodeA = nodes.find(n => n.id === path[i])
      const nodeB = nodes.find(n => n.id === path[i + 1])
      
      if (nodeA && nodeB) {
        const distance = Math.sqrt(
          Math.pow(nodeB.x - nodeA.x, 2) + 
          Math.pow(nodeB.y - nodeA.y, 2)
        )
        totalLatency += 10 + distance / 10 // Base latency + distance factor
      }
    }
    
    return totalLatency
  }
  
  /**
   * Calculate path reliability
   */
  private calculateReliability(path: string[], nodes: Node[]): number {
    let reliability = 1.0
    
    path.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        reliability *= (node.signalStrength / 100) * (node.battery / 100)
      }
    })
    
    return reliability
  }
}

// ============================================
// ANT COLONY OPTIMIZATION
// ============================================

export class AntColonyRouter {
  private pheromones: Map<string, number> = new Map()
  
  /**
   * Find optimal path using ACO
   */
  findOptimalPath(
    nodes: Node[],
    sourceId: string,
    destinationId: string,
    priority: Priority
  ): Route | null {
    // Initialize pheromones
    this.initializePheromones(nodes)
    
    let bestRoute: Route | null = null
    let bestCost = Infinity
    
    // Run iterations
    for (let iter = 0; iter < ROUTING_CONFIG.ACO_ITERATIONS; iter++) {
      const routes: Route[] = []
      
      // Deploy ants
      for (let ant = 0; ant < ROUTING_CONFIG.ANT_COUNT; ant++) {
        const route = this.antTraverse(nodes, sourceId, destinationId, priority)
        if (route) {
          routes.push(route)
          
          if (route.cost < bestCost) {
            bestCost = route.cost
            bestRoute = route
          }
        }
      }
      
      // Evaporate and deposit pheromones
      this.evaporatePheromones()
      routes.forEach(route => this.depositPheromones(route, priority))
    }
    
    return bestRoute
  }
  
  /**
   * Initialize pheromone levels
   */
  private initializePheromones(nodes: Node[]): void {
    nodes.forEach(nodeA => {
      nodeA.connections.forEach(nodeB => {
        const key = this.getEdgeKey(nodeA.id, nodeB)
        this.pheromones.set(key, ROUTING_CONFIG.PHEROMONE_INITIAL)
      })
    })
  }
  
  /**
   * Single ant traversal
   */
  private antTraverse(
    nodes: Node[],
    sourceId: string,
    destinationId: string,
    priority: Priority
  ): Route | null {
    const path: string[] = [sourceId]
    const visited: Set<string> = new Set([sourceId])
    let currentId = sourceId
    let totalCost = 0
    
    while (currentId !== destinationId) {
      const currentNode = nodes.find(n => n.id === currentId)
      if (!currentNode) break
      
      // Get available neighbors
      const neighbors = currentNode.connections.filter(id => {
        const node = nodes.find(n => n.id === id)
        return node && node.status === 'online' && !visited.has(id)
      })
      
      if (neighbors.length === 0) break
      
      // Calculate probabilities
      const nextId = this.selectNextNode(currentNode, neighbors, nodes, destinationId)
      if (!nextId) break
      
      const nextNode = nodes.find(n => n.id === nextId)
      if (!nextNode) break
      
      // Calculate cost
      const distance = Math.sqrt(
        Math.pow(nextNode.x - currentNode.x, 2) +
        Math.pow(nextNode.y - currentNode.y, 2)
      )
      
      // Priority affects cost (critical = lower cost modifier)
      const priorityModifier = priority === 'critical' ? 0.5 :
                               priority === 'high' ? 0.75 : 1.0
      
      totalCost += distance * priorityModifier
      path.push(nextId)
      visited.add(nextId)
      currentId = nextId
    }
    
    if (currentId !== destinationId) return null
    
    return {
      source: sourceId,
      destination: destinationId,
      path,
      cost: totalCost,
      latency: path.length * 15, // Estimate
      reliability: 0.9 // Estimate
    }
  }
  
  /**
   * Select next node based on pheromone and heuristic
   */
  private selectNextNode(
    current: Node,
    neighbors: string[],
    nodes: Node[],
    destination: string
  ): string | null {
    const probabilities: Array<{ id: string; prob: number }> = []
    let total = 0
    
    neighbors.forEach(neighborId => {
      const neighbor = nodes.find(n => n.id === neighborId)
      if (!neighbor) return
      
      const edgeKey = this.getEdgeKey(current.id, neighborId)
      const pheromone = this.pheromones.get(edgeKey) || ROUTING_CONFIG.PHEROMONE_INITIAL
      
      // Heuristic: inverse of distance to destination
      const destNode = nodes.find(n => n.id === destination)
      const heuristic = destNode 
        ? 1 / (1 + Math.sqrt(
            Math.pow(destNode.x - neighbor.x, 2) +
            Math.pow(destNode.y - neighbor.y, 2)
          ))
        : 1
      
      const value = Math.pow(pheromone, ROUTING_CONFIG.ALPHA) * 
                    Math.pow(heuristic, ROUTING_CONFIG.BETA)
      
      probabilities.push({ id: neighborId, prob: value })
      total += value
    })
    
    if (total === 0) return neighbors[0]
    
    // Roulette wheel selection
    let random = Math.random() * total
    for (const { id, prob } of probabilities) {
      random -= prob
      if (random <= 0) return id
    }
    
    return probabilities[probabilities.length - 1]?.id || null
  }
  
  /**
   * Evaporate pheromones
   */
  private evaporatePheromones(): void {
    this.pheromones.forEach((value, key) => {
      this.pheromones.set(key, value * (1 - ROUTING_CONFIG.PHEROMONE_EVAPORATION))
    })
  }
  
  /**
   * Deposit pheromones on path
   */
  private depositPheromones(route: Route, priority: Priority): void {
    const deposit = ROUTING_CONFIG.Q / route.cost * 
                    (priority === 'critical' ? 2 : priority === 'high' ? 1.5 : 1)
    
    for (let i = 0; i < route.path.length - 1; i++) {
      const key = this.getEdgeKey(route.path[i], route.path[i + 1])
      const current = this.pheromones.get(key) || 0
      this.pheromones.set(key, current + deposit)
    }
  }
  
  /**
   * Get unique edge key
   */
  private getEdgeKey(nodeA: string, nodeB: string): string {
    return [nodeA, nodeB].sort().join('-')
  }
}

// ============================================
// ROUTER FACTORY
// ============================================

export class Router {
  private dijkstra = new DijkstraRouter()
  private aco = new AntColonyRouter()
  
  /**
   * Find best route based on priority
   */
  findRoute(
    nodes: Node[],
    source: string,
    destination: string,
    priority: Priority
  ): Route | null {
    // Use Dijkstra for critical (fastest)
    if (priority === 'critical') {
      return this.dijkstra.findShortestPath(nodes, source, destination)
    }
    
    // Use ACO for optimized routing
    return this.aco.findOptimalPath(nodes, source, destination, priority)
  }
  
  /**
   * Find all possible routes
   */
  findAllRoutes(
    nodes: Node[],
    source: string,
    destination: string
  ): Route[] {
    const routes: Route[] = []
    
    // Dijkstra route
    const dijkstraRoute = this.dijkstra.findShortestPath(nodes, source, destination)
    if (dijkstraRoute) routes.push({ ...dijkstraRoute, reliability: 0.95 })
    
    // ACO routes for different priorities
    const acoCritical = this.aco.findOptimalPath(nodes, source, destination, 'critical')
    if (acoCritical) routes.push(acoCritical)
    
    return routes
  }
}

export const router = new Router()
