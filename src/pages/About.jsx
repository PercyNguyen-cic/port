import { RevealLines } from '../components/motion/RevealLines';
import { ScrambleText } from '../components/motion/ScrambleText';
import { Artwork } from '../components/Artwork';
import { art, course, links } from '../data/works';

const portrait = art('about-portrait');

export default function About() {
  return (
    <section className="about container">
      <div className="about-copy">
        <RevealLines as="h1" className="page-title" immediate>
          About
        </RevealLines>
        <RevealLines as="p" className="about-lede" immediate delay={0.2}>
          I&rsquo;m Percy (Phong) Nguyen, a professional illustrator and splash artist, and I run my own art business.
        </RevealLines>
        <div className="prose">
          <p>I study UI/UX and Multimedia Design at Carleton University. My work centres on characters: loud colour, strong silhouettes, and figures caught mid-moment.</p>
          <p>
            I also teach other artists how to market and sell their work in my course,{' '}
            <a href={course.url} target="_blank" rel="noopener">{course.title}</a>.
          </p>
        </div>
        <dl className="contact-list">
          <dt>Email</dt>
          <dd><a href={`mailto:${links.email}`}><ScrambleText text={links.email} onView={false} duration={0.6} /></a></dd>
          <dt>Phone</dt>
          <dd><a href={links.phoneHref}>{links.phone}</a></dd>
          <dt>Instagram</dt>
          <dd><a href={links.instagram} target="_blank" rel="noopener">@ponka_pone</a></dd>
          <dt>TikTok</dt>
          <dd><a href={links.tiktok} target="_blank" rel="noopener">@ponka.pone</a></dd>
          <dt>LinkedIn</dt>
          <dd><a href={links.linkedin} target="_blank" rel="noopener">Phong Nguyen Vu Tuan</a></dd>
        </dl>
      </div>
      <div className="about-art">
        <Artwork item={portrait} sizes="(min-width: 900px) 40vw, 100vw" eager caption={false} />
      </div>
    </section>
  );
}
