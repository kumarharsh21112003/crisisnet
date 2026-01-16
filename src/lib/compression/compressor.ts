// ============================================
// CRISISNET - DATA COMPRESSION
// Custom LZ-like Compression Algorithm
// ============================================

import { CompressionResult } from '@/types'

// ============================================
// RUN-LENGTH ENCODING (RLE)
// ============================================

export class RLECompressor {
  /**
   * Compress using RLE
   */
  compress(data: string): string {
    if (!data) return ''
    
    let compressed = ''
    let count = 1
    
    for (let i = 1; i <= data.length; i++) {
      if (i < data.length && data[i] === data[i - 1]) {
        count++
      } else {
        compressed += count > 1 ? `${count}${data[i - 1]}` : data[i - 1]
        count = 1
      }
    }
    
    return compressed
  }
  
  /**
   * Decompress RLE
   */
  decompress(data: string): string {
    let decompressed = ''
    let i = 0
    
    while (i < data.length) {
      let count = ''
      
      while (i < data.length && !isNaN(parseInt(data[i]))) {
        count += data[i]
        i++
      }
      
      if (i < data.length) {
        const repeatCount = count ? parseInt(count) : 1
        decompressed += data[i].repeat(repeatCount)
        i++
      }
    }
    
    return decompressed
  }
}

// ============================================
// LZ77-LIKE COMPRESSION
// ============================================

export class LZ77Compressor {
  private windowSize = 256
  private lookAheadSize = 16
  
  /**
   * Compress using LZ77-like algorithm
   */
  compress(data: string): string {
    if (!data) return ''
    
    const result: number[] = []
    let position = 0
    
    while (position < data.length) {
      let bestLength = 0
      let bestOffset = 0
      
      // Search in sliding window
      const windowStart = Math.max(0, position - this.windowSize)
      
      for (let i = windowStart; i < position; i++) {
        let length = 0
        
        while (
          length < this.lookAheadSize &&
          position + length < data.length &&
          data[i + length] === data[position + length]
        ) {
          length++
        }
        
        if (length > bestLength) {
          bestLength = length
          bestOffset = position - i
        }
      }
      
      if (bestLength >= 3) {
        result.push(256 + bestOffset, bestLength)
        position += bestLength
      } else {
        result.push(data.charCodeAt(position))
        position++
      }
    }
    
    return String.fromCharCode(...result)
  }
  
  /**
   * Decompress LZ77
   */
  decompress(data: string): string {
    let result = ''
    let i = 0
    
    while (i < data.length) {
      const code = data.charCodeAt(i)
      
      if (code >= 256 && i + 1 < data.length) {
        const offset = code - 256
        const length = data.charCodeAt(i + 1)
        const start = result.length - offset
        
        for (let j = 0; j < length; j++) {
          result += result[start + j]
        }
        i += 2
      } else {
        result += data[i]
        i++
      }
    }
    
    return result
  }
}

// ============================================
// DICTIONARY-BASED COMPRESSION
// ============================================

export class DictionaryCompressor {
  private commonWords = new Map<string, string>([
    ['help', '§H'],
    ['emergency', '§E'],
    ['rescue', '§R'],
    ['fire', '§F'],
    ['water', '§W'],
    ['food', '§O'],
    ['medical', '§M'],
    ['injured', '§I'],
    ['trapped', '§T'],
    ['urgent', '§U'],
    ['location', '§L'],
    ['please', '§P'],
    ['need', '§N'],
    ['children', '§C'],
    ['building', '§B'],
    ['ambulance', '§A'],
    ['flooding', '§D'],
    ['earthquake', '§Q'],
  ])
  
  private reverseDict: Map<string, string>
  
  constructor() {
    this.reverseDict = new Map()
    this.commonWords.forEach((value, key) => {
      this.reverseDict.set(value, key)
    })
  }
  
  /**
   * Compress using dictionary
   */
  compress(data: string): string {
    let result = data.toLowerCase()
    
    this.commonWords.forEach((code, word) => {
      const regex = new RegExp(word, 'gi')
      result = result.replace(regex, code)
    })
    
    return result
  }
  
