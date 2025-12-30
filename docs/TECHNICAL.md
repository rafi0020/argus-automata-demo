# Technical Documentation

## Architecture Overview

The Argus Automata demo is a fully client-side application that simulates an AI video analytics pipeline. It runs entirely in the browser with no backend requirements.

## Core Components

### 1. State Management (Zustand)

The application uses Zustand for centralized state management:

```typescript
// Key state slices
interface AppState {
  activeModule: ModuleType;      // Current detection module
  viewMode: ViewMode;            // 'explain' | 'operator'
  mockData: MockDetectionData;   // Loaded JSON detection data
  videoTime: number;             // Current playback time
  isPlaying: boolean;            // Playback state
  currentFrame: FrameData;       // Current frame detections
  
  // Per-module state
  intrusionState: IntrusionState;
  throwingState: ThrowingState;
  vehicleState: VehicleState;
  collisionState: CollisionState;
  ppeState: PPEState;
}
```

### 2. Parity Layer

The parity layer contains JavaScript implementations of the detection algorithms that mirror the real Python implementations:

#### Geometry Functions (`geometry.ts`)

```typescript
// Point-in-polygon test using ray casting
function isPointInPolygon(point: Point, polygon: Point[]): boolean

// Euclidean distance between two points
function getDistance(p1: Point, p2: Point): number
```

#### Buffer System (`buffers.ts`)

```typescript
// Circular buffer for persistence checking
class PersistenceBuffer {
  push(value: boolean): void
  count(): number
  isFull(): boolean
}

// Cooldown tracker
class CooldownTracker {
  isOnCooldown(key: string, currentTime: number): boolean
  setCooldown(key: string, currentTime: number, duration: number): void
}
```

#### Kalman Filter (`kalman.ts`)

```typescript
// 1D Kalman filter for speed smoothing
class SimpleKalman {
  constructor(q: number, r: number, initialValue: number)
  update(measurement: number): number
  getValue(): number
}
```

### 3. Detection Processing

The `useDetectionProcessor` hook processes each frame:

```typescript
function useDetectionProcessor() {
  // Called on every frame during playback
  const processFrame = (frame: FrameData, time: number) => {
    switch (activeModule) {
      case 'intrusion':
        processIntrusion(frame, time);
        break;
      case 'throwing':
        processThrowing(frame, time);
        break;
      // ... other modules
    }
  };
}
```

## Detection Algorithms

### Perimeter Intrusion

**State Machine:**
```
OUTSIDE ──[enters ROI]──> ENTERING ──[buffer threshold]──> INSIDE
   ↑                                                          │
   └──────────────────[exits ROI]─────────────────────────────┘
```

**Logic:**
1. Get person's bottom_center point
2. Check if point is inside ROI polygon (ray casting)
3. Push result to persistence buffer
4. If buffer count >= threshold → transition to INSIDE state
5. Trigger alert on OUTSIDE→INSIDE transition

### Throwing Detection

**Logic:**
1. Apply class smoothing (majority vote over N frames)
2. Count consecutive "throwing" classifications
3. If consecutive count >= threshold → trigger alert
4. Apply per-track cooldown

### Vehicle Overspeed

**Logic:**
1. Track vehicle positions over time
2. Apply homography transform to get real-world coordinates
3. Calculate speed: `distance / time * meters_per_pixel * 3.6`
4. Apply Kalman filter for smoothing
5. Compare against speed threshold

### Collision Risk

**Logic:**
1. Find all human-vehicle pairs
2. Calculate distance between each pair
3. If distance < threshold → push to pair buffer
4. If buffer count >= threshold → trigger alert
5. Apply pair-based cooldown

### PPE Compliance

**Logic:**
1. For each person detection, check `missing` array
2. If any items missing → increment violation counter
3. If violation counter >= persistence threshold → trigger alert
4. Apply per-track cooldown

## Alert Database

Alerts are stored in IndexedDB using Dexie:

```typescript
interface Alert {
  id?: number;
  camera_id: string;
  module: ModuleType;
  timestamp: number;
  track_id: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, unknown>;
  processed: boolean;
  created_at: Date;
}
```

### Sender Simulator

Simulates the alert API sender:
- Runs every N seconds
- Marks alerts as `processed: true`
- Purges alerts older than M seconds

## Video/Canvas Modes

### Video Mode
- Uses HTML5 `<video>` element
- Canvas overlay for bounding boxes and ROI
- `requestAnimationFrame` sync with video time

### Simulation Mode
- Pure canvas rendering
- Animated shapes based on JSON detection coordinates
- `requestAnimationFrame` driven animation loop

## Performance Considerations

1. **Frame Throttling**: Detection processing is throttled to 100ms intervals
2. **Canvas Optimization**: Only redraws when frame changes
3. **State Batching**: Zustand batches state updates
4. **Lazy Loading**: Module data loaded on demand

## File Structure

```
web/src/
├── components/          # React components
│   ├── CanvasSimulator.tsx
│   ├── VideoPlayer.tsx
│   ├── VideoOverlay.tsx
│   ├── WhiteboxPanel.tsx
│   ├── Header.tsx
│   ├── Timeline.tsx
│   └── tabs/
│       ├── AlgorithmTab.tsx
│       ├── StateTab.tsx
│       ├── ConfigTab.tsx
│       └── AlertsTab.tsx
├── hooks/               # Custom React hooks
│   ├── useDetectionProcessor.ts
│   └── useSenderSimulator.ts
├── parity/              # Detection algorithms
│   ├── geometry.ts
│   ├── buffers.ts
│   ├── kalman.ts
│   └── index.ts
├── store/               # State management
│   ├── appStore.ts
│   └── alertStore.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── App.tsx              # Main application
├── main.tsx             # Entry point
└── index.css            # Styles
```

