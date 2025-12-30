import Dexie, { type Table } from 'dexie';
import type { Alert, ModuleType } from '../types';

class ArgusDatabase extends Dexie {
  alerts!: Table<Alert, number>;
  constructor() {
    super('ArgusAlertsDB');
    this.version(1).stores({
      alerts: '++id, camera_id, module, state, detected_time, processed, created_at'
    });
  }
}

const db = new ArgusDatabase();

export async function insertAlert(alert: Omit<Alert, 'id'>): Promise<number> {
  return await db.alerts.add(alert as Alert);
}

export async function getAlerts(limit = 100): Promise<Alert[]> {
  return await db.alerts.orderBy('created_at').reverse().limit(limit).toArray();
}

export async function getUnprocessedAlerts(): Promise<Alert[]> {
  return await db.alerts.where('processed').equals(0).toArray();
}

export async function markAlertProcessed(id: number): Promise<void> {
  await db.alerts.update(id, { processed: 1 });
}

export async function purgeOldAlerts(daysToKeep = 10): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  const old = await db.alerts.where('created_at').below(cutoff.toISOString()).and(a => a.processed === 1).toArray();
  await db.alerts.bulkDelete(old.map(a => a.id!));
  return old.length;
}

export async function getAlertStats() {
  const all = await db.alerts.toArray();
  const byModule: Record<string, number> = { intrusion: 0, throwing: 0, vehicle: 0, collision: 0, ppe: 0 };
  let unprocessed = 0, processed = 0;
  all.forEach(a => { byModule[a.module]++; a.processed === 0 ? unprocessed++ : processed++; });
  return { total: all.length, unprocessed, processed, byModule: byModule as Record<ModuleType, number> };
}

export async function clearAllAlerts(): Promise<void> {
  await db.alerts.clear();
}

export async function exportAlertsAsJSON(): Promise<string> {
  return JSON.stringify(await db.alerts.toArray(), null, 2);
}

