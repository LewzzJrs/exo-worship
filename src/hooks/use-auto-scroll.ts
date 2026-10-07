import { useEffect, useRef, useState } from "react";

// menggulir halaman pelan-pelan, speed dalam pixel per detik
export function useAutoScroll(speed: number) {
  const [isScrolling, setIsScrolling] = useState(false);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!isScrolling) return;

    let frame = 0;
    let last = performance.now();
    // sisa pecahan pixel dikumpulkan, karena scroll hanya bisa bilangan bulat
    let carry = 0;

    function step(now: number) {
      carry += (speedRef.current * (now - last)) / 1000;
      last = now;
      const pixels = Math.floor(carry);
      if (pixels > 0) {
        carry -= pixels;
        window.scrollBy(0, pixels);
      }

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setIsScrolling(false);
        return;
      }
      frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isScrolling]);

  return { isScrolling, setIsScrolling };
}
