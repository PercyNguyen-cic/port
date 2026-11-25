import { useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useGsapContext } from '../../hooks/useGsapContext';

/**
 * Two rows of cards that slide sideways in opposite directions while the section scrolls
 * past (scroll-linked, scrub: 1). No pinning, so it reads as a quick flick through a
 * sketchbook. Small screens and reduced motion get native swipeable rows instead.
 */
export function ScrollStrip({ rows, renderItem, label }) {
  const section = useRef(null);

  useGsapContext(
    ({ motion, desktop }) => {
      if (!motion || !desktop) return undefined;
      const el = section.current;
      el.classList.add('is-scrubbed');
      el.querySelectorAll('.strip-row').forEach((row, i) => {
        const travel = () => Math.max(0, row.scrollWidth - el.clientWidth);
        const forward = i % 2 === 0;
        gsap.fromTo(
          row,
          { x: () => (forward ? 0 : -travel()) },
          {
            x: () => (forward ? -travel() : 0),
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true },
          }
        );
      });
      return () => el.classList.remove('is-scrubbed');
    },
    [],
    section
  );

  return (
    <div ref={section} className="strip" aria-label={label} role="group">
      {rows.map((items, r) => (
        <div className="strip-row" key={r}>
          {items.map((item) => renderItem(item))}
        </div>
      ))}
    </div>
  );
}
