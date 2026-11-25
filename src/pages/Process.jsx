import { RevealLines } from '../components/motion/RevealLines';
import { ScrambleText } from '../components/motion/ScrambleText';
import { Artwork } from '../components/Artwork';
import { art } from '../data/works';

const STEPS = [
  { n: '01', name: 'Sketch', slug: 'fawcas-sketch', text: 'Loose drawings and the few things I knew I wanted: the gauntlets and the fire. Nothing needs to be clean yet; the point is to get ideas moving.' },
  { n: '02', name: 'Design', slug: 'fawcas-design', text: 'The character takes shape. Head studies from several angles lock in his hair, features and expression. Some ideas stay, others get cut, and the palette is set.' },
  { n: '03', name: 'Story', slug: 'fawcas-story', text: 'I put him into short comic scenes to find out who he is. Strong or fragile, stubborn or persuasive, blunt or scheming: a few panels show it fast.' },
  { n: '04', name: 'Final', slug: 'fawcas-final', text: 'The finished piece.' },
];
const fawcas = STEPS.map((s) => ({ ...art(s.slug), title: `${s.n} ${s.name}`, note: 'Fawcas' }));

export default function Process() {
  return (
    <>
      <section className="page-head container">
        <RevealLines as="h1" className="page-title" immediate>
          Process
        </RevealLines>
        <p className="page-lede">How a character gets made, from the first loose sketch to the finished piece.</p>
      </section>

      <section className="fawcas container" aria-labelledby="fawcas-title">
        <div className="fawcas-intro">
          <div>
            <ScrambleText as="h2" text="Fawcas" className="fawcas-title" duration={1} />
            <p className="page-lede">Building an original character, step by step.</p>
          </div>
          <Artwork item={art('fawcas-banner')} sizes="(min-width: 900px) 55vw, 100vw" caption={false} className="art-cutout" />
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.n} className={`step${s.n === '04' ? ' step-final' : ''}`}>
              <div className="step-meta">
                <span className="step-num" aria-hidden="true">{s.n}</span>
                <h3 className="step-name">{s.name}</h3>
                <p>{s.text}</p>
              </div>
              <Artwork item={fawcas[i]} group={fawcas} index={i} sizes="(min-width: 900px) 60vw, 100vw" caption={false} />
            </li>
          ))}
        </ol>
      </section>

    </>
  );
}
