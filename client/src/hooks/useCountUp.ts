import { useState, useEffect, useRef } from "react";

export function useCountUp(end: number, duration = 1500, decimals = 0): number {
  const [current, setCurrent] = useState(0);
  const prevEnd = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startVal = prevEnd.current;
    prevEnd.current = end;

    if (end === 0 && startVal === 0) return;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startVal + (end - startVal) * eased;
      setCurrent(Number(value.toFixed(decimals)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, decimals]);

  return current;
}
