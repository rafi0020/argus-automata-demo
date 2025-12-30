# Argus Parity Layer

JavaScript/TypeScript implementations of Argus detection algorithms that mirror the Python production code.

## Purpose

This parity layer ensures that the browser-based demo system processes detections using the **exact same logic** as the real Python backend. This provides:

1. **Whitebox Transparency**: Users can inspect the actual algorithms
2. **Testing**: Unit tests validate algorithm correctness
3. **Documentation**: Code serves as executable documentation

## Modules

### geometry.ts
- `isPointInPolygon(point, polygon)` - Ray casting algorithm
- `getDistance(p1, p2)` - Euclidean distance

### buffers.ts
- `PersistenceBuffer` - Circular buffer for frame persistence
- `CooldownTracker` - Time-based cooldown management
- State initializers for each module

### kalman.ts
- `SimpleKalman` - 1D Kalman filter for value smoothing

## Usage

```typescript
import { isPointInPolygon, PersistenceBuffer, SimpleKalman } from './src';

// Check if person is in restricted zone
const inZone = isPointInPolygon(
  { x: 150, y: 200 },
  [{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 300 }, { x: 100, y: 300 }]
);

// Use persistence buffer
const buffer = new PersistenceBuffer(5);
buffer.push(true);
buffer.push(true);
buffer.push(false);
console.log(buffer.count()); // 2

// Smooth speed readings
const kalman = new SimpleKalman(0.1, 1, 30);
console.log(kalman.update(35)); // Smoothed value
```

## Testing

```bash
npm install
npm test
```

## Parity with Python

Each function has a corresponding Python implementation:

| TypeScript | Python |
|------------|--------|
| `isPointInPolygon` | `cv2.pointPolygonTest` or custom |
| `PersistenceBuffer` | `collections.deque` with maxlen |
| `SimpleKalman` | `filterpy.kalman.KalmanFilter` |

## License

MIT

