import { createContext, useContext, useEffect, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap';
import { motion } from '../lib/motionStore';

const LenisContext = createContext(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis inertial scrolling, driven by GSAP's ticker so Lenis, ScrollTrigger and every tween
 * advance on the same frame. Users who prefer reduced motion get native scrolling instead.
 */
export function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    motion.reduced = reduce;

    const onPointer = (e) => {
      motion.mouse.x = e.clientX / window.innerWidth;
      motion.mouse.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    if (reduce) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        motion.scroll = window.scrollY;
        motion.progress = max > 0 ? window.scrollY / max : 0;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('scroll', onScroll);
      };
    }

    const instance = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });

    instance.on('scroll', (e) => {
      motion.scroll = e.animatedScroll;
      motion.velocity = e.velocity;
      motion.progress = e.progress || 0;
      ScrollTrigger.update();
    });

    // GSAP's ticker passes seconds; Lenis wants milliseconds.
    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);
    window.__lenis = instance; // handy for debugging in the console

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      window.removeEventListener('pointermove', onPointer);
      delete window.__lenis;
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
