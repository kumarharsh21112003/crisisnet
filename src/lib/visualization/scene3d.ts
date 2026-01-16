// ============================================
// CRISISNET - 3D NETWORK VISUALIZATION
// Three.js Based Real-time Visualization
// ============================================

import { Node, Connection, Message } from '@/types'

// ============================================
// 3D SCENE CONFIGURATION
// ============================================

export const SCENE_CONFIG = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 50, z: 100 }
  },
  colors: {
    background: 0x0a0a0f,
    nodeOnline: 0x00d9ff,
    nodeOffline: 0xef4444,
    nodeBusy: 0xf59e0b,
    connectionActive: 0x00d9ff,
    connectionInactive: 0x3a3a3a,
    messageCritical: 0xef4444,
    messageHigh: 0xf59e0b,
    messageNormal: 0x10b981,
    grid: 0x1a1a2e
  },
  animation: {
    rotationSpeed: 0.001,
    pulseSpeed: 0.05,
    dataFlowSpeed: 0.02
  }
}

// ============================================
// 3D NODE CLASS
// ============================================

export class Node3D {
  id: string
  position: { x: number; y: number; z: number }
  color: number
  scale: number
  pulsePhase: number
  connections: string[]
  
  constructor(node: Node) {
    this.id = node.id
    this.position = {
      x: (node.x - 200) * 0.5,
      y: Math.random() * 20 - 10,
      z: (node.y - 200) * 0.5
    }
    this.color = node.status === 'online' 
      ? SCENE_CONFIG.colors.nodeOnline 
      : SCENE_CONFIG.colors.nodeOffline
    this.scale = 1
    this.pulsePhase = Math.random() * Math.PI * 2
    this.connections = node.connections
  }
  
  update(deltaTime: number): void {
    this.pulsePhase += SCENE_CONFIG.animation.pulseSpeed
    this.scale = 1 + Math.sin(this.pulsePhase) * 0.1
  }
  
  getVertices(): number[] {
    return [this.position.x, this.position.y, this.position.z]
  }
}

// ============================================
// 3D CONNECTION CLASS
// ============================================

export class Connection3D {
  from: { x: number; y: number; z: number }
  to: { x: number; y: number; z: number }
  active: boolean
  dataFlowProgress: number
  
  constructor(fromNode: Node3D, toNode: Node3D, active: boolean) {
    this.from = { ...fromNode.position }
    this.to = { ...toNode.position }
    this.active = active
    this.dataFlowProgress = 0
  }
  
  update(deltaTime: number): void {
    if (this.active) {
      this.dataFlowProgress += SCENE_CONFIG.animation.dataFlowSpeed
      if (this.dataFlowProgress > 1) {
        this.dataFlowProgress = 0
      }
    }
  }
  
  getDataFlowPosition(): { x: number; y: number; z: number } {
    return {
      x: this.from.x + (this.to.x - this.from.x) * this.dataFlowProgress,
      y: this.from.y + (this.to.y - this.from.y) * this.dataFlowProgress,
      z: this.from.z + (this.to.z - this.from.z) * this.dataFlowProgress
    }
  }
}

// ============================================
// 3D MESSAGE PARTICLE
// ============================================

export class MessageParticle3D {
  id: string
  path: Array<{ x: number; y: number; z: number }>
  currentIndex: number
  progress: number
  color: number
  speed: number
  completed: boolean
  
  constructor(message: Message, nodes: Node3D[]) {
    this.id = message.id
    this.path = []
    this.currentIndex = 0
    this.progress = 0
    this.completed = false
    
    // Set color based on priority
    switch (message.priority) {
      case 'critical':
        this.color = SCENE_CONFIG.colors.messageCritical
        this.speed = 0.05
        break
      case 'high':
        this.color = SCENE_CONFIG.colors.messageHigh
        this.speed = 0.03
        break
      default:
        this.color = SCENE_CONFIG.colors.messageNormal
        this.speed = 0.02
    }
    
    // Build path from hops
    message.hops.forEach(hopName => {
      const node = nodes.find(n => n.id.includes(hopName) || hopName.includes(n.id.slice(0, 8)))
      if (node) {
        this.path.push({ ...node.position })
      }
    })
  }
  
  update(deltaTime: number): void {
    if (this.completed || this.path.length < 2) return
    
    this.progress += this.speed
    
    if (this.progress >= 1) {
      this.progress = 0
      this.currentIndex++
      
      if (this.currentIndex >= this.path.length - 1) {
        this.completed = true
      }
    }
  }
  
