import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/gsap';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/\\[]0123456789';
const LOWER = 'abcdefghijklmnopqrstuvwxyz#%&*+=<>/\\[]0123456789';

/**
 * Decodes `text` into the element at `ref`: each character cycles through glyphs, then
 * locks in, roughly left to right. Plays when the element enters the viewport and again
 * on hover of the element (or its nearest link/button). Does nothing under reduced motion.
 *
 * Returns `play`, so callers can trigger it themselves (e.g. as part of a timeline).
 */
export function useScramble(ref, text, { onView = true, onHover = true, duration = 0.8, delay = 0 } = {}) {
  const playRef = useRef(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.textContent = text;
    if (prefersReducedMotion()) return undefined;

    const chars = [...text];
    let raf = 0;
    let timer = 0;

    const play = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      // Each character resolves at its own moment, biased left to right.
      const lockAt = chars.map((_, i) => (i / Math.max(1, chars.length)) * 0.55 + Math.random() * 0.45);
      let lastSwap = 0;
      const frame = (now) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        if (now - lastSwap > 45 || t === 1) {
          lastSwap = now;
          let out = '';
          for (let i = 0; i < chars.length; i += 1) {
            const c = chars[i];
            if (c === ' ' || t >= lockAt[i]) out += c;
            else {
              const set = c === c.toLowerCase() && c !== c.toUpperCase() ? LOWER : UPPER;
              out += set[(Math.random() * set.length) | 0];
            }
          }
          el.textContent = out;
        }
        if (t < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    playRef.current = () => {
      clearTimeout(timer);
      timer = setTimeout(play, delay * 1000);
    };

    let io;
    if (onView) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            playRef.current();
            io.disconnect();
          }
        },
        { threshold: 0.35 }
      );
      io.observe(el);
    }

    const hoverTarget = el.closest('a, button') || el;
    if (onHover) hoverTarget.addEventListener('mouseenter', play);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      io?.disconnect();
      hoverTarget.removeEventListener('mouseenter', play);
      el.textContent = text;
    };
  }, [ref, text, onView, onHover, duration, delay]);

  return playRef;
}
