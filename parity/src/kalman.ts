/**
 * Kalman filter implementations for value smoothing
 */

/**
 * Simple 1D Kalman filter for smoothing noisy measurements.
 * 
 * This is a simplified implementation that mirrors the core behavior
 * of filterpy.kalman.KalmanFilter for 1D state estimation.
 */
export class SimpleKalman {
  private q: number; // Process noise covariance
  private r: number; // Measurement noise covariance
  private x: number; // Current state estimate
  private p: number; // Current error covariance

  /**
   * Create a new Kalman filter
   * 
   * @param q - Process noise (how much we expect the value to change naturally)
   * @param r - Measurement noise (how noisy our measurements are)
   * @param initialValue - Initial state estimate
   */
  constructor(q: number = 0.1, r: number = 1, initialValue: number = 0) {
    this.q = q;
    this.r = r;
    this.x = initialValue;
    this.p = 1; // Initial error covariance
  }

  /**
   * Update the filter with a new measurement
   * 
   * @param measurement - New observed value
   * @returns Filtered (smoothed) value
   */
  update(measurement: number): number {
    // Prediction step
    // x_pred = x (state doesn't change in simple model)
    // p_pred = p + q
    const pPred = this.p + this.q;

    // Update step
    // Kalman gain: k = p_pred / (p_pred + r)
    const k = pPred / (pPred + this.r);

    // Updated state: x = x + k * (measurement - x)
    this.x = this.x + k * (measurement - this.x);

    // Updated error covariance: p = (1 - k) * p_pred
    this.p = (1 - k) * pPred;

    return this.x;
  }

  /**
   * Get current state estimate without updating
   */
  getValue(): number {
    return this.x;
  }

  /**
   * Get current error covariance
   */
  getCovariance(): number {
    return this.p;
  }

  /**
   * Reset the filter to initial state
   */
  reset(initialValue: number = 0): void {
    this.x = initialValue;
    this.p = 1;
  }

  /**
   * Set process noise
   */
  setProcessNoise(q: number): void {
    this.q = q;
  }

  /**
   * Set measurement noise
   */
  setMeasurementNoise(r: number): void {
    this.r = r;
  }
}

/**
 * 2D Kalman filter for position tracking with velocity estimation.
 * 
 * State vector: [x, y, vx, vy]
 * This is useful for smoothing object trajectories and estimating velocity.
 */
export class PositionKalman {
  private x: number[]; // State vector [x, y, vx, vy]
  private p: number[][]; // Error covariance matrix
  private q: number; // Process noise
  private r: number; // Measurement noise
  private dt: number; // Time step

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
    
    // Initialize covariance matrix
    this.p = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }

  /**
   * Predict step - project state forward
   */
  predict(): void {
    // State transition: x' = x + vx*dt, y' = y + vy*dt
    this.x[0] += this.x[2] * this.dt;
    this.x[1] += this.x[3] * this.dt;

    // Add process noise to covariance
    for (let i = 0; i < 4; i++) {
      this.p[i][i] += this.q;
    }
  }

  /**
   * Update step with new position measurement
   */
  update(measuredX: number, measuredY: number): void {
    // Kalman gain (simplified)
    const kx = this.p[0][0] / (this.p[0][0] + this.r);
    const ky = this.p[1][1] / (this.p[1][1] + this.r);

    // Innovation (measurement residual)
    const dx = measuredX - this.x[0];
    const dy = measuredY - this.x[1];

    // Update position
    this.x[0] += kx * dx;
    this.x[1] += ky * dy;

    // Update velocity estimate based on position change
    this.x[2] = this.x[2] * 0.9 + dx / this.dt * 0.1;
    this.x[3] = this.x[3] * 0.9 + dy / this.dt * 0.1;

    // Update covariance
    this.p[0][0] = (1 - kx) * this.p[0][0];
    this.p[1][1] = (1 - ky) * this.p[1][1];
  }

  /**
   * Get current position estimate
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x[0], y: this.x[1] };
  }

  /**
   * Get current velocity estimate
   */
  getVelocity(): { vx: number; vy: number } {
    return { vx: this.x[2], vy: this.x[3] };
  }

  /**
   * Get speed (magnitude of velocity)
   */
  getSpeed(): number {
    return Math.sqrt(this.x[2] * this.x[2] + this.x[3] * this.x[3]);
  }

  /**
   * Reset the filter
   */
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

  /**
   * Create an EMA filter
   * 
   * @param alpha - Smoothing factor (0-1). Lower = more smoothing.
   */
  constructor(alpha: number = 0.3) {
    this.alpha = alpha;
    this.value = 0;
  }

  /**
   * Update with new value
   */
  update(newValue: number): number {
    if (!this.initialized) {
      this.value = newValue;
      this.initialized = true;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  /**
   * Get current smoothed value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Reset the filter
   */
  reset(): void {
    this.value = 0;
    this.initialized = false;
  }
}

