/**
 * Buffer and state management utilities for detection algorithms
 * From parity layer - mirrors Python implementations
 */

import type {
  IntrusionState, ThrowingState,
  CollisionState, PPEState,
} from '../types';

/**
 * Circular buffer for persistence checking.
 * Mirrors Python's collections.deque with maxlen.
 */
export class PersistenceBuffer {
  private buffer: boolean[];
  private maxSize: number;
  private index: number = 0;
  private filled: boolean = false;

  constructor(size: number) {
    this.maxSize = size;
    this.buffer = new Array(size).fill(false);
  }

  push(value: boolean): void {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.maxSize;
    if (this.index === 0) this.filled = true;
  }

  count(): number {
    const length = this.filled ? this.maxSize : this.index;
    let count = 0;
    for (let i = 0; i < length; i++) {
      if (this.buffer[i]) count++;
    }
    return count;
  }

  isFull(): boolean {
    return this.filled;
  }

  getBuffer(): boolean[] {
    if (this.filled) {
      return [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)];
    }
    return this.buffer.slice(0, this.index);
  }

  reset(): void {
    this.buffer.fill(false);
    this.index = 0;
    this.filled = false;
  }

  size(): number {
    return this.filled ? this.maxSize : this.index;
  }
}

/**
 * Cooldown tracker for preventing alert spam.
 */
export class CooldownTracker {
  private cooldowns: Map<string, number> = new Map();

  isOnCooldown(key: string, currentTime: number): boolean {
    const expiry = this.cooldowns.get(key);
    if (expiry === undefined) return false;
    return currentTime < expiry;
  }

  setCooldown(key: string, currentTime: number, duration: number): void {
    this.cooldowns.set(key, currentTime + duration);
  }

  clearExpired(currentTime: number): void {
    for (const [key, expiry] of this.cooldowns) {
      if (currentTime >= expiry) {
        this.cooldowns.delete(key);
      }
    }
  }

  getRemainingTime(key: string, currentTime: number): number {
    const expiry = this.cooldowns.get(key);
    if (expiry === undefined) return 0;
    return Math.max(0, expiry - currentTime);
  }

  reset(): void {
    this.cooldowns.clear();
  }
}

/**
 * Class smoothing buffer for filtering noisy classifications.
 */
export class ClassSmoothingBuffer {
  private buffer: string[];
  private maxSize: number;
  private index: number = 0;
  private filled: boolean = false;

  constructor(size: number) {
    this.maxSize = size;
    this.buffer = new Array(size).fill('');
  }

  push(cls: string): void {
    this.buffer[this.index] = cls;
    this.index = (this.index + 1) % this.maxSize;
    if (this.index === 0) this.filled = true;
  }

  getMajorityClass(): string {
    const counts = new Map<string, number>();
    const length = this.filled ? this.maxSize : this.index;

    for (let i = 0; i < length; i++) {
      const cls = this.buffer[i];
      if (cls) {
        counts.set(cls, (counts.get(cls) || 0) + 1);
      }
    }

    let maxCount = 0;
    let majorityClass = '';
    for (const [cls, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        majorityClass = cls;
      }
    }

    return majorityClass;
  }

  reset(): void {
    this.buffer.fill('');
    this.index = 0;
    this.filled = false;
  }
}

// State initializers
export function initIntrusionState(bufferSize = 5, threshold = 3): IntrusionState {
  return { 
    buffer: [], 
    currentState: 0, 
    lastStateChangeTime: null, 
    bufferSize, 
    threshold,
  };
}

export function updateIntrusionBuffer(
  state: IntrusionState, isInROI: boolean, timestamp: number
): { state: IntrusionState; emitAlert: boolean; alertType: 'start' | 'end' | null } {
  const newBuffer = [...state.buffer, isInROI];
  while (newBuffer.length > state.bufferSize) newBuffer.shift();
  
  const trueCount = newBuffer.filter(Boolean).length;
  let newState = state.currentState;
  let emitAlert = false;
  let alertType: 'start' | 'end' | null = null;
  
  if (state.currentState === 0 && trueCount >= state.threshold) {
    newState = 1; emitAlert = true; alertType = 'start';
  } else if (state.currentState === 1 && trueCount < state.threshold) {
    newState = 0; emitAlert = true; alertType = 'end';
  }
  
  return {
    state: { 
      ...state, 
      buffer: newBuffer, 
      currentState: newState, 
      lastStateChangeTime: emitAlert ? timestamp : state.lastStateChangeTime 
    },
    emitAlert, 
    alertType,
  };
}

