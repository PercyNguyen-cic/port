import { useRef, useState } from 'react';
import { useLightbox } from './Lightbox';
import { InkReveal } from './motion/InkReveal';

/**
 * One piece: never cropped (its box takes the image's own aspect ratio), opens the
 * full-size viewer on click. With `reveal`, it starts under a sheet of paper that the
 * visitor washes away with a click.
 */
export function Artwork({ item, group, index, sizes = '50vw', reveal = false, caption = true, eager = false, className = '' }) {
  const openLightbox = useLightbox();
  const imgRef = useRef(null);
  const [veiled, setVeiled] = useState(reveal);

  return (
    <figure className={`art ${className}`} style={{ '--r': item.ratio, '--c': item.color }}>
      <div className="art-frame">
        <button
          type="button"
          className="art-open"
          onClick={() => openLightbox(group || [item], index || 0, imgRef.current)}
          aria-label={item.title ? `View ${item.title} full size` : 'View full size'}
          inert={veiled || undefined}
        >
          <img
            ref={imgRef}
            src={item.src}
            srcSet={item.srcset}
            sizes={sizes}
            width={item.w}
            height={item.h}
            alt={item.alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        </button>
        {veiled && <InkReveal onRevealed={() => setVeiled(false)} />}
      </div>
      {caption && (item.title || item.note) && (
        <figcaption>
          {item.title && <span className="art-title">{item.title}</span>}
          {item.note && <span className="art-note">{item.note}</span>}
        </figcaption>
      )}
    </figure>
  );
}