  /**
   * Decompress using dictionary
   */
  decompress(data: string): string {
    let result = data
    
    this.reverseDict.forEach((word, code) => {
      const regex = new RegExp(code.replace('§', '\\§'), 'g')
      result = result.replace(regex, word)
    })
    
    return result
  }
}

// ============================================
// HUFFMAN CODING (SIMPLIFIED)
// ============================================

interface HuffmanNode {
  char?: string
  freq: number
  left?: HuffmanNode
  right?: HuffmanNode
}

export class HuffmanCompressor {
  private codes: Map<string, string> = new Map()
  private reverseTree: HuffmanNode | null = null
  
  /**
   * Build Huffman tree and compress
   */
  compress(data: string): { compressed: string; tree: string } {
    if (!data) return { compressed: '', tree: '' }
    
    // Count frequencies
    const freqMap = new Map<string, number>()
    for (const char of data) {
      freqMap.set(char, (freqMap.get(char) || 0) + 1)
    }
    
    // Build priority queue
    const nodes: HuffmanNode[] = Array.from(freqMap.entries())
      .map(([char, freq]) => ({ char, freq }))
      .sort((a, b) => a.freq - b.freq)
    
    // Build tree
    while (nodes.length > 1) {
      const left = nodes.shift()!
      const right = nodes.shift()!
      
      const parent: HuffmanNode = {
        freq: left.freq + right.freq,
        left,
        right
      }
      
      // Insert in sorted position
      const insertIndex = nodes.findIndex(n => n.freq > parent.freq)
      nodes.splice(insertIndex === -1 ? nodes.length : insertIndex, 0, parent)
    }
    
    const root = nodes[0]
    this.reverseTree = root
    
    // Generate codes
    this.codes.clear()
    this.buildCodes(root, '')
    
    // Compress
    let compressed = ''
    for (const char of data) {
      compressed += this.codes.get(char) || ''
    }
    
    // Convert binary string to bytes
    const bytes = this.binaryToBytes(compressed)
    
    return {
      compressed: bytes,
      tree: JSON.stringify(Array.from(freqMap.entries()))
    }
  }
  
  /**
   * Build Huffman codes recursively
   */
  private buildCodes(node: HuffmanNode, code: string): void {
    if (node.char !== undefined) {
      this.codes.set(node.char, code || '0')
      return
    }
    
    if (node.left) this.buildCodes(node.left, code + '0')
    if (node.right) this.buildCodes(node.right, code + '1')
  }
  
  /**
   * Convert binary string to bytes
   */
  private binaryToBytes(binary: string): string {
    let result = ''
    const padded = binary.padEnd(Math.ceil(binary.length / 8) * 8, '0')
    
    for (let i = 0; i < padded.length; i += 8) {
      result += String.fromCharCode(parseInt(padded.substr(i, 8), 2))
    }
    
    return result
  }
}

// ============================================
// MAIN COMPRESSION ENGINE
// ============================================

export class CompressionEngine {
  private rle = new RLECompressor()
  private lz77 = new LZ77Compressor()
  private dictionary = new DictionaryCompressor()
  private huffman = new HuffmanCompressor()
  
  /**
   * Compress data using best algorithm
   */
  compress(data: string): CompressionResult {
    const original = data
    
    // Try dictionary compression first (best for emergency messages)
    const dictCompressed = this.dictionary.compress(data)
    
    // Then apply LZ77
    const lzCompressed = this.lz77.compress(dictCompressed)
    
    const compressed = lzCompressed
    const ratio = 1 - (compressed.length / original.length)
    
    return {
      original,
      compressed,
      ratio: Math.max(0, ratio),
      algorithm: 'Dictionary + LZ77'
    }
  }
  
  /**
   * Decompress data
   */
  decompress(data: string): string {
    const lzDecompressed = this.lz77.decompress(data)
    return this.dictionary.decompress(lzDecompressed)
  }
  
  /**
   * Get compression ratio
   */
  getCompressionRatio(original: string, compressed: string): number {
    return 1 - (compressed.length / original.length)
  }
  
  /**
   * Estimate compressed size
   */
  estimateCompressedSize(dataLength: number): number {
    // Average compression ratio is about 60%
    return Math.ceil(dataLength * 0.4)
  }
}

export const compressionEngine = new CompressionEngine()
