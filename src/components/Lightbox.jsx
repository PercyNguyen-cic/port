import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';
import { useLenis } from '../providers/SmoothScroll';

const LightboxContext = createContext(() => {});
export const useLightbox = () => useContext(LightboxContext);

const PAD = () => (window.innerWidth < 640 ? { x: 12, top: 64, bottom: 112 } : { x: 96, top: 76, bottom: 92 });

function fit(w, h) {
  const p = PAD();
  const s = Math.min((window.innerWidth - p.x * 2) / w, (window.innerHeight - p.top - p.bottom) / h, 1.5);
  return { w: Math.round(w * s), h: Math.round(h * s), s };
}

/**
 * Full-size viewer. open(items, index, originEl) grows the image out of the thumbnail,
 * then swaps in the full-resolution original. Click to view at 100% and drag to pan;
 * arrows, swipe and Escape work as expected.
 */
export function LightboxProvider({ children }) {
  const lenis = useLenis();
  const [state, setState] = useState(null); // { items, index }
  const [zoomed, setZoomed] = useState(false);
  const [loading, setLoading] = useState(false);
  const dialog = useRef(null);
  const img = useRef(null);
  const stage = useRef(null);
  const origin = useRef(null);
  const busy = useRef(false);
  const lastFocus = useRef(null);
  const reduced = prefersReducedMotion();

  const item = state ? state.items[state.index] : null;

  const open = useCallback((items, index, originEl) => {
    lastFocus.current = document.activeElement;
    origin.current = originEl || null;
    setZoomed(false);
    setState({ items, index });
  }, []);

  // Size the image to fit whenever the item or viewport changes.
  const size = useCallback(() => {
    if (!item || !img.current || zoomed) return;
    const f = fit(item.w, item.h);
    const p = PAD();
    Object.assign(img.current.style, { width: `${f.w}px`, height: `${f.h}px` });
    stage.current.style.padding = `${p.top}px ${p.x}px ${p.bottom}px`;
  }, [item, zoomed]);

  useEffect(() => {
    size();
    window.addEventListener('resize', size);
    return () => window.removeEventListener('resize', size);
  }, [size]);

  // Opening: show the dialog, animate from the thumbnail, then load the original.
  useEffect(() => {
    if (!item) return;
    const d = dialog.current;
    if (!d.open) {
      d.showModal();
      lenis?.stop();
      document.documentElement.classList.add('lb-open');
      size();
      gsap.fromTo('.lb-backdrop', { opacity: 0 }, { opacity: 1, duration: reduced ? 0.01 : 0.35 });
      gsap.fromTo('.lb-chrome', { opacity: 0 }, { opacity: 1, duration: 0.3, delay: reduced ? 0 : 0.15 });
      const from = origin.current?.getBoundingClientRect();
      if (from && !reduced && from.width) {
        const to = img.current.getBoundingClientRect();
        busy.current = true;
        gsap.fromTo(
          img.current,
          { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: 'expo.out', transformOrigin: '0 0', onComplete: () => { busy.current = false; } }
        );
      }
    }
    setLoading(true);
    const full = new Image();
    full.decoding = 'async';
    full.onload = () => {
      if (img.current && img.current.dataset.slug === item.slug) img.current.src = item.full;
      setLoading(false);
    };
    full.onerror = () => setLoading(false);
    full.src = item.full;
    // Warm the neighbours.
    [-1, 1].forEach((dir) => {
      const n = state.items[(state.index + dir + state.items.length) % state.items.length];
      new Image().src = n.src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const close = useCallback(() => {
    if (!state || busy.current) return;
    const d = dialog.current;
    const finish = () => {
      d.close();
      lenis?.start();
      document.documentElement.classList.remove('lb-open');
      setState(null);
      setZoomed(false);
      busy.current = false;
      lastFocus.current?.focus?.({ preventScroll: true });
    };
    busy.current = true;
    gsap.to('.lb-chrome', { opacity: 0, duration: 0.2 });
    gsap.to('.lb-backdrop', { opacity: 0, duration: reduced ? 0.01 : 0.35, delay: 0.1 });
    gsap.to(img.current, { opacity: 0, scale: reduced ? 1 : 0.96, duration: reduced ? 0.01 : 0.3, ease: 'power2.in', onComplete: finish });
  }, [state, lenis, reduced]);

  const go = useCallback(
    (dir) => {
      if (!state || busy.current) return;
      setZoomed(false);
      const next = (state.index + dir + state.items.length) % state.items.length;
      if (reduced) {
        setState({ ...state, index: next });
        return;
      }
      busy.current = true;
      gsap.to(img.current, {
        opacity: 0,
        x: -30 * dir,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setState({ ...state, index: next });
          requestAnimationFrame(() => {
            gsap.fromTo(img.current, { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out', onComplete: () => { busy.current = false; } });
          });
        },
      });
    },
    [state, reduced]
  );

  // Zoom to actual pixels around the click point; pan by scrolling or dragging.
  const toggleZoom = (e) => {
    if (!item) return;
    const f = fit(item.w, item.h);
    if (zoomed) {
      setZoomed(false);
      stage.current.scrollTo(0, 0);
      return;
    }
    if (f.s >= 0.95) return;
    const r = img.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    setZoomed(true);
    requestAnimationFrame(() => {
      Object.assign(img.current.style, { width: `${item.w}px`, height: `${item.h}px` });
      stage.current.style.padding = '0px';
      stage.current.scrollLeft = item.w * fx - e.clientX;
      stage.current.scrollTop = item.h * fy - e.clientY;
    });
  };

  // Pointer: drag to pan when zoomed, swipe to change piece when not.
  const pointer = useRef(null);
  const moved = useRef(false);
  const onPointerDown = (e) => {
    pointer.current = { x: e.clientX, y: e.clientY, sl: stage.current.scrollLeft, st: stage.current.scrollTop, type: e.pointerType };
    moved.current = false;
  };
  const onPointerMove = (e) => {
    const p = pointer.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved.current = true;
    if (zoomed && p.type === 'mouse' && moved.current) {
      stage.current.scrollLeft = p.sl - dx;
      stage.current.scrollTop = p.st - dy;
    }
  };
  const onPointerUp = (e) => {
    const p = pointer.current;
    pointer.current = null;
    if (!p || zoomed || p.type === 'mouse') return;
    const dx = e.clientX - p.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - p.y) * 1.5) {
      moved.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onStageClick = (e) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    if (e.target === img.current) toggleZoom(e);
    else if (!zoomed) close();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  const canZoom = item ? fit(item.w, item.h).s < 0.95 : false;
  const count = state ? `${String(state.index + 1).padStart(2, '0')} / ${String(state.items.length).padStart(2, '0')}` : '';

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className={`lb${zoomed ? ' is-zoomed' : ''}${loading ? ' is-loading' : ''}`}
        aria-label="Artwork viewer"
        onCancel={(e) => {
          e.preventDefault();
          if (zoomed) setZoomed(false);
          else close();
        }}
        onKeyDown={onKeyDown}
      >
        <div className="lb-backdrop" />
        <div
          ref={stage}
          className="lb-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { pointer.current = null; }}
          onClick={onStageClick}
        >
          {item && (
            <img
              ref={img}
              key={item.slug}
              data-slug={item.slug}
              src={item.src}
              alt={item.alt}
              draggable={false}
              style={{ cursor: zoomed ? 'zoom-out' : canZoom ? 'zoom-in' : 'default' }}
            />
          )}
        </div>
        <div className="lb-chrome">
          <div className="lb-top">
            <span className="lb-count">{count}</span>
            <span className="lb-loading">Loading full resolution</span>
            <button type="button" className="lb-btn lb-close" onClick={close} aria-label="Close viewer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </div>
          <button type="button" className="lb-btn lb-prev" onClick={() => go(-1)} aria-label="Previous piece">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" /></svg>
          </button>
          <button type="button" className="lb-btn lb-next" onClick={() => go(1)} aria-label="Next piece">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" /></svg>
          </button>
          <div className="lb-bottom">
            {item?.title && <span className="lb-title">{item.title}</span>}
            {item?.note && <span className="lb-note">{item.note}</span>}
            {canZoom && !zoomed && <span className="lb-hint">Click the image to see it at full size</span>}
          </div>
        </div>
      </dialog>
    </LightboxContext.Provider>
  );
}
