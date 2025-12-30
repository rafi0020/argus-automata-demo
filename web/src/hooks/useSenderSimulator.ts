import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { getUnprocessedAlerts, markAlertProcessed, purgeOldAlerts, getAlertStats } from '../store/alertStore';

export function useSenderSimulator(intervalSeconds = 5, retentionDays = 10) {
  const { senderState, setSenderState } = useAppStore();
  const intervalRef = useRef<number | null>(null);
  
  const process = useCallback(async () => {
    try {
      const unprocessed = await getUnprocessedAlerts();
      for (const alert of unprocessed) {
        console.log('[Sender]', alert.module, alert.id);
        await markAlertProcessed(alert.id!);
      }
      if (unprocessed.length) {
        setSenderState({ lastSendTime: Date.now(), sentCount: senderState.sentCount + unprocessed.length });
      }
      await purgeOldAlerts(retentionDays);
      const stats = await getAlertStats();
      setSenderState({ pendingCount: stats.unprocessed });
    } catch (e) { console.error('[Sender]', e); }
  }, [setSenderState, senderState.sentCount, retentionDays]);
  
  useEffect(() => {
    process();
    intervalRef.current = window.setInterval(process, intervalSeconds * 1000);
    setSenderState({ isRunning: true });
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSenderState({ isRunning: false });
    };
  }, [process, intervalSeconds, setSenderState]);
  
  return senderState;
}

