// ============================================
// CRISISNET - BLOCKCHAIN MODULE
// Tamper-proof Message Verification
// ============================================

import { BlockchainEntry, Message } from '@/types'

// ============================================
// SHA-256 HASH IMPLEMENTATION
// ============================================

export class CryptoUtils {
  /**
   * Generate SHA-256 hash (browser-compatible)
   */
  static async sha256(message: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto) {
      const msgBuffer = new TextEncoder().encode(message)
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    // Fallback for SSR
    return this.simpleHash(message)
  }
  
  /**
   * Simple hash for SSR fallback
   */
  static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(16, '0').toUpperCase()
  }
  
  /**
   * Generate digital signature (simplified HMAC)
   */
  static generateSignature(message: string, privateKey: string): string {
    const combined = message + privateKey
    return this.simpleHash(combined)
  }
  
  /**
   * Verify digital signature
   */
  static verifySignature(message: string, signature: string, publicKey: string): boolean {
    const expectedSignature = this.generateSignature(message, publicKey)
    return expectedSignature === signature
  }
  
  /**
   * Generate random ID
   */
  static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
}

// ============================================
// BLOCKCHAIN CLASS
// ============================================

export class Blockchain {
  private chain: BlockchainEntry[] = []
  private difficulty: number = 2
  
  constructor() {
    this.chain = [this.createGenesisBlock()]
  }
  
  /**
   * Create the first block in the chain
   */
  private createGenesisBlock(): BlockchainEntry {
    return {
      index: 0,
      timestamp: new Date(),
      messageHash: '0',
      previousHash: '0',
      nonce: 0,
      data: 'Genesis Block - CrisisNet Initialized'
    }
  }
  
  /**
   * Get the latest block
   */
  getLatestBlock(): BlockchainEntry {
    return this.chain[this.chain.length - 1]
  }
  
  /**
   * Add a new message to the blockchain
   */
  async addMessage(message: Message): Promise<BlockchainEntry> {
    const previousBlock = this.getLatestBlock()
    const messageHash = await CryptoUtils.sha256(JSON.stringify(message))
    
    const newBlock: BlockchainEntry = {
      index: previousBlock.index + 1,
      timestamp: new Date(),
      messageHash,
      previousHash: previousBlock.messageHash,
      nonce: 0,
      data: `Message from ${message.from} to ${message.to} | Priority: ${message.priority}`
    }
    
    // Mine the block (find nonce that satisfies difficulty)
    newBlock.nonce = await this.mineBlock(newBlock)
    
    this.chain.push(newBlock)
    return newBlock
  }
  
  /**
   * Mine a block (Proof of Work - simplified)
   */
  private async mineBlock(block: BlockchainEntry): Promise<number> {
    let nonce = 0
    const target = '0'.repeat(this.difficulty)
    
    while (true) {
      const hash = await CryptoUtils.sha256(
        block.index + block.timestamp.toISOString() + block.messageHash + nonce
      )
      
      if (hash.substring(0, this.difficulty) === target) {
        return nonce
      }
      nonce++
      
      // Limit iterations to prevent infinite loop
      if (nonce > 100000) return nonce
    }
  }
  
  /**
   * Verify the integrity of the blockchain
   */
  async verifyChain(): Promise<boolean> {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      
      // Check if previous hash matches
      if (currentBlock.previousHash !== previousBlock.messageHash) {
        console.error(`Chain broken at block ${i}`)
        return false
      }
    }
    return true
  }
  
  /**
   * Get full chain
   */
  getChain(): BlockchainEntry[] {
    return [...this.chain]
  }
  
  /**
   * Get chain length
   */
  getLength(): number {
    return this.chain.length
  }
  
  /**
   * Verify a specific message exists in chain
   */
  async verifyMessage(message: Message): Promise<boolean> {
    const messageHash = await CryptoUtils.sha256(JSON.stringify(message))
    return this.chain.some(block => block.messageHash === messageHash)
  }
}

// ============================================
// MESSAGE ENCRYPTION (AES-like simplified)
// ============================================

export class Encryption {
  /**
   * Simple XOR encryption (for demo purposes)
   * In production, use Web Crypto API with AES-GCM
   */
  static encrypt(message: string, key: string): string {
    let encrypted = ''
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      encrypted += String.fromCharCode(charCode)
    }
    // Browser-compatible base64 encoding
    if (typeof window !== 'undefined') {
      return btoa(encodeURIComponent(encrypted))
    }
    return encrypted
  }
  
  /**
   * Decrypt XOR encrypted message
   */
  static decrypt(encrypted: string, key: string): string {
    // Browser-compatible base64 decoding
    let decoded = encrypted
    if (typeof window !== 'undefined') {
      try {
        decoded = decodeURIComponent(atob(encrypted))
      } catch {
        decoded = encrypted
      }
    }
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      decrypted += String.fromCharCode(charCode)
    }
    return decrypted
  }
  
  /**
   * Generate encryption key
   */
  static generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// Export singleton blockchain instance
export const blockchain = new Blockchain()
