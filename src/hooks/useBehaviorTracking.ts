import { useEffect, useRef, useCallback } from 'react';

export function useBehaviorTracking(active: boolean) {
  const tabSwitches = useRef(0);
  const fsExits = useRef(0);
  const logs = useRef<{ event: string; timestamp: string; count: number }[]>([]);

  useEffect(() => {
    if (!active) return;

    const onVisibility = () => {
      if (document.hidden) {
        tabSwitches.current += 1;
        logs.current.push({ event: 'tab_switch', timestamp: new Date().toISOString(), count: tabSwitches.current });
      }
    };
    const onFs = () => {
      if (!document.fullscreenElement) {
        fsExits.current += 1;
        logs.current.push({ event: 'fullscreen_exit', timestamp: new Date().toISOString(), count: fsExits.current });
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [active]);

  const enterFs = useCallback(async () => {
    try { await document.documentElement.requestFullscreen(); } catch { /* ignore */ }
  }, []);

  const exitFs = useCallback(async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ignore */ }
  }, []);

  const getStats = useCallback(() => ({
    tabSwitchCount: tabSwitches.current,
    fullscreenExitCount: fsExits.current,
    behaviorLogs: logs.current,
  }), []);

  return { enterFs, exitFs, getStats };
}
