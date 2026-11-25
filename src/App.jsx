import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { SmoothScroll, useLenis } from './providers/SmoothScroll';
import { LightboxProvider } from './components/Lightbox';
import { Header, Footer } from './components/Layout';
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/gsap';
import Home from './pages/Home';

const InkBackground = lazy(() => import('./webgl/InkBackground').then((m) => ({ default: m.InkBackground })));
const Characters = lazy(() => import('./pages/Characters'));
const Process = lazy(() => import('./pages/Process'));
const About = lazy(() => import('./pages/About'));

const TITLES = {
  '/': 'Percy Nguyen | Illustrator & Splash Artist',
  '/characters': 'Characters | Percy Nguyen',
  '/process': 'Process | Percy Nguyen',
  '/about': 'About | Percy Nguyen',
};

function NotFound() {
  return (
    <section className="page-head container">
      <h1 className="page-title">Not here</h1>
      <p className="page-lede">
        That page doesn&rsquo;t exist. <Link to="/">Go to the work</Link>.
      </p>
    </section>
  );
}

/** Resets scroll on navigation, handles #anchors through Lenis, and fades each page in. */
function RouteEffects({ mainRef }) {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();
  const first = useRef(true);

  useLayoutEffect(() => {
    document.title = TITLES[pathname] || 'Percy Nguyen';
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    if (!first.current && !prefersReducedMotion()) {
      gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    }
    first.current = false;
  }, [pathname, lenis, mainRef]);

  useEffect(() => {
    // Let lazy pages and images lay out, then recalculate every ScrollTrigger.
    const id = setTimeout(() => ScrollTrigger.refresh(), 150);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      clearTimeout(id);
      window.removeEventListener('load', onLoad);
    };
  }, [pathname]);

  useEffect(() => {
    if (!hash) return undefined;
    const id = setTimeout(() => {
      const el = document.querySelector(hash);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.4 });
      else el.scrollIntoView();
    }, 250);
    return () => clearTimeout(id);
  }, [hash, pathname, lenis]);

  return null;
}

export default function App() {
  const main = useRef(null);
  return (
    <SmoothScroll>
      <LightboxProvider>
        <Suspense fallback={null}>
          <InkBackground />
        </Suspense>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <main id="main" ref={main}>
          <RouteEffects mainRef={main} />
          <Suspense fallback={<div className="page-loading" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/process" element={<Process />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </LightboxProvider>
    </SmoothScroll>
  );
}
