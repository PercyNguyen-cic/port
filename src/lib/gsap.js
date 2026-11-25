// Single place where GSAP plugins are registered, so every module shares one instance.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Conditions used with gsap.matchMedia(): every animation gets a `motion` and a `reduce` branch.
export const MEDIA = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 900px)',
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(MEDIA.reduce).matches;

export { gsap, ScrollTrigger, SplitText };
