import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ScrambleText } from './motion/ScrambleText';
import { RevealLines } from './motion/RevealLines';
import { Artwork } from './Artwork';
import { course, links } from '../data/works';

const NAV = [
  { to: '/', label: 'Work', end: true },
  { to: '/characters', label: 'Characters' },
  { to: '/process', label: 'Process' },
  { to: '/#course', label: 'Course' },
  { to: '/about', label: 'About' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Percy Nguyen, home">
        Percy Nguyen
      </Link>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav id="site-nav" className="site-nav" aria-label="Main">
        <ul>
          {NAV.map((n) => (
            <li key={n.label}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) => (isActive && !(n.to === '/' && hash === '#course') && !(n.to === '/#course' && hash !== '#course') ? 'is-active' : '')}
              >
                <ScrambleText text={n.label} onView={false} duration={0.5} />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function CourseSection() {
  return (
    <section id="course" className="course container" aria-labelledby="course-title">
      <div className="course-media">
        <Artwork item={course.thumb} sizes="(min-width: 900px) 50vw, 100vw" caption={false} />
      </div>
      <div className="course-copy">
        <p className="kicker">A course by Percy, for artists</p>
        <RevealLines as="h2" id="course-title" className="course-title">
          {course.title}
        </RevealLines>
        <p className="course-lede">
          Good art and posting every day aren&rsquo;t enough anymore, especially with AI images flooding every feed. This course
          teaches you to market and sell your work, not just make it.
        </p>
        <ul className="course-facts">
          <li>10 short video lessons, beginner-friendly</li>
          <li>How social media algorithms actually decide who sees your work</li>
          <li>Building an art business that you own</li>
        </ul>
        <a className="button" href={course.url} target="_blank" rel="noopener">
          <ScrambleText text="Get the course on Gumroad" onView={false} duration={0.6} />
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-name" aria-hidden="true">
          Percy Nguyen
        </p>
        <div className="footer-cols">
          <div>
            <h2 className="footer-h">Write to me</h2>
            <a className="footer-big" href={`mailto:${links.email}`}>
              {links.email}
            </a>
            <a href={links.phoneHref}>{links.phone}</a>
          </div>
          <div>
            <h2 className="footer-h">Follow</h2>
            <ul>
              <li><a href={links.instagram} target="_blank" rel="noopener">Instagram</a></li>
              <li><a href={links.tiktok} target="_blank" rel="noopener">TikTok</a></li>
              <li><a href={links.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>
            </ul>
          </div>
          <div>
            <h2 className="footer-h">Learn</h2>
            <a href={course.url} target="_blank" rel="noopener">{course.title}</a>
          </div>
        </div>
        <p className="footer-small">&copy; 2026 Percy Nguyen. All artwork &copy; the artist.</p>
      </div>
    </footer>
  );
}
