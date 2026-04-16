// ✅ DONE — Phase 3: useTimer countdown hook
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Countdown timer hook.
 * @param {Date|string|number} targetTime — time to count down to
 * @param {{ onExpire?: () => void, autoStart?: boolean }} options
 * @returns {{ days, hours, minutes, seconds, totalSeconds, isExpired, isRunning, start, pause, reset }}
 */
export default function useTimer(targetTime, options = {}) {
  const { onExpire, autoStart = true } = options;
  const [isRunning, setIsRunning] = useState(autoStart);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const getRemaining = useCallback(() => {
    const target = new Date(targetTime).getTime();
    const diff = Math.max(0, target - Date.now());
    return Math.floor(diff / 1000);
  }, [targetTime]);

  const [totalSeconds, setTotalSeconds] = useState(getRemaining);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      const remaining = getRemaining();
      setTotalSeconds(remaining);
      if (remaining <= 0) {
        setIsRunning(false);
        onExpireRef.current?.();
      }
    };

    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, getRemaining]);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setTotalSeconds(getRemaining());
    setIsRunning(autoStart);
  }, [getRemaining, autoStart]);

  const isExpired = totalSeconds <= 0;

  // Format helpers
  const pad = (n) => String(n).padStart(2, '0');
  const formatted = days > 0
    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    isRunning,
    formatted,
    start,
    pause,
    reset,
  };
}
