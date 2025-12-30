# Demo Data Directory

This directory contains sample videos and ground truth JSON files for each detection module.

## Structure

```
demo_data/
├── intrusion/
│   ├── intrusion_demo.mp4          # Demo video (optional)
│   └── intrusion_demo.json         # Ground truth detections
├── throwing/
│   ├── throwing_demo.mp4
│   └── throwing_demo.json
├── vehicle/
│   ├── vehicle_demo.mp4
│   └── vehicle_demo.json
├── collision/
│   ├── collision_demo.mp4
│   └── collision_demo.json
└── ppe/
    ├── ppe_demo.mp4
    └── ppe_demo.json
```

## Data Format

Each JSON file follows the `MockDetectionData` schema:

```typescript
interface MockDetectionData {
  camera_id: string;
  module: 'intrusion' | 'throwing' | 'vehicle' | 'collision' | 'ppe';
  fps: number;
  roi?: Point[];                    // Region of interest polygon
  thresholds?: Record<string, number>;
  homography_matrices?: number[][][]; // For vehicle speed module
  frames: FrameData[];
}

interface FrameData {
  t: number;                        // Timestamp in seconds
  detections: Detection[];
}

interface Detection {
  track_id: number;
  cls: string;                      // 'person', 'car', 'throwing', etc.
  conf: number;                     // Confidence 0-1
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  bottom_center?: [number, number]; // For intrusion
  centroid?: [number, number];      // For vehicle/collision
  speed_kmh?: number;               // For vehicle
  plane_hint?: number;              // For multi-plane homography
  missing?: string[];               // For PPE (missing items)
}
```

## Video Requirements

- **Format**: MP4 (H.264 codec for browser compatibility)
- **Resolution**: 640x480 recommended
- **Duration**: 10-30 seconds
- **Frame rate**: 25-30 FPS

## Generating Demo Data

If videos are not available, the system automatically uses **Canvas Simulation Mode** with generated animation based on the JSON detection data.

### Option 1: AI Video Generation (Google Veo, Runway, etc.)

Use detailed prompts for each module - see `docs/VIDEO_PROMPTS.md`

### Option 2: Screen Recording

Record actual surveillance footage or simulation software.

### Option 3: Simulation Only

The JSON files alone are sufficient - the system renders animated shapes without video.