  getPosition(): { x: number; y: number; z: number } | null {
    if (this.completed || this.currentIndex >= this.path.length - 1) return null
    
    const from = this.path[this.currentIndex]
    const to = this.path[this.currentIndex + 1]
    
    return {
      x: from.x + (to.x - from.x) * this.progress,
      y: from.y + (to.y - from.y) * this.progress + Math.sin(this.progress * Math.PI) * 5,
      z: from.z + (to.z - from.z) * this.progress
    }
  }
}

// ============================================
// CANVAS 3D RENDERER (WebGL-like using Canvas)
// ============================================

export class Canvas3DRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private camera: {
    x: number
    y: number
    z: number
    rotationY: number
  }
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.width = canvas.width
    this.height = canvas.height
    this.camera = {
      x: 0,
      y: 50,
      z: 100,
      rotationY: 0
    }
  }
  
  /**
   * Project 3D point to 2D screen
   */
  project(x: number, y: number, z: number): { x: number; y: number; scale: number } {
    // Rotate around Y axis
    const cosR = Math.cos(this.camera.rotationY)
    const sinR = Math.sin(this.camera.rotationY)
    const rx = x * cosR - z * sinR
    const rz = x * sinR + z * cosR
    
    // Perspective projection
    const scale = 300 / (300 + rz - this.camera.z)
    
    return {
      x: this.width / 2 + rx * scale,
      y: this.height / 2 - (y - this.camera.y) * scale,
      scale: Math.max(0.1, scale)
    }
  }
  
  /**
   * Clear and prepare frame
   */
  clear(): void {
    this.ctx.fillStyle = `#${SCENE_CONFIG.colors.background.toString(16).padStart(6, '0')}`
    this.ctx.fillRect(0, 0, this.width, this.height)
    
    // Draw grid
    this.drawGrid()
  }
  
  /**
   * Draw 3D grid
   */
  private drawGrid(): void {
    this.ctx.strokeStyle = `#${SCENE_CONFIG.colors.grid.toString(16).padStart(6, '0')}`
    this.ctx.lineWidth = 0.5
    
    for (let i = -100; i <= 100; i += 20) {
      // Horizontal lines
      const p1 = this.project(-100, 0, i)
      const p2 = this.project(100, 0, i)
      this.ctx.beginPath()
      this.ctx.moveTo(p1.x, p1.y)
      this.ctx.lineTo(p2.x, p2.y)
      this.ctx.stroke()
      
      // Vertical lines
      const p3 = this.project(i, 0, -100)
      const p4 = this.project(i, 0, 100)
      this.ctx.beginPath()
      this.ctx.moveTo(p3.x, p3.y)
      this.ctx.lineTo(p4.x, p4.y)
      this.ctx.stroke()
    }
  }
  
  /**
   * Draw node
   */
  drawNode(node: Node3D, label: string): void {
    const p = this.project(node.position.x, node.position.y, node.position.z)
    const radius = 8 * p.scale * node.scale
    
    // Glow
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3)
    const colorHex = node.color.toString(16).padStart(6, '0')
    gradient.addColorStop(0, `#${colorHex}40`)
    gradient.addColorStop(1, 'transparent')
    
    this.ctx.beginPath()
    this.ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2)
    this.ctx.fillStyle = gradient
    this.ctx.fill()
    
    // Node sphere
    this.ctx.beginPath()
    this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = `#${colorHex}`
    this.ctx.fill()
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 1.5 * p.scale
    this.ctx.stroke()
    
    // Label
    this.ctx.font = `${10 * p.scale}px Inter, sans-serif`
    this.ctx.fillStyle = '#ffffff'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(label, p.x, p.y + radius + 15 * p.scale)
  }
  
  /**
   * Draw connection
   */
  drawConnection(conn: Connection3D): void {
    const p1 = this.project(conn.from.x, conn.from.y, conn.from.z)
    const p2 = this.project(conn.to.x, conn.to.y, conn.to.z)
    
    const color = conn.active 
      ? SCENE_CONFIG.colors.connectionActive 
      : SCENE_CONFIG.colors.connectionInactive
    
    this.ctx.beginPath()
    this.ctx.moveTo(p1.x, p1.y)
    this.ctx.lineTo(p2.x, p2.y)
    this.ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}80`
    this.ctx.lineWidth = conn.active ? 2 : 1
    this.ctx.stroke()
    
    // Data flow particle
    if (conn.active && conn.dataFlowProgress > 0) {
      const flowPos = conn.getDataFlowPosition()
      const fp = this.project(flowPos.x, flowPos.y, flowPos.z)
      
      this.ctx.beginPath()
      this.ctx.arc(fp.x, fp.y, 3 * fp.scale, 0, Math.PI * 2)
      this.ctx.fillStyle = '#00d9ff'
      this.ctx.fill()
    }
  }
  
  /**
   * Draw message particle
   */
  drawMessageParticle(particle: MessageParticle3D): void {
    const pos = particle.getPosition()
    if (!pos) return
    
    const p = this.project(pos.x, pos.y, pos.z)
    const colorHex = particle.color.toString(16).padStart(6, '0')
    
    // Glow
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 15 * p.scale)
    gradient.addColorStop(0, `#${colorHex}`)
    gradient.addColorStop(0.5, `#${colorHex}80`)
    gradient.addColorStop(1, 'transparent')
    
    this.ctx.beginPath()
    this.ctx.arc(p.x, p.y, 15 * p.scale, 0, Math.PI * 2)
    this.ctx.fillStyle = gradient
    this.ctx.fill()
    
    // Core
    this.ctx.beginPath()
    this.ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2)
    this.ctx.fillStyle = `#${colorHex}`
    this.ctx.fill()
  }
  
  /**
   * Rotate camera
   */
  rotateCamera(delta: number): void {
    this.camera.rotationY += delta
  }
  
  /**
   * Set camera position
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.x = x
    this.camera.y = y
    this.camera.z = z
  }
}

// ============================================
// 3D SCENE MANAGER
// ============================================

export class Scene3DManager {
  private renderer: Canvas3DRenderer | null = null
  private nodes3D: Node3D[] = []
  private connections3D: Connection3D[] = []
  private messageParticles: MessageParticle3D[] = []
  private animationId: number | null = null
  private lastTime: number = 0
  private autoRotate: boolean = true
  
  /**
   * Initialize 3D scene
   */
  init(canvas: HTMLCanvasElement): void {
    this.renderer = new Canvas3DRenderer(canvas)
  }
  
  /**
   * Update nodes
   */
  updateNodes(nodes: Node[]): void {
    this.nodes3D = nodes.map(n => new Node3D(n))
    this.updateConnections()
  }
  
  /**
   * Update connections
   */
  private updateConnections(): void {
    this.connections3D = []
    
    this.nodes3D.forEach(node => {
      node.connections.forEach(connId => {
        const targetNode = this.nodes3D.find(n => n.id === connId)
        if (targetNode) {
          // Avoid duplicate connections
          const exists = this.connections3D.some(
            c => (c.from === node.position && c.to === targetNode.position) ||
                 (c.to === node.position && c.from === targetNode.position)
          )
          if (!exists) {
            this.connections3D.push(new Connection3D(node, targetNode, true))
          }
        }
      })
    })
  }
  
  /**
   * Add message particle
   */
  addMessage(message: Message): void {
    const particle = new MessageParticle3D(message, this.nodes3D)
    this.messageParticles.push(particle)
    
    // Remove completed particles
    setTimeout(() => {
      this.messageParticles = this.messageParticles.filter(p => !p.completed)
    }, 10000)
  }
  
  /**
   * Start animation loop
   */
  start(): void {
    this.lastTime = performance.now()
    this.animate()
  }
  
  /**
   * Stop animation
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
  
  /**
   * Animation loop
   */
  private animate = (): void => {
    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime
    
    // Update
    this.nodes3D.forEach(node => node.update(deltaTime))
    this.connections3D.forEach(conn => conn.update(deltaTime))
    this.messageParticles.forEach(particle => particle.update(deltaTime))
    
    if (this.autoRotate && this.renderer) {
      this.renderer.rotateCamera(SCENE_CONFIG.animation.rotationSpeed)
    }
    
    // Render
    this.render()
    
    this.animationId = requestAnimationFrame(this.animate)
  }
  
  /**
   * Render frame
   */
  private render(): void {
    if (!this.renderer) return
    
    this.renderer.clear()
    
    // Draw connections first (behind nodes)
    this.connections3D.forEach(conn => {
      this.renderer!.drawConnection(conn)
    })
    
    // Draw nodes
    this.nodes3D.forEach((node, i) => {
      const label = `Node ${i + 1}`
      this.renderer!.drawNode(node, label)
    })
    
    // Draw message particles
    this.messageParticles.forEach(particle => {
      this.renderer!.drawMessageParticle(particle)
    })
  }
  
  /**
   * Toggle auto rotation
   */
  toggleAutoRotate(): void {
    this.autoRotate = !this.autoRotate
  }
  
  /**
   * Set auto rotate
   */
  setAutoRotate(value: boolean): void {
    this.autoRotate = value
  }
}

export const scene3DManager = new Scene3DManager()
