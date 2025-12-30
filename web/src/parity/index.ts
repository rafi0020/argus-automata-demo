/**
 * Parity Layer - Detection Algorithms
 * Mirrors Python production implementations for whitebox transparency
 */

// Geometry
export {
  isPointInPolygon,
  pointInPolygon,
  getDistance,
  distance,
  getBboxCenter,
  getCentroid,
  getBboxBottomCenter,
  getBottomCenter,
  bboxesOverlap,
  calculateIoU,
} from './geometry';
export type { Point } from './geometry';

// Buffers and State
export {
  PersistenceBuffer,
  CooldownTracker,
  ClassSmoothingBuffer,
  initIntrusionState,
  updateIntrusionBuffer,
  initThrowingState,
  updateThrowingState,
  initCollisionState,
  updateCollisionPair,
  initPPEState,
  updatePPETrack,
} from './buffers';

// Kalman Filters
export {
  SimpleKalman,
  PositionKalman,
  EMAFilter,
} from './kalman';
