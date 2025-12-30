# Argus Automata (KGF) - Whitebox Demo

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind">
</p>

> A fully static, deployable portfolio demo system showcasing AI-powered video analytics with **whitebox transparency** into detection algorithms.

## 🎯 Live Demo

**[View Live Demo](https://YOUR_USERNAME.github.io/argus-automata-demo/)**

## 📋 Overview

This project demonstrates the Unilever Argus Automata system - an intelligent video surveillance platform that detects safety violations and security threats in industrial environments.

### Detection Modules

| Module | Description | Key Logic |
|--------|-------------|-----------|
| 🚷 **Perimeter Intrusion** | Detects persons in restricted zones | ROI polygon, persistence buffer, state machine |
| 🗑️ **Throwing Detection** | Identifies waste disposal violations | Class smoothing, consecutive frame threshold |
| 🚗 **Vehicle Overspeed** | Monitors vehicle speed limits | Kalman filtering, homography calibration |
| ⚠️ **Collision Risk** | Predicts human-vehicle collisions | Pair buffers, proximity detection, cooldowns |
| 🦺 **PPE Compliance** | Verifies safety equipment usage | Per-track violation persistence |

## ✨ Features

- **Dual Mode**: Video playback OR canvas simulation (auto-detects)
- **Whitebox Transparency**: See algorithm logic and internal state in real-time
- **Alert Database**: IndexedDB-backed storage with sender simulation
- **Fully Static**: Runs 100% in browser, deployable to GitHub Pages

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/argus-automata-demo.git
cd argus-automata-demo

# Install dependencies
cd web
npm install

# Start development server
npm run dev

# Open http://localhost:5173/argus-automata-demo/
```

## 📁 Project Structure

```
├── web/                    # React web application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── parity/         # Detection logic
│   │   ├── store/          # State management
│   │   └── types/          # TypeScript definitions
│   └── public/assets/      # Videos, data, config
├── .github/workflows/      # CI/CD deployment
└── README.md
```

## 🎮 Modes

| Mode | When | What You See |
|------|------|--------------|
| **Video Mode** 📹 | Video file exists | Real video + canvas overlay |
| **Simulation Mode** 🎮 | No video file | Animated shapes from JSON data |

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Zustand** - State management
- **Dexie** - IndexedDB wrapper
- **Tailwind CSS** - Styling

## 📄 License

MIT License

---

<p align="center">
  <strong>Argus Automata</strong> • Intelligent Video Analytics with Transparency
</p>

