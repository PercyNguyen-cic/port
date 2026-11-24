/* Percy Nguyen — portfolio
   Header · menu · reveal-on-scroll · lightbox (zoom, pan, swipe, deep links) · shape-language quiz */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- Page load ---------- */
  const markLoaded = () => requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  const heroImg = $('.hero-art img');
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', markLoaded, { once: true });
    heroImg.addEventListener('error', markLoaded, { once: true });
    setTimeout(markLoaded, 2500);
  } else {
    markLoaded();
  }

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  const header = $('.site-header');
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (header && !document.body.classList.contains('nav-open')) {
        header.classList.toggle('is-hidden', y > lastY && y > 240);
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $('.menu-toggle');
  const setMenu = (open) => {
    document.body.classList.toggle('nav-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  };
  if (toggle) {
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
    $$('.site-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Lightbox ---------- */
  const triggers = $$('.work-open');
  const lb = $('#lightbox');
  if (lb && triggers.length) initLightbox(lb, triggers);

  function initLightbox(lb, triggers) {
    const stage = $('.lb-stage', lb);
    const img = $('.lb-img', lb);
    const count = $('.lb-count', lb);
    const title = $('.lb-caption .title', lb);
    const note = $('.lb-caption .note', lb);
    const hint = $('.lb-hint', lb);
    const btnClose = $('.lb-close', lb);
    const btnPrev = $('.lb-prev', lb);
    const btnNext = $('.lb-next', lb);
    const total = triggers.length;
    const pad = () => (window.innerWidth < 640 ? { x: 12, top: 64, bottom: 120 } : { x: 88, top: 72, bottom: 88 });

    let index = -1;
    let zoomed = false;
    let busy = false;
    let lastFocus = null;

    const data = (i) => {
      const t = triggers[i];
      return {
        el: t,
        thumb: $('img', t),
        full: t.dataset.full,
        w: +t.dataset.w,
        h: +t.dataset.h,
        title: t.dataset.title || '',
        note: t.dataset.note || '',
        id: t.dataset.id || '',
        alt: $('img', t).alt,
      };
    };

    const fit = (w, h) => {
      const p = pad();
      const aw = window.innerWidth - p.x * 2;
      const ah = window.innerHeight - p.top - p.bottom;
      const s = Math.min(aw / w, ah / h, 1.5);
      return { w: Math.round(w * s), h: Math.round(h * s), s };
    };

    const sizeImage = () => {
      if (index < 0 || zoomed) return;
      const d = data(index);
      const f = fit(d.w, d.h);
      img.style.width = f.w + 'px';
      img.style.height = f.h + 'px';
      const p = pad();
      stage.style.padding = `${p.top}px ${p.x}px ${p.bottom}px`;
      const canZoom = f.s < 0.95;
      img.style.cursor = canZoom ? 'zoom-in' : 'default';
      if (hint) hint.textContent = canZoom ? 'Click image to view at full size' : '';
    };

    const fill = (i) => {
      const d = data(i);
      index = i;
      img.alt = d.alt;
      img.src = d.thumb.currentSrc || d.thumb.src;
      count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
      title.textContent = d.title;
      note.textContent = d.note;
      title.hidden = !d.title;
      note.hidden = !d.note;
      sizeImage();
      if (d.id) history.replaceState(null, '', '#' + d.id);
      // Swap in the full-resolution original once it has loaded.
      lb.classList.add('is-loading');
      const full = new Image();
      full.decoding = 'async';
      full.onload = () => {
        if (index === i) { img.src = d.full; lb.classList.remove('is-loading'); }
      };
      full.onerror = () => lb.classList.remove('is-loading');
      full.src = d.full;
      // Warm the neighbours' web-size images.
      [i - 1, i + 1].forEach((n) => {
        const nb = triggers[(n + total) % total];
        const src = $('img', nb).currentSrc;
        if (src) { const pre = new Image(); pre.src = src; }
      });
    };

    const rectTransform = (from, to) => {
      const sx = from.width / to.width;
      const sy = from.height / to.height;
      return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`;
    };

    const inView = (r) => r.bottom > 0 && r.top < window.innerHeight && r.width > 0;

    const open = (i, animate = true) => {
      if (busy) return;
      lastFocus = document.activeElement;
      fill(i);
      lb.showModal();
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => lb.classList.add('is-open'));
      const thumbRect = data(i).thumb.getBoundingClientRect();
      if (animate && !reduceMotion && inView(thumbRect)) {
        const to = img.getBoundingClientRect();
        busy = true;
        img.animate(
          [{ transform: rectTransform(thumbRect, to) }, { transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
        ).onfinish = () => { busy = false; };
      } else {
        img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduceMotion ? 1 : 250 });
      }
      btnClose.focus({ preventScroll: true });
    };

    const close = () => {
      if (busy || index < 0) return;
      if (zoomed) setZoom(false);
      const d = data(index);
      const thumbRect = d.thumb.getBoundingClientRect();
      const finish = () => {
        lb.close();
        lb.classList.remove('is-open', 'is-loading');
        document.body.style.overflow = '';
        img.removeAttribute('src');
        index = -1;
        busy = false;
        history.replaceState(null, '', location.pathname + location.search);
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      };
      lb.classList.remove('is-open');
      if (!reduceMotion && inView(thumbRect)) {
        busy = true;
        const from = img.getBoundingClientRect();
        img.animate(
          [{ transform: 'none' }, { transform: rectTransform(thumbRect, from) }],
          { duration: 340, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
        ).onfinish = finish;
      } else {
        busy = true;
        img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduceMotion ? 1 : 200, fill: 'forwards' }).onfinish = finish;
      }
    };

    const go = (dir) => {
      if (busy || index < 0) return;
      if (zoomed) setZoom(false);
      const next = (index + dir + total) % total;
      if (reduceMotion) { fill(next); return; }
      busy = true;
      img.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-24 * dir}px)` }],
        { duration: 160, easing: 'ease-in', fill: 'forwards' }
      ).onfinish = () => {
        fill(next);
        img.getAnimations().forEach((a) => a.cancel());
        img.animate(
          [{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: 'none' }],
          { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
        ).onfinish = () => { busy = false; };
      };
    };

    /* Zoom to actual pixels; pan by scrolling or dragging */
    const setZoom = (on, clientX, clientY) => {
      const d = data(index);
      if (on) {
        const before = img.getBoundingClientRect();
        const fx = clientX != null ? (clientX - before.left) / before.width : 0.5;
        const fy = clientY != null ? (clientY - before.top) / before.height : 0.5;
        zoomed = true;
        lb.classList.add('is-zoomed');
        stage.classList.add('is-zoomed');
        stage.style.padding = '0px';
        img.style.width = d.w + 'px';
        img.style.height = d.h + 'px';
        stage.scrollLeft = d.w * fx - (clientX ?? window.innerWidth / 2);
        stage.scrollTop = d.h * fy - (clientY ?? window.innerHeight / 2);
      } else {
        zoomed = false;
        lb.classList.remove('is-zoomed');
        stage.classList.remove('is-zoomed');
        stage.scrollTo(0, 0);
        sizeImage();
      }
    };

    // Pointer: drag-to-pan when zoomed, swipe to navigate when not.
    let down = null;
    let moved = false;
    stage.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, sl: stage.scrollLeft, st: stage.scrollTop, type: e.pointerType };
      moved = false;
    });
    stage.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      if (zoomed && down.type === 'mouse' && moved) {
        stage.classList.add('is-dragging');
        stage.scrollLeft = down.sl - dx;
        stage.scrollTop = down.st - dy;
      }
    });
    const endPointer = (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (!zoomed && down.type !== 'mouse' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
        moved = true;
      }
      stage.classList.remove('is-dragging');
      down = null;
    };
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', () => { down = null; stage.classList.remove('is-dragging'); });

    stage.addEventListener('click', (e) => {
      if (moved) { moved = false; return; }
      if (e.target === img) {
        const f = fit(data(index).w, data(index).h);
        if (zoomed) setZoom(false);
        else if (f.s < 0.95) setZoom(true, e.clientX, e.clientY);
      } else if (!zoomed) {
        close();
      }
    });

    triggers.forEach((t, i) => t.addEventListener('click', () => open(i)));
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => go(-1));
    btnNext.addEventListener('click', () => go(1));
    lb.addEventListener('cancel', (e) => { e.preventDefault(); if (zoomed) setZoom(false); else close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    window.addEventListener('resize', sizeImage);

    // Deep link: /#work-12 opens that piece.
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const i = triggers.findIndex((t) => t.dataset.id === id);
      if (i > -1 && index !== i) {
        if (index > -1) { fill(i); } else { open(i, false); }
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- Shape Language quiz ---------- */
  const quiz = $('.quiz');
  if (quiz) initQuiz(quiz);

  function initQuiz(quiz) {
    const tray = $('.faces', quiz);
    const zones = $$('.zone', quiz);
    const faces = $$('.face', tray);
    const status = $('.quiz-status', quiz);
    const live = $('.quiz-live', quiz);
    let selected = null;
    let matched = 0;

    const say = (msg) => { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); };
    const update = () => {
      status.innerHTML = `<strong>${matched}</strong> of ${zones.length} matched`;
      if (matched === zones.length) say('All four read correctly. Nicely done.');
    };
    const select = (face) => {
      faces.forEach((f) => f.setAttribute('aria-pressed', 'false'));
      zones.forEach((z) => z.classList.remove('is-target'));
      selected = face;
      if (face) {
        face.setAttribute('aria-pressed', 'true');
        zones.forEach((z) => { if (!z.classList.contains('is-done')) z.classList.add('is-target'); });
        say('Selected. Now choose the personality it matches.');
      }
    };
    const place = (face, zone, silent) => {
      const placed = document.createElement('span');
      placed.className = 'face placed';
      placed.appendChild($('img', face).cloneNode());
      zone.prepend(placed);
      zone.classList.add('is-done');
      zone.setAttribute('aria-disabled', 'true');
      face.hidden = true;
      matched += 1;
      if (!silent) say(`Correct: ${zone.dataset.label}.`);
    };
    const attempt = (face, zone) => {
      if (!face || zone.classList.contains('is-done')) return;
      if (face.dataset.answer === zone.dataset.expects) {
        place(face, zone);
        select(null);
        update();
      } else {
        zone.classList.remove('is-wrong');
        void zone.offsetWidth;
        zone.classList.add('is-wrong');
        setTimeout(() => zone.classList.remove('is-wrong'), 500);
        say(`Not ${zone.dataset.label}. Try another.`);
      }
    };

    faces.forEach((face) => {
      face.addEventListener('click', () => select(selected === face ? null : face));
      face.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', face.dataset.answer);
        e.dataTransfer.effectAllowed = 'move';
        face.classList.add('is-dragging');
        select(face);
      });
      face.addEventListener('dragend', () => face.classList.remove('is-dragging'));
    });
    zones.forEach((zone) => {
      zone.addEventListener('click', () => attempt(selected, zone));
      zone.addEventListener('dragover', (e) => { if (!zone.classList.contains('is-done')) { e.preventDefault(); zone.classList.add('is-over'); } });
      zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('is-over');
        const face = faces.find((f) => f.dataset.answer === e.dataTransfer.getData('text/plain'));
        attempt(face, zone);
      });
    });

    $('.quiz-reveal', quiz).addEventListener('click', () => {
      zones.forEach((zone) => {
        if (zone.classList.contains('is-done')) return;
        const face = faces.find((f) => f.dataset.answer === zone.dataset.expects);
        place(face, zone, true);
      });
      select(null);
      update();
      say('Answers revealed.');
    });
    $('.quiz-reset', quiz).addEventListener('click', () => {
      zones.forEach((zone) => {
        zone.classList.remove('is-done', 'is-wrong', 'is-target');
        zone.removeAttribute('aria-disabled');
        const p = $('.placed', zone);
        if (p) p.remove();
      });
      faces.forEach((f) => { f.hidden = false; });
      matched = 0;
      select(null);
      update();
      say('Quiz reset.');
    });
    update();
  }
})();
