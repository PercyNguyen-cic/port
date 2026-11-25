import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from '../lib/gsap';
import { useGsapContext } from '../hooks/useGsapContext';
import { ScrambleText } from '../components/motion/ScrambleText';
import { RevealLines } from '../components/motion/RevealLines';
import { HorizontalScroll } from '../components/motion/HorizontalScroll';
import { ScrollStrip } from '../components/motion/ScrollStrip';
import { Artwork } from '../components/Artwork';
import { CourseSection } from '../components/Layout';
import { art, galleryAll, galleryRows, inktober, sheetsAll } from '../data/works';

function Hero() {
  const ref = useRef(null);
  // The page's one orchestrated moment: the name rises out of its masks while it decodes.
  useGsapContext(
    ({ motion }) => {
      if (!motion) return;
      const tl = gsap.timeline({ delay: 0.25 });
      tl.from('.hero-line > span', { yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.12 })
        .from('.hero-sub', { opacity: 0, y: 16, duration: 1, ease: 'power3.out' }, '-=0.9')
        .from('.hero-cue', { opacity: 0, duration: 1 }, '-=0.6');
    },
    [],
    ref
  );

  return (
    <section ref={ref} className="hero">
      <h1 className="hero-name">
        <span className="hero-line">
          <ScrambleText text="Percy" duration={1.3} delay={0.3} onHover={false} />
        </span>
        <span className="hero-line">
          <ScrambleText text="Nguyen" duration={1.4} delay={0.42} onHover={false} />
        </span>
      </h1>
      <div className="hero-foot">
        <p className="hero-sub">Illustrator, Business owner, Teacher</p>
        <p className="hero-cue" aria-hidden="true">Scroll</p>
      </div>
    </section>
  );
}

const indexOf = (slug) => galleryAll.findIndex((a) => a.slug === slug);

/** Rows of the gallery. As each row scrolls past it slides sideways, alternating direction. */
function GalleryRows({ rows, offset = 0 }) {
  const ref = useRef(null);
  useGsapContext(
    ({ motion, desktop }) => {
      // Desktop only: on phones each piece is full width, so sliding would push it off screen.
      if (!motion || !desktop) return;
      gsap.utils.toArray('.row:not(.row-bleed)', ref.current).forEach((row, i) => {
        const dir = (i + offset) % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          row,
          { xPercent: 9 * dir },
          { xPercent: -9 * dir, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 1 } }
        );
      });
    },
    [],
    ref
  );

  return (
    <div ref={ref} className="gallery">
      {rows.map((row, r) => {
        const items = row.items.map(art);
        const total = items.reduce((s, a) => s + a.ratio, 0);
        const revealSet = row.reveal === true ? row.items : row.reveal || [];
        return (
          <div key={r} className={row.kind === 'bleed' ? 'row row-bleed' : 'row container'}>
            {items.map((a) => (
              <Artwork
                key={a.slug}
                item={a}
                group={galleryAll}
                index={indexOf(a.slug)}
                reveal={revealSet.includes(a.slug)}
                sizes={row.kind === 'bleed' ? '100vw' : `(max-width: 700px) 100vw, ${Math.round((100 * a.ratio) / total)}vw`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

const inkRows = [inktober.slice(0, Math.ceil(inktober.length / 2)), inktober.slice(Math.ceil(inktober.length / 2))];

export default function Home() {
  return (
    <>
      <Hero />

      <figure className="quote container">
        <RevealLines as="blockquote" className="quote-text">
          &ldquo;I would rather die of passion than boredom.&rdquo;
        </RevealLines>
        <figcaption className="quote-by">Vincent van Gogh</figcaption>
      </figure>

      <section className="work" aria-labelledby="work-title">
        <div className="section-head container">
          <RevealLines as="h2" id="work-title" className="section-title">
            Selected work
          </RevealLines>
          <p className="section-note">
            Some pieces are still under paper. Click one to wash it open, then click again to see it full size.
          </p>
        </div>
        <GalleryRows rows={galleryRows.slice(0, 2)} />
      </section>

      <CourseSection />

      <section className="work work-more" aria-label="More work">
        <GalleryRows rows={galleryRows.slice(2)} offset={1} />
      </section>

      <section className="characters-teaser" aria-labelledby="chars-title">
        <div className="section-head container">
          <RevealLines as="h2" id="chars-title" className="section-title">
            Characters
          </RevealLines>
          <p className="section-note">Nine character sheets for five characters. Keep scrolling to move through them.</p>
        </div>
        <HorizontalScroll label="Character sheets">
          {sheetsAll.map((s, i) => (
            <div className="hs-card" key={s.slug}>
              <Artwork item={s} group={sheetsAll} index={i} sizes="(min-width: 900px) 140vh, 92vw" caption={false} />
              <p className="hs-caption">
                <ScrambleText text={s.title} />
              </p>
            </div>
          ))}
          <div className="hs-card hs-end">
            <Link to="/characters" className="hs-end-link">
              <ScrambleText text="See every sheet" onView={false} />
            </Link>
          </div>
        </HorizontalScroll>
      </section>

      <section className="inktober" aria-labelledby="ink-title">
        <div className="section-head container">
          <RevealLines as="h2" id="ink-title" className="section-title">
            Inktober 2023
          </RevealLines>
          <p className="section-note">One drawing a day to the official October prompts, fast and loose in a single ink tone.</p>
        </div>
        <ScrollStrip
          label="Inktober 2023 drawings"
          rows={inkRows}
          renderItem={(item) => (
            <div className="strip-card" key={item.slug}>
              <Artwork item={item} group={inktober} index={inktober.indexOf(item)} sizes="(min-width: 900px) 24vw, 70vw" caption={false} />
              <p className="strip-caption">
                <span className="strip-day">{String(item.day).padStart(2, '0')}</span> {item.prompt}
              </p>
            </div>
          )}
        />
      </section>
    </>
  );
}
