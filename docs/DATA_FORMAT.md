# Data Format Specification

## Overview

This document describes the JSON schema for mock detection data used by the Argus Automata demo system.

## Root Schema: MockDetectionData

```typescript
interface MockDetectionData {
  camera_id: string;                    // Unique camera identifier
  module: ModuleType;                   // Detection module type
  fps: number;                          // Frames per second
  roi?: Point[];                        // Region of interest polygon
  thresholds?: Record<string, number>;  // Module-specific thresholds
  homography_matrices?: number[][][];   // For vehicle speed (optional)
  frames: FrameData[];                  // Frame-by-frame detections
}

type ModuleType = 'intrusion' | 'throwing' | 'vehicle' | 'collision' | 'ppe';
```

## Point Schema

```typescript
interface Point {
  x: number;  // X coordinate in pixels
  y: number;  // Y coordinate in pixels
}
```

## Frame Schema

```typescript
interface FrameData {
  t: number;              // Timestamp in seconds
  detections: Detection[];
}
```

## Detection Schema

```typescript
interface Detection {
  track_id: number;                           // Unique track identifier
  cls: string;                                // Classification label
  conf: number;                               // Confidence score (0-1)
  bbox: [number, number, number, number];     // [x1, y1, x2, y2]
  
  // Optional fields (module-specific)
  bottom_center?: [number, number];           // For intrusion
  centroid?: [number, number];                // For vehicle/collision
  speed_kmh?: number;                         // For vehicle
  plane_hint?: number;                        // For multi-plane homography
  missing?: string[];                         // For PPE (missing items)
}
```

## Module-Specific Formats

### Intrusion Detection

```json
{
  "camera_id": "cam_entrance_01",
  "module": "intrusion",
  "fps": 25,
  "roi": [
    {"x": 120, "y": 100},
    {"x": 520, "y": 100},
    {"x": 520, "y": 380},
    {"x": 120, "y": 380}
  ],
  "thresholds": {
    "buffer_size": 5,
    "threshold": 3,
    "cooldown_seconds": 30
  },
  "frames": [
    {
      "t": 0.0,
      "detections": [
        {
          "track_id": 1,
          "cls": "person",
          "conf": 0.95,
          "bbox": [100, 200, 150, 350],
          "bottom_center": [125, 350]
        }
      ]
    }
  ]
}
```

**Required Fields:**
- `bottom_center`: Used for point-in-polygon check

**Thresholds:**
- `buffer_size`: Size of persistence buffer
- `threshold`: Minimum positive frames to confirm intrusion
- `cooldown_seconds`: Alert cooldown per track

---

### Throwing Detection

```json
{
  "camera_id": "cam_waste_area_01",
  "module": "throwing",
  "fps": 25,
  "thresholds": {
    "smoothing_window": 3,
    "consecutive_threshold": 10,
    "cooldown_seconds": 60
  },
  "frames": [
    {
      "t": 3.5,
      "detections": [
        {
          "track_id": 1,
          "cls": "throwing",
          "conf": 0.91,
          "bbox": [260, 95, 370, 360]
        }
      ]
    }
  ]
}
```

**Classification Labels:**
- `"normal"`: Person in normal state
- `"throwing"`: Person performing throwing action

**Thresholds:**
- `smoothing_window`: Frames for class smoothing
- `consecutive_threshold`: Consecutive frames for alert
- `cooldown_seconds`: Alert cooldown

---

### Vehicle Overspeed

```json
{
  "camera_id": "cam_road_01",
  "module": "vehicle",
  "fps": 25,
  "thresholds": {
    "speed_threshold_kmh": 30,
    "meters_per_pixel": 0.05,
    "alert_cooldown_seconds": 30
  },
  "homography_matrices": [
    [[0.05, 0, 0], [0, 0.05, 0], [0, 0, 1]]
  ],
  "frames": [
    {
      "t": 2.0,
      "detections": [
        {
          "track_id": 1,
          "cls": "car",
          "conf": 0.95,
          "bbox": [270, 280, 350, 340],
          "centroid": [310, 310],
          "speed_kmh": 45,
          "plane_hint": 0
        }
      ]
    }
  ]
}
```

**Classification Labels:**
- `"car"`, `"truck"`, `"bus"`, `"motorcycle"`, `"forklift"`

**Required Fields:**
- `centroid`: Center point for tracking
- `speed_kmh`: Pre-calculated speed (or calculated from position delta)
- `plane_hint`: Index into homography_matrices array

---

### Collision Risk

```json
{
  "camera_id": "cam_warehouse_01",
  "module": "collision",
  "fps": 25,
  "thresholds": {
    "collision_distance_px": 100,
    "collision_buffer_frames": 5,
    "collision_cooldown_seconds": 30
  },
  "frames": [
    {
      "t": 4.0,
      "detections": [
        {
          "track_id": 1,
          "cls": "person",
          "conf": 0.95,
          "bbox": [218, 200, 268, 370],
          "bottom_center": [243, 370]
        },
        {
          "track_id": 2,
          "cls": "forklift",
          "conf": 0.94,
          "bbox": [225, 250, 325, 350],
          "centroid": [275, 300]
        }
      ]
    }
  ]
}
```

**Required Fields:**
- Person: `bottom_center`
- Vehicle: `centroid`

---

### PPE Compliance

```json
{
  "camera_id": "cam_factory_floor_01",
  "module": "ppe",
  "fps": 25,
  "thresholds": {
    "ppe_persistence_frames": 15,
    "ppe_cooldown_seconds": 60,
    "required_ppe": ["helmet", "vest", "gloves"]
  },
  "frames": [
    {
      "t": 3.0,
      "detections": [
        {
          "track_id": 1,
          "cls": "person",
          "conf": 0.95,
          "bbox": [260, 80, 380, 400],
          "missing": ["helmet", "vest"]
        }
      ]
    }
  ]
}
```

**Required Fields:**
- `missing`: Array of missing PPE item names

**PPE Items:**
- `"helmet"`, `"vest"`, `"gloves"`, `"goggles"`, `"boots"`

---

## Validation Rules

1. **Timestamps**: Must be monotonically increasing
2. **Track IDs**: Must be consistent across frames for the same object
3. **Bounding Boxes**: `x2 > x1` and `y2 > y1`
4. **Confidence**: Must be in range `[0, 1]`
5. **Coordinates**: Must be within video/canvas dimensions

## Example: Complete File

See `/demo_data/intrusion/intrusion_demo.json` for a complete example.

