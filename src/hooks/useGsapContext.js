import { useLayoutEffect } from 'react';
import { gsap, MEDIA } from '../lib/gsap';

/**
 * Runs GSAP setup inside gsap.context() (scoped to `scopeRef`) and gsap.matchMedia(),
 * so every tween, ScrollTrigger and SplitText made inside is reverted on unmount.
 *
 * setup(conditions) receives { motion, reduce, desktop } booleans. Branch on
 * `conditions.motion` to provide the full animation and a reduced-motion fallback.
 * It may return a cleanup function, which runs on revert and on media changes.
 */
export function useGsapContext(setup, deps = [], scopeRef) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add(MEDIA, (context) => setup(context.conditions, context));
    }, scopeRef?.current ?? undefined);

    return () => {
      mm.revert();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
