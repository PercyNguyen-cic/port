import { useRef } from 'react';
import { useScramble } from '../../hooks/useScramble';

/**
 * Text that decodes itself on viewport entry and on hover.
 * Screen readers get the real text; the scrambling copy is hidden from them.
 */
export function ScrambleText({ text, as: Tag = 'span', className, onView = true, onHover = true, duration, delay }) {
  const ref = useRef(null);
  useScramble(ref, text, { onView, onHover, duration, delay });
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
