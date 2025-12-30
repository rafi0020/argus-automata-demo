/**
 * Kalman filter implementations for value smoothing
 * From parity layer - mirrors Python implementations
 */

/**
 * Simple 1D Kalman filter for smoothing noisy measurements.
 * Mirrors filterpy.kalman.KalmanFilter for 1D state estimation.
 */
export class SimpleKalman {
  private q: number; // Process noise covariance
  private r: number; // Measurement noise covariance
  private x: number; // Current state estimate
  private p: number; // Current error covariance

  /**
   * @param q - Process noise (how much we expect the value to change naturally)
   * @param r - Measurement noise (how noisy our measurements are)
   * @param initialValue - Initial state estimate
   */
  constructor(q: number = 0.1, r: number = 1, initialValue: number = 0) {
    this.q = q;
    this.r = r;
    this.x = initialValue;
    this.p = 1;
  }

  /**
   * Update the filter with a new measurement
   * @returns Filtered (smoothed) value
   */
  update(measurement: number): number {
    // Prediction step
    const pPred = this.p + this.q;

    // Update step - Kalman gain
    const k = pPred / (pPred + this.r);

    // Updated state
    this.x = this.x + k * (measurement - this.x);

    // Updated error covariance
    this.p = (1 - k) * pPred;

    return this.x;
  }

  getValue(): number {
    return this.x;
  }

  getCovariance(): number {
    return this.p;
  }

  reset(initialValue: number = 0): void {
    this.x = initialValue;
    this.p = 1;
  }

  setProcessNoise(q: number): void {
    this.q = q;
  }

  setMeasurementNoise(r: number): void {
    this.r = r;
  }
}

/**
 * 2D Kalman filter for position tracking with velocity estimation.
 * State vector: [x, y, vx, vy]
 */
export class PositionKalman {
  private x: number[]; // State vector [x, y, vx, vy]
  private p: number[][]; // Error covariance matrix
  private q: number;
  private r: number;
  private dt: number;

  constructor(
    initialX: number = 0,
    initialY: number = 0,
    q: number = 0.1,
    r: number = 1,
    dt: number = 0.04 // ~25 FPS
  ) {
    this.x = [initialX, initialY, 0, 0];
    this.q = q;
    this.r = r;
    this.dt = dt;
    this.p = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }

  predict(): void {
    this.x[0] += this.x[2] * this.dt;
    this.x[1] += this.x[3] * this.dt;
    for (let i = 0; i < 4; i++) {
      this.p[i][i] += this.q;
    }
  }

  update(measuredX: number, measuredY: number): void {
    const kx = this.p[0][0] / (this.p[0][0] + this.r);
    const ky = this.p[1][1] / (this.p[1][1] + this.r);

    const dx = measuredX - this.x[0];
    const dy = measuredY - this.x[1];

    this.x[0] += kx * dx;
    this.x[1] += ky * dy;
    this.x[2] = this.x[2] * 0.9 + dx / this.dt * 0.1;
    this.x[3] = this.x[3] * 0.9 + dy / this.dt * 0.1;

    this.p[0][0] = (1 - kx) * this.p[0][0];
    this.p[1][1] = (1 - ky) * this.p[1][1];
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x[0], y: this.x[1] };
  }

  getVelocity(): { vx: number; vy: number } {
    return { vx: this.x[2], vy: this.x[3] };
  }

  getSpeed(): number {
    return Math.sqrt(this.x[2] * this.x[2] + this.x[3] * this.x[3]);
  }

  /**
   * Get speed in km/h using meters per pixel conversion
   */
  getSpeedKmh(metersPerPixel: number = 0.05): number {
    const pixelsPerSecond = this.getSpeed();
    const metersPerSecond = pixelsPerSecond * metersPerPixel;
    return metersPerSecond * 3.6; // Convert m/s to km/h
  }

  reset(x: number = 0, y: number = 0): void {
    this.x = [x, y, 0, 0];
    this.p = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }
}

/**
 * Exponential Moving Average filter (simpler alternative to Kalman)
 */
export class EMAFilter {
  private value: number;
  private alpha: number;
  private initialized: boolean = false;

  constructor(alpha: number = 0.3) {
    this.alpha = alpha;
    this.value = 0;
  }

  update(newValue: number): number {
    if (!this.initialized) {
      this.value = newValue;
      this.initialized = true;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  getValue(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
    this.initialized = false;
  }
}
