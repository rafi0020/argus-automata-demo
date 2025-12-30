/**
 * Geometry utilities for detection algorithms
 * From parity layer - mirrors Python implementations
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm.
 * Mirrors Python's cv2.pointPolygonTest or custom ray casting.
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

// Alias for backwards compatibility
export const pointInPolygon = isPointInPolygon;

/**
 * Calculate Euclidean distance between two points.
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Alias for backwards compatibility
export const distance = getDistance;

/**
 * Calculate the center point of a bounding box.
 */
export function getBboxCenter(bbox: [number, number, number, number]): Point {
  return {
    x: (bbox[0] + bbox[2]) / 2,
    y: (bbox[1] + bbox[3]) / 2,
  };
}

export function getCentroid(bbox: { x1: number; y1: number; x2: number; y2: number }): Point {
  return { x: (bbox.x1 + bbox.x2) / 2, y: (bbox.y1 + bbox.y2) / 2 };
}

/**
 * Calculate the bottom center of a bounding box (feet position for person).
 */
export function getBboxBottomCenter(bbox: [number, number, number, number]): Point {
  return {
    x: (bbox[0] + bbox[2]) / 2,
    y: bbox[3],
  };
}

export function getBottomCenter(bbox: { x1: number; y1: number; x2: number; y2: number }): Point {
  return { x: (bbox.x1 + bbox.x2) / 2, y: bbox.y2 };
}

/**
 * Check if two bounding boxes overlap.
 */
export function bboxesOverlap(
  bbox1: [number, number, number, number],
  bbox2: [number, number, number, number]
): boolean {
  return !(
    bbox1[2] < bbox2[0] ||
    bbox1[0] > bbox2[2] ||
    bbox1[3] < bbox2[1] ||
    bbox1[1] > bbox2[3]
  );
}

/**
 * Calculate Intersection over Union (IoU) for two bounding boxes.
 */
export function calculateIoU(
  bbox1: [number, number, number, number],
  bbox2: [number, number, number, number]
): number {
  const x1 = Math.max(bbox1[0], bbox2[0]);
  const y1 = Math.max(bbox1[1], bbox2[1]);
  const x2 = Math.min(bbox1[2], bbox2[2]);
  const y2 = Math.min(bbox1[3], bbox2[3]);

  if (x2 < x1 || y2 < y1) return 0;

  const intersection = (x2 - x1) * (y2 - y1);
  const area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1]);
  const area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1]);
  const union = area1 + area2 - intersection;

  return union > 0 ? intersection / union : 0;
}
