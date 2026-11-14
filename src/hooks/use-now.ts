import { useEffect, useState } from 'react';

/**
 * A render-safe "current time". Reading Date.now() directly during render is
 * impure (and flagged by the React compiler lint), so it is sampled here and
 * refreshed on an interval instead.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
}
