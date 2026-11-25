import { useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useGsapContext } from '../../hooks/useGsapContext';

/**
 * Pinned horizontal scroll. On desktop with motion allowed, the section pins and vertical
 * scroll moves the track sideways (scrub: 1 gives it a second of catch-up inertia).
 * On small screens or with reduced motion it falls back to a native swipeable strip.
 */
export function HorizontalScroll({ children, className = '', label }) {
  const section = useRef(null);
  const track = useRef(null);

  useGsapContext(
    ({ motion, desktop }) => {
      if (!motion || !desktop) return undefined;
      const sectionEl = section.current;
      const trackEl = track.current;
      sectionEl.classList.add('is-pinned');

      const distance = () => Math.max(0, trackEl.scrollWidth - sectionEl.clientWidth);

      gsap.to(trackEl, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          // Expose progress as a CSS variable for the progress bar.
          onUpdate: (self) => sectionEl.style.setProperty('--hs-progress', self.progress.toFixed(4)),
        },
      });

      return () => sectionEl.classList.remove('is-pinned');
    },
    [],
    section
  );

  return (
    <section ref={section} className={`hs ${className}`} aria-label={label}>
      <div ref={track} className="hs-track">
        {children}
      </div>
      <div className="hs-progress" aria-hidden="true" />
    </section>
  );
}
