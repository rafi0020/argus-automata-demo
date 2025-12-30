# Argus Automata Documentation

## Overview

Argus Automata is an intelligent video surveillance platform that detects safety violations and security threats in industrial environments using AI-powered computer vision.

## Documentation Index

| Document | Description |
|----------|-------------|
| [TECHNICAL.md](./TECHNICAL.md) | System architecture, algorithms, and implementation details |
| [DATA_FORMAT.md](./DATA_FORMAT.md) | JSON schema specifications for mock detection data |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | GitHub Pages deployment and configuration guide |
| [VIDEO_PROMPTS.md](./VIDEO_PROMPTS.md) | AI video generation prompts for demo videos |

## Quick Start

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/argus-automata-demo.git
cd argus-automata-demo/web
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

## Detection Modules

### 1. Perimeter Intrusion Detection
Monitors restricted zones and triggers alerts when unauthorized persons enter.

**Key Features:**
- ROI (Region of Interest) polygon definition
- Persistence buffer to avoid false positives
- Track-based state machine (OUTSIDE → ENTERING → INSIDE → EXITING)

### 2. Throwing Detection
Identifies waste disposal violations using pose/action classification.

**Key Features:**
- Class smoothing window to filter noise
- Consecutive frame threshold for confirmed violations
- Per-track cooldown to prevent alert spam

### 3. Vehicle Overspeed Detection
Monitors vehicle speeds using homography-based real-world distance calculation.

**Key Features:**
- Multi-plane homography support
- Kalman filter for speed smoothing
- Configurable speed thresholds

### 4. Collision Risk Detection
Predicts potential human-vehicle collisions based on proximity.

**Key Features:**
- Human-vehicle pair tracking
- Distance-based risk calculation
- Buffer system for confirmed alerts

### 5. PPE Compliance Detection
Verifies workers are wearing required safety equipment.

**Key Features:**
- Per-track violation persistence
- Multiple PPE item detection (helmet, vest, gloves)
- Cooldown system per track

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Video/Canvas│  │  Whitebox   │  │     Timeline        │  │
│  │   Player    │  │   Panel     │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┴─────────────────────┘             │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                   Zustand Store                        │  │
│  │  (activeModule, mockData, videoTime, moduleStates)     │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              Detection Processor Hook                  │  │
│  │  (processes frames → updates state → triggers alerts)  │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                   Parity Layer                         │  │
│  │  (geometry, buffers, kalman, state machines)           │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │              IndexedDB (alerts.db)                     │  │
│  │  + Sender Simulator (marks processed, purges old)      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## View Modes

| Mode | Description | Target Audience |
|------|-------------|-----------------|
| **Explain** | Shows algorithm details, state internals, config | Developers, technical stakeholders |
| **Operator** | Simplified view with alerts and status | Security operators, end users |

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Dexie** - IndexedDB wrapper
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Video overlay & simulation

## License

MIT License - See [LICENSE](../LICENSE)

