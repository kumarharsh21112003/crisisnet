<div align="center">

# 🌐 CrisisNet

### AI-Powered Emergency Mesh Network

<p align="center">
  <strong>When networks fail, CrisisNet prevails.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0-00D9FF?style=for-the-badge&logo=rocket" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI-NLP_Classifier-7C3AED?style=flat-square" alt="AI">
  <img src="https://img.shields.io/badge/Blockchain-SHA256-EC4899?style=flat-square" alt="Blockchain">
  <img src="https://img.shields.io/badge/PWA-Offline_Ready-10B981?style=flat-square" alt="PWA">
  <img src="https://img.shields.io/badge/Languages-Hindi_+_English-F59E0B?style=flat-square" alt="Languages">
</p>

---

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

</div>

---

## � The Problem

> **During disasters, when you need communication the most, it fails.**

When natural disasters strike (earthquake, flood, fire):

|    Traditional Networks    |       CrisisNet       |
| :------------------------: | :-------------------: |
|    ❌ Cell towers fail     |  ✅ No towers needed  |
|   ❌ Internet goes down    |   ✅ Works offline    |
| ❌ No way to call for help |  ✅ P2P mesh network  |
|   ❌ Rescue teams blind    | ✅ AI-prioritized SOS |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔗 Phase 1: Core Network

- **Mesh Topology** - 12-node circular network
- **Dijkstra Routing** - Optimal path finding
- **Self-Healing** - Auto-reconnect on failures
- **Real-time Visualization** - Canvas-based UI

</td>
<td width="50%">

### 🧠 Phase 2: AI Engine

- **NLP Classifier** - Priority detection
- **Hindi + English** - Bilingual support
- **Sentiment Analysis** - Emotional context
- **Entity Extraction** - Location, numbers

</td>
</tr>
<tr>
<td width="50%">

### � Phase 3: Security

- **Blockchain Ledger** - Tamper-proof logs
- **SHA-256 Hashing** - Cryptographic security
- **Merkle Trees** - Transaction verification
- **Crisis Prediction** - ML-based alerts

</td>
<td width="50%">

### 📱 Phase 4: Mobile Ready

- **PWA Support** - Install on any device
- **Offline Storage** - IndexedDB cache
- **Push Notifications** - Real-time alerts
- **Compression** - 40% smaller messages

</td>
</tr>
</table>

---

## 🎬 Demo

### Network Visualization

```
                        ⬡ Alpha
                    ╱           ╲
              ⬡ Mu                 ⬡ Beta
             ╱                         ╲
        ⬡ Lambda ─────────────────── ⬡ Gamma
             ╲                         ╱
          ⬡ Kappa ─────────────── ⬡ Delta
               ╲                   ╱
            ⬡ Iota ─────────── ⬡ Epsilon
                  ╲             ╱
               ⬡ Theta ─── ⬡ Zeta
                      ╲   ╱
                      ⬡ Eta
```

### Message Classification

| Input                    |  Priority   | Confidence | Language |
| ------------------------ | :---------: | :--------: | :------: |
| `SOS! Building on fire!` | 🔴 CRITICAL |    95%     | English  |
| `Need water and food`    |   🟠 HIGH   |    87%     | English  |
| `मदद! पानी भेजो`         |   🟠 HIGH   |    89%     |  Hindi   |
| `All safe at shelter`    |  🟢 NORMAL  |    82%     | English  |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/crisisnet.git

# Navigate to project
cd crisisnet

# Install dependencies
npm install

