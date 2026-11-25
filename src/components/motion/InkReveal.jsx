import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/gsap';

const PAPER = [235, 230, 220];

/** Organic blob edge: layered sines with drifting phases, cheap and smooth. */
function edge(theta, drop, t) {
  const p = drop.phase;
  return (
    1 +
    0.07 * Math.sin(3 * theta + p[0] + t * 0.7) +
    0.045 * Math.sin(5 * theta + p[1] - t * 1.1) +
    0.03 * Math.sin(9 * theta + p[2] + t * 0.4) +
    0.018 * Math.sin(17 * theta + p[3] - t * 1.6)
  );
}

function tracePath(ctx, drop, r, t) {
  const steps = 120;
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    const rr = r * edge(theta, drop, t);
    const x = drop.x + Math.cos(theta) * rr;
    const y = drop.y + Math.sin(theta) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const makeDrop = (x, y, max, born, speed) => ({
  x,
  y,
  max,
  born,
  speed,
  phase: Array.from({ length: 4 }, () => Math.random() * Math.PI * 2),
});

/**
 * A sheet of paper over an artwork. Clicking drops "water" where you clicked: the paper
 * blooms open in an irregular, spreading stain with a darker wet rim, the way a drop of
 * water pushes back wet paint, and reveals the piece underneath. Keyboard: Enter/Space
 * drops from the centre. Reduced motion: the paper fades away.
 */
export function InkReveal({ onRevealed }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const [state, setState] = useState('idle'); // idle | spreading

  // Paint the paper once, and again on resize while untouched.
  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const paint = () => {
      if (state !== 'idle') return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = el.getBoundingClientRect();
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      const ctx = cv.getContext('2d');
      ctx.fillStyle = `rgb(${PAPER.join(',')})`;
      ctx.fillRect(0, 0, cv.width, cv.height);
      // Paper tooth: faint flecks and fibres.
      for (let i = 0; i < (cv.width * cv.height) / 900; i += 1) {
        const a = Math.random() * 0.05;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(90,80,70,${a})` : `rgba(255,255,255,${a * 1.4})`;
        ctx.fillRect(Math.random() * cv.width, Math.random() * cv.height, 1 + Math.random() * 2 * dpr, 1 + Math.random() * dpr);
      }
      const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, 0, cv.width / 2, cv.height / 2, Math.hypot(cv.width, cv.height) / 2);
      g.addColorStop(0.6, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(60,50,40,0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state]);

  const drop = (clientX, clientY) => {
    if (state !== 'idle') return;
    setState('spreading');
    const el = wrap.current;

    if (prefersReducedMotion()) {
      gsap.to(el, { opacity: 0, duration: 0.35, onComplete: onRevealed });
      return;
    }

    const cv = canvas.current;
    const ctx = cv.getContext('2d');
    const rect = el.getBoundingClientRect();
    const dpr = cv.width / rect.width;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;
    const far = Math.max(
      Math.hypot(x, y),
      Math.hypot(cv.width - x, y),
      Math.hypot(x, cv.height - y),
      Math.hypot(cv.width - x, cv.height - y)
    );

    const drops = [makeDrop(x, y, far * 1.18, 0, 1)];
    // Satellite droplets that splash out and merge back into the main bloom.
    const splashes = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < splashes; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const d = far * (0.12 + Math.random() * 0.25);
      drops.push(makeDrop(x + Math.cos(a) * d, y + Math.sin(a) * d, far * (0.05 + Math.random() * 0.09), 0.1 + Math.random() * 0.5, 1.8));
    }

    const duration = 3.2;
    const start = performance.now();
    const ease = gsap.parseEase('power2.out');

    const frame = () => {
      const t = (performance.now() - start) / 1000;
      for (const d of drops) {
        const local = Math.min(1, Math.max(0, (t - d.born) / (duration / d.speed)));
        if (local <= 0) continue;
        const r = d.max * ease(local);
        // Wet rim: a soft, darker tide line just outside the bloom.
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.shadowColor = 'rgba(80, 62, 48, 0.3)';
        ctx.shadowBlur = 26 * dpr;
        ctx.lineWidth = 3 * dpr;
        ctx.strokeStyle = 'rgba(130, 112, 96, 0.07)';
        tracePath(ctx, d, r * 1.012, t);
        ctx.stroke();
        ctx.restore();
        // Clear the paper inside the bloom (opaque fill = full erase).
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000';
        tracePath(ctx, d, r, t);
        ctx.fill();
      }
      if (t < duration) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cv.width, cv.height);
        onRevealed();
      }
    };
    requestAnimationFrame(frame);
  };

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const r = wrap.current.getBoundingClientRect();
      drop(r.left + r.width / 2, r.top + r.height / 2);
    }
  };

  return (
    <div
      ref={wrap}
      className={`ink-veil is-${state}`}
      role="button"
      tabIndex={0}
      aria-label="Reveal this artwork"
      onClick={(e) => {
        e.stopPropagation();
        drop(e.clientX, e.clientY);
      }}
      onKeyDown={onKey}
    >
      <canvas ref={canvas} aria-hidden="true" />
      <span className="ink-veil-hint" aria-hidden="true">
        Click anywhere to reveal
      </span>
    </div>
  );
}
