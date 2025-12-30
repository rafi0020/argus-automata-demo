/**
 * Buffer and state management utilities for detection algorithms
 */

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

  /**
   * Push a value into the buffer
   */
  push(value: boolean): void {
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.maxSize;
    if (this.index === 0) this.filled = true;
  }

  /**
   * Count true values in the buffer
   */
  count(): number {
    const length = this.filled ? this.maxSize : this.index;
    let count = 0;
    for (let i = 0; i < length; i++) {
      if (this.buffer[i]) count++;
    }
    return count;
  }

  /**
   * Check if buffer is full
   */
  isFull(): boolean {
    return this.filled;
  }

  /**
   * Get current buffer contents
   */
  getBuffer(): boolean[] {
    if (this.filled) {
      return [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)];
    }
    return this.buffer.slice(0, this.index);
  }

  /**
   * Reset the buffer
   */
  reset(): void {
    this.buffer.fill(false);
    this.index = 0;
    this.filled = false;
  }

  /**
   * Get the size of the buffer
   */
  size(): number {
    return this.filled ? this.maxSize : this.index;
  }
}

/**
 * Cooldown tracker for preventing alert spam.
 */
export class CooldownTracker {
  private cooldowns: Map<string, number> = new Map();

  /**
   * Check if a key is on cooldown
   */
  isOnCooldown(key: string, currentTime: number): boolean {
    const expiry = this.cooldowns.get(key);
    if (expiry === undefined) return false;
    return currentTime < expiry;
  }

  /**
   * Set cooldown for a key
   */
  setCooldown(key: string, currentTime: number, duration: number): void {
    this.cooldowns.set(key, currentTime + duration);
  }

  /**
   * Clear expired cooldowns
   */
  clearExpired(currentTime: number): void {
    for (const [key, expiry] of this.cooldowns) {
      if (currentTime >= expiry) {
        this.cooldowns.delete(key);
      }
    }
  }

  /**
   * Get remaining cooldown time
   */
  getRemainingTime(key: string, currentTime: number): number {
    const expiry = this.cooldowns.get(key);
    if (expiry === undefined) return 0;
    return Math.max(0, expiry - currentTime);
  }

  /**
   * Reset all cooldowns
   */
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

  /**
   * Push a classification into the buffer
   */
  push(cls: string): void {
    this.buffer[this.index] = cls;
    this.index = (this.index + 1) % this.maxSize;
    if (this.index === 0) this.filled = true;
  }

  /**
   * Get the majority class (mode)
   */
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

  /**
   * Reset the buffer
   */
  reset(): void {
    this.buffer.fill('');
    this.index = 0;
    this.filled = false;
  }
}

// State interfaces
export interface IntrusionTrackState {
  buffer: PersistenceBuffer;
  state: 'outside' | 'entering' | 'inside' | 'exiting';
  lastAlertTime: number;
}

export interface ThrowingTrackState {
  smoothingBuffer: ClassSmoothingBuffer;
  consecutiveCount: number;
  lastAlertTime: number;
}

export interface VehicleTrackState {
  positions: Array<{ x: number; y: number; t: number }>;
  kalmanSpeed: number;
  lastAlertTime: number;
}

export interface CollisionPairState {
  buffer: PersistenceBuffer;
  lastAlertTime: number;
}

export interface PPETrackState {
  violationCount: number;
  lastMissing: string[];
  lastAlertTime: number;
}

// State initializers
export function createIntrusionTrackState(bufferSize: number = 5): IntrusionTrackState {
  return {
    buffer: new PersistenceBuffer(bufferSize),
    state: 'outside',
    lastAlertTime: -Infinity,
  };
}

export function createThrowingTrackState(smoothingWindow: number = 3): ThrowingTrackState {
  return {
    smoothingBuffer: new ClassSmoothingBuffer(smoothingWindow),
    consecutiveCount: 0,
    lastAlertTime: -Infinity,
  };
}

export function createVehicleTrackState(): VehicleTrackState {
  return {
    positions: [],
    kalmanSpeed: 0,
    lastAlertTime: -Infinity,
  };
}

export function createCollisionPairState(bufferSize: number = 5): CollisionPairState {
  return {
    buffer: new PersistenceBuffer(bufferSize),
    lastAlertTime: -Infinity,
  };
}

export function createPPETrackState(): PPETrackState {
  return {
    violationCount: 0,
    lastMissing: [],
    lastAlertTime: -Infinity,
  };
}

