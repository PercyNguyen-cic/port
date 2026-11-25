import { RevealLines } from '../components/motion/RevealLines';
import { ScrambleText } from '../components/motion/ScrambleText';
import { Artwork } from '../components/Artwork';
import { characters, sheetsAll } from '../data/works';
import { useLenis } from '../providers/SmoothScroll';

export default function Characters() {
  const lenis = useLenis();
  const jump = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView();
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <>
      <section className="page-head container">
        <RevealLines as="h1" className="page-title" immediate>
          Characters
        </RevealLines>
        <p className="page-lede">
          Turnarounds, outfits, poses and expressions for Alexander, Icarus, Kaida, Vera and Zhongshu. Click any sheet to read it
          at full resolution.
        </p>
        <ul className="char-index" aria-label="Jump to a character">
          {characters.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} onClick={(e) => jump(e, c.id)}>
                <ScrambleText text={c.name} />
                <span className="char-count">{c.sheets.length === 1 ? '1 sheet' : `${c.sheets.length} sheets`}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {characters.map((c) => (
        <section key={c.id} id={c.id} className="char container" aria-label={c.name}>
          <div className="char-name">
            <ScrambleText as="h2" text={c.name} className="char-name-text" duration={1} />
          </div>
          <div className="char-sheets">
            {c.art.map((a) => {
              const item = sheetsAll.find((s) => s.slug === a.slug);
              return (
                <Artwork
                  key={a.slug}
                  item={item}
                  group={sheetsAll}
                  index={sheetsAll.indexOf(item)}
                  sizes="(min-width: 900px) 85vw, 100vw"
                  caption={false}
                />
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
