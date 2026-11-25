import { useState } from 'react';
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
const shapes = ['shape-crowned', 'shape-rabbit', 'shape-sailor', 'shape-lizard'].map(art);

const FACES = [
  { id: 3, answer: 'pugnacious' },
  { id: 1, answer: 'cute' },
  { id: 4, answer: 'goofy' },
  { id: 2, answer: 'screwball' },
];
const ZONES = [
  { key: 'cute', label: 'Cute' },
  { key: 'screwball', label: 'Screwball' },
  { key: 'pugnacious', label: 'Pugnacious' },
  { key: 'goofy', label: 'Goofy' },
];

function Quiz() {
  const [placed, setPlaced] = useState({}); // zone key -> face id
  const [selected, setSelected] = useState(null);
  const [wrong, setWrong] = useState(null);
  const [message, setMessage] = useState('');
  const matched = Object.keys(placed).length;

  const attempt = (faceId, zoneKey) => {
    const face = FACES.find((f) => f.id === faceId);
    if (!face || placed[zoneKey]) return;
    if (face.answer === zoneKey) {
      const next = { ...placed, [zoneKey]: faceId };
      setPlaced(next);
      setSelected(null);
      setMessage(Object.keys(next).length === ZONES.length ? 'All four read correctly.' : `Correct: ${ZONES.find((z) => z.key === zoneKey).label}.`);
    } else {
      setWrong(zoneKey);
      setTimeout(() => setWrong(null), 500);
      setMessage(`Not ${ZONES.find((z) => z.key === zoneKey).label}. Try another.`);
    }
  };
  const used = new Set(Object.values(placed));

  return (
    <section className="quiz container" aria-labelledby="quiz-title">
      <div className="quiz-head">
        <RevealLines as="h2" id="quiz-title" className="section-title">
          Read the character
        </RevealLines>
        <p className="section-note">
          Match each face to the personality its shapes suggest. Drag it onto a box, or tap a face and then a box.
        </p>
      </div>
      <div className="faces">
        {FACES.filter((f) => !used.has(f.id)).map((f) => (
          <button
            key={f.id}
            type="button"
            className="face"
            draggable
            aria-pressed={selected === f.id}
            aria-label={`Face ${f.id}`}
            onClick={() => setSelected(selected === f.id ? null : f.id)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(f.id));
              setSelected(f.id);
            }}
          >
            <img src={`/media/full/face-${f.id}.jpg`} alt="" width="200" height="200" />
          </button>
        ))}
      </div>
      <div className="zones">
        {ZONES.map((z) => (
          <button
            key={z.key}
            type="button"
            className={`zone${placed[z.key] ? ' is-done' : ''}${wrong === z.key ? ' is-wrong' : ''}${selected && !placed[z.key] ? ' is-target' : ''}`}
            aria-disabled={!!placed[z.key]}
            onClick={() => selected && attempt(selected, z.key)}
            onDragOver={(e) => !placed[z.key] && e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              attempt(Number(e.dataTransfer.getData('text/plain')), z.key);
            }}
          >
            {placed[z.key] && <img src={`/media/full/face-${placed[z.key]}.jpg`} alt="" />}
            <span className="zone-label">{z.label}</span>
          </button>
        ))}
      </div>
      <div className="quiz-actions">
        <p className="quiz-status">
          {matched} of {ZONES.length} matched
        </p>
        <button type="button" className="button button-quiet" onClick={() => { setPlaced(Object.fromEntries(FACES.map((f) => [f.answer, f.id]))); setMessage('Answers revealed.'); }}>
          Show answers
        </button>
        <button type="button" className="button button-quiet" onClick={() => { setPlaced({}); setSelected(null); setMessage('Quiz reset.'); }}>
          Start over
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{message}</p>
    </section>
  );
}

export default function Process() {
  return (
    <>
      <section className="page-head container">
        <RevealLines as="h1" className="page-title" immediate>
          Process
        </RevealLines>
        <p className="page-lede">How a character gets made, from the first loose sketch to the finished piece, and how shape alone can tell you who someone is.</p>
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

      <section className="shapes" aria-labelledby="shape-title">
        <div className="section-head container">
          <RevealLines as="h2" id="shape-title" className="section-title">
            Shape language
          </RevealLines>
          <p className="section-note">
            Each of these characters was designed so you could guess their temperament before knowing anything about them. Rounded
            shapes, sharp angles, posture and palette do the talking.
          </p>
        </div>
        <div className="row container">
          {shapes.slice(0, 2).map((a, i) => (
            <Artwork key={a.slug} item={a} group={shapes} index={i} sizes="(max-width: 700px) 100vw, 50vw" caption={false} />
          ))}
        </div>
        <div className="row container">
          {shapes.slice(2).map((a, i) => (
            <Artwork key={a.slug} item={a} group={shapes} index={i + 2} sizes="(max-width: 700px) 100vw, 50vw" caption={false} />
          ))}
        </div>
      </section>

      <Quiz />
    </>
  );
}