// Throwing
export function initThrowingState(consecutiveThreshold = 10, smoothingWindow = 3): ThrowingState {
  return { tracks: new Map(), consecutiveThreshold, smoothingWindow };
}

export function updateThrowingState(
  state: ThrowingState, trackId: number, detectedClass: 0 | 1
): { state: ThrowingState; triggerAlert: boolean } {
  let trackState = state.tracks.get(trackId) || { classHistory: [], smoothedClass: 0, consecutiveCount: 0 };
  
  trackState.classHistory.push(detectedClass);
  if (trackState.classHistory.length > state.smoothingWindow) trackState.classHistory.shift();
  
  const mean = trackState.classHistory.reduce((a, b) => a + b, 0) / trackState.classHistory.length;
  trackState.smoothedClass = Math.round(mean);
  trackState.consecutiveCount = trackState.smoothedClass === 1 ? trackState.consecutiveCount + 1 : 0;
  
  const triggerAlert = trackState.consecutiveCount === state.consecutiveThreshold;
  const newTracks = new Map(state.tracks);
  newTracks.set(trackId, trackState);
  
  return { state: { ...state, tracks: newTracks }, triggerAlert };
}

// Collision
export function initCollisionState(bufferSize = 5, cooldownSeconds = 30, distanceThreshold = 100): CollisionState {
  return { pairs: new Map(), bufferSize, cooldownSeconds, distanceThreshold };
}

export function updateCollisionPair(
  state: CollisionState, humanId: number, vehicleId: number, isClose: boolean, timestamp: number
): { state: CollisionState; triggerAlert: boolean } {
  const key = `${humanId}-${vehicleId}`;
  let pairState = state.pairs.get(key) || { buffer: [], cooldownUntil: null };
  
  if (pairState.cooldownUntil && timestamp < pairState.cooldownUntil) {
    return { state, triggerAlert: false };
  }
  
  pairState.buffer.push(isClose);
  if (pairState.buffer.length > state.bufferSize) pairState.buffer.shift();
  
  const triggerAlert = pairState.buffer.length >= state.bufferSize && pairState.buffer.every(Boolean);
  if (triggerAlert) {
    pairState.cooldownUntil = timestamp + state.cooldownSeconds;
    pairState.buffer = [];
  }
  
  const newPairs = new Map(state.pairs);
  newPairs.set(key, pairState);
  return { state: { ...state, pairs: newPairs }, triggerAlert };
}

// PPE
export function initPPEState(persistenceThreshold = 15, cooldownSeconds = 60): PPEState {
  return { tracks: new Map(), persistenceThreshold, cooldownSeconds };
}

export function updatePPETrack(
  state: PPEState, trackId: number, violations: string[], timestamp: number
): { state: PPEState; triggerAlert: boolean; violations: string[] } {
  let trackState = state.tracks.get(trackId) || { violationFrames: 0, cooldownUntil: null, lastViolations: [] };
  
  if (trackState.cooldownUntil && timestamp < trackState.cooldownUntil) {
    return { state, triggerAlert: false, violations: [] };
  }
  
  if (violations.length > 0) {
    trackState.violationFrames++;
    trackState.lastViolations = violations;
  } else {
    trackState.violationFrames = 0;
    trackState.lastViolations = [];
  }
  
  const triggerAlert = trackState.violationFrames === state.persistenceThreshold;
  if (triggerAlert) {
    trackState.cooldownUntil = timestamp + state.cooldownSeconds;
    trackState.violationFrames = 0;
  }
  
  const newTracks = new Map(state.tracks);
  newTracks.set(trackId, trackState);
  return { state: { ...state, tracks: newTracks }, triggerAlert, violations: trackState.lastViolations };
}