# Start development server
npm run dev
```

### Open in Browser

```
🌐 http://localhost:3000
```

---

## 🎮 How to Use

<table>
<tr>
<td>

### Step 1️⃣

**Open Network Tab**

View the 12-node mesh network with real-time status indicators.

- 🟢 Green = Online
- 🔴 Red = Offline
- 📡 Lines = Connections

</td>
<td>

### Step 2️⃣

**Send a Message**

Use Quick Test buttons or type your own:

```
"Help! Fire at Sector 5!"
"मदद चाहिए, पानी नहीं है"
```

</td>
<td>

### Step 3️⃣

**View Analytics**

Check all tabs for:

- AI classification
- Compression stats
- Blockchain ledger
- Crisis predictions

</td>
</tr>
</table>

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MESSAGE FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   📝 User Input                                                     │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────────────────────────────────┐                      │
│   │  🧠 AI CLASSIFIER                        │                      │
│   │  ├─ Keywords: [fire, help, emergency]   │                      │
│   │  ├─ Priority: CRITICAL                  │                      │
│   │  ├─ Language: English/Hindi             │                      │
│   │  └─ Sentiment: Negative/Urgent          │                      │
│   └─────────────────────────────────────────┘                      │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────────────────────────────────┐                      │
│   │  🗜️ COMPRESSION ENGINE                  │                      │
│   │  ├─ Algorithm: LZ77 + Dictionary        │                      │
│   │  ├─ Original: 48 bytes                  │                      │
│   │  └─ Compressed: 29 bytes (40% saved)    │                      │
│   └─────────────────────────────────────────┘                      │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────────────────────────────────┐                      │
│   │  ⛓️ BLOCKCHAIN                           │                      │
│   │  ├─ Hash: SHA-256                       │                      │
│   │  ├─ Merkle Root: Verified               │                      │
│   │  └─ Block: #42 confirmed                │                      │
│   └─────────────────────────────────────────┘                      │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────────────────────────────────┐                      │
│   │  🛤️ DIJKSTRA ROUTING                     │                      │
│   │  ├─ Path: Alpha → Beta → Gamma          │                      │
│   │  ├─ Hops: 3                             │                      │
│   │  └─ Latency: 120ms                      │                      │
│   └─────────────────────────────────────────┘                      │
│       │                                                             │
│       ▼                                                             │
│   ✅ DELIVERED                                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗣️ Multi-Language Support

<table>
<tr>
<td align="center" width="50%">

### 🇬🇧 English

**Critical:**
`sos` `dying` `fire` `trapped` `bleeding` `emergency`

**High:**
`injured` `hurt` `food` `water` `medicine` `children`

**Normal:**
`safe` `okay` `fine` `reached` `rescued`

</td>
<td align="center" width="50%">

### 🇮🇳 हिंदी

**Critical:**
`मदद` `बचाओ` `आग` `मर` `खून` `फंसे`

**High:**
`घायल` `पानी` `खाना` `दवाई` `बच्चे` `बुजुर्ग`

**Normal:**
`सुरक्षित` `ठीक` `पहुंच`

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

<table>
<tr>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="40" height="40"/><br/>
<strong>Next.js 15</strong><br/>
React Framework
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="40" height="40"/><br/>
<strong>TypeScript</strong><br/>
Type Safety
</td>
<td align="center" width="25%">
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" width="40" height="40"/><br/>
<strong>Tailwind CSS</strong><br/>
Styling
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="40" height="40"/><br/>
<strong>Canvas API</strong><br/>
Visualization
</td>
</tr>
</table>

---

## 📁 Project Structure

```
crisisnet/
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 page.tsx          # Main dashboard
│   │   ├── 📄 layout.tsx        # App layout
│   │   └── 📄 globals.css       # Global styles
│   ├── 📂 types/
│   │   └── 📄 index.ts          # Type definitions
│   └── 📂 lib/
│       ├── 📂 ai/
│       │   ├── 📄 classifier.ts # AI classifier
│       │   └── 📄 predictor.ts  # Crisis prediction
│       ├── 📂 mesh/
│       │   └── 📄 network.ts    # Mesh network
│       ├── 📂 routing/
│       │   └── 📄 algorithms.ts # Dijkstra routing
│       ├── 📂 compression/
│       │   └── 📄 compressor.ts # LZ77 compression
│       ├── 📂 crypto/
│       │   └── 📄 blockchain.ts # Blockchain
│       └── 📂 pwa/
│           └── 📄 utils.ts      # PWA utilities
├── 📂 public/
│   ├── 📄 manifest.json         # PWA manifest
│   └── 📄 sw.js                 # Service worker
└── 📄 package.json
```

---

## � Algorithms

<table>
<tr>
<td width="25%">

### 🛤️ Dijkstra

```
Shortest path finding
O(V²) complexity
Optimal routing
```

</td>
<td width="25%">

### 🗜️ LZ77

```
Dictionary compression
Run-length encoding
40% size reduction
```

</td>
<td width="25%">

### 🔐 SHA-256

```
Cryptographic hash
256-bit output
Tamper detection
```

</td>
<td width="25%">

### ⛏️ Proof of Work

```
Nonce finding
Hash verification
Block validation
```

</td>
</tr>
</table>

---

## 🌟 Use Cases

<table>
<tr>
<td align="center">

### 🏚️ Earthquake

Buildings collapsed<br/>
Cell towers down<br/>
**CrisisNet: SOS to rescuers**

</td>
<td align="center">

### 🌊 Flood

Infrastructure damaged<br/>
Internet offline<br/>
**CrisisNet: Coordinate evacuation**

</td>
<td align="center">

### 🔥 Fire

Power grid failure<br/>
Radios unavailable<br/>
**CrisisNet: Real-time updates**

</td>
<td align="center">

### ⛰️ Remote Areas

No cell coverage<br/>
Hikers stranded<br/>
**CrisisNet: Emergency beacon**

</td>
</tr>
</table>

---

## 🔮 Roadmap

- [ ] 📡 WebRTC P2P connections
- [ ] 📶 Bluetooth mesh support
- [ ] 📱 WiFi Direct integration
- [ ] 📍 GPS location sharing
- [ ] 🎤 Voice message support
- [ ] 🖼️ Image compression
- [ ] 📲 React Native mobile app
- [ ] 🔧 Hardware beacon integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

<img src="https://img.shields.io/badge/Developer-Kumar_Harsh-00D9FF?style=for-the-badge&logo=dev.to&logoColor=white" alt="Developer">

### Kumar Harsh

<p>
  <a href="https://www.linkedin.com/in/kumar-harsh-99b4982b1/">
    <img src="https://img.shields.io/badge/LinkedIn-Kumar_Harsh-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://github.com/kumarharsh">
    <img src="https://img.shields.io/badge/GitHub-kumarharsh-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
</p>

_Full Stack Developer | AI Enthusiast | Building for Impact_

</div>

---

<div align="center">

### 💖 Built with love for humanity's safety

<p>
  <img src="https://img.shields.io/badge/Made_with-Next.js-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Powered_by-AI-7C3AED?style=flat-square" alt="AI">
  <img src="https://img.shields.io/badge/For-Humanity-red?style=flat-square&logo=heart" alt="Humanity">
</p>

**⭐ Star this repo if you find it useful!**

<p>
  <sub>Made with ❤️ by <a href="https://www.linkedin.com/in/kumar-harsh-99b4982b1/">Kumar Harsh</a></sub>
</p>

</div>
