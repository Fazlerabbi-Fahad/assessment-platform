import { useState, useEffect, useRef, useCallback } from 'react';

export function useExamTimer(durationMinutes: number, onTimeout: () => void) {
  const total = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(total);
  const startRef = useRef(Date.now());
  const stoppedRef = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => {
      if (stoppedRef.current) return;
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const remaining = total - elapsed;
      if (remaining <= 0) {
        clearInterval(tick);
        setSecondsLeft(0);
        onTimeout();
      } else {
        setSecondsLeft(remaining);
      }
    }, 500);
    return () => clearInterval(tick);
  }, [total, onTimeout]);

  const stop = useCallback(() => { stoppedRef.current = true; }, []);

  return {
    secondsLeft,
    timeTaken: total - secondsLeft,
    isCritical: secondsLeft <= 60,
    stop,
  };
}
