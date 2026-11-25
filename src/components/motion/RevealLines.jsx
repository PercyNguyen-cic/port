import { useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { useGsapContext } from '../../hooks/useGsapContext';

/**
 * Masked line-by-line reveal. SplitText wraps each rendered line in an overflow-hidden
 * mask, and the lines rise from yPercent 100 to 0 when the block scrolls into view.
 * `autoSplit` re-splits on resize and once fonts load, so lines always match the layout.
 *
 * Reduced motion: the text is simply shown, unsplit.
 */
export function RevealLines({
  as: Tag = 'p',
  children,
  className,
  delay = 0,
  stagger = 0.09,
  start = 'top 85%',
  immediate = false,
  ...rest
}) {
  const ref = useRef(null);

  useGsapContext(
    ({ motion }) => {
      const el = ref.current;
      if (!motion) {
        gsap.set(el, { visibility: 'visible' });
        return;
      }
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'reveal-line',
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(self.lines, {
            yPercent: 100,
            duration: 1.1,
            ease: 'expo.out',
            stagger,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
          });
        },
      });
    },
    [],
    ref
  );

  return (
    <Tag ref={ref} className={className} data-reveal-lines="" {...rest}>
      {children}
    </Tag>
  );
}
