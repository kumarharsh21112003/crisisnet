// ============================================
// CRISISNET - MAIN LIBRARY EXPORTS
// All modules exported from single entry point
// ============================================

// AI/ML Modules
export { AIMessageClassifier, aiClassifier } from './ai/classifier'
export { CrisisPredictor, crisisPredictor } from './ai/predictor'

// Blockchain & Crypto
export { Blockchain, blockchain, CryptoUtils, Encryption } from './crypto/blockchain'

// Mesh Network
export { MeshNetwork, meshNetwork } from './mesh/network'

// Routing Algorithms
export { DijkstraRouter, AntColonyRouter, Router, router } from './routing/algorithms'

// Compression
export { 
  RLECompressor, 
  LZ77Compressor, 
  DictionaryCompressor, 
  HuffmanCompressor,
  CompressionEngine, 
  compressionEngine 
} from './compression/compressor'

// Visualization
export { 
  SCENE_CONFIG,
  Node3D,
  Connection3D,
  MessageParticle3D,
  Canvas3DRenderer,
  Scene3DManager,
  scene3DManager 
} from './visualization/scene3d'

// Simulation
export { 
  SIMULATION_CONFIG,
  NetworkSimulator,
  simulator,
  generateRealisticNode,
  generateRandomMessage,
  generateCrisisEvent
} from './simulation/simulator'
