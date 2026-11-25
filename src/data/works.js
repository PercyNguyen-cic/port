import manifest from './manifest.json';

const ALT = {
  'skarra-duskmoor': 'Grey-skinned warrior with teal hair holding a greatsword, the name Skarra Duskmoor lettered vertically beside her.',
  'lineup-trio': 'Three characters side by side: a black ink-splattered figure, a red-haired figure in a golden coat, and a figure in baggy blue jeans.',
  'ghost-masks': 'Blond man with closed eyes in a purple coat, surrounded by pale ghost masks.',
  dainsleif: 'Dainsleif, loosely painted with a sweep of orange across a dark smear of paint.',
  'red-portrait': 'Portrait of a man painted entirely in reds, framed by black ink and vertical lettering.',
  'red-hat': 'Woman in a wide red hat and red jacket, smoking, painted in loose reds and creams.',
  'yellow-katana': 'Long-haired figure with long ears and a katana, in a dark green coat, against a diagonal yellow band.',
  'red-sun': 'Tall figure in flowing black robes carrying a long-haired figure with rabbit ears, against a red sun.',
  fox: 'Round orange fox-like creature with big green eyes curled up beside a snail.',
  'three-adventurers': 'Character sheet of three adventurers in full figure with bust portraits below, inside an ornamental frame.',
  lilac: 'Character with lilac hair, small horns and glasses, exhaling smoke against a blue circle.',
  'helmet-and-sword': 'A sword planted in a golden field beside an abandoned helmet, under a purple sky.',
  veiled: 'Figure hidden behind long grey hair, painted in muted greys and browns.',
  'misdemeanors-at-the-cult': 'Webtoon cover: a dark-haired young man in glasses holding a glass over a patterned blue background, titled Misdemeanors at the Cult!',
  tsurumi: 'Tsurumi from Golden Kamuy, seated in a brown coat, ink splattered around him beside lines of handwritten poetry.',
  'project-hail-mary': 'Three figures from Project Hail Mary as hear no evil, speak no evil, see no evil, each against a red circle.',
  'alexander-1': 'Alexander character sheet: full-figure poses, a heat-map colour study and line art, with his name lettered vertically.',
  'alexander-2': 'Alexander character sheet: a green-clad figure in action, small companion creatures and expression studies.',
  'icarus-1': 'Icarus character sheet: a lineup of outfits and poses with portrait studies.',
  'icarus-2': 'Icarus character sheet: painted portraits with golden wings and a framed card.',
  'kaida-1': 'Kaida character sheet: two dark-haired figures in red and black, one with a wide stitched grin, strung with pale skull beads.',
  'vera-1': 'Vera character sheet: white-haired figure in black and pink, with poses, weapon and expression studies.',
  'vera-2': 'Vera character sheet: gesture and pose studies in black, grey and pink.',
  'zhongshu-1': 'Zhongshu character sheet: a figure in red and black robes with a staff, shown in several poses.',
  'zhongshu-2': 'Zhongshu character sheet: red-toned panels of a red-haired figure surrounded by spirals.',
  'course-merchandise': 'Course thumbnail: How to Merchandise Your Art, with an illustrated red-haired character sitting on a suitcase.',
  'fawcas-banner': 'Fawcas, a dark-haired character in a sleeveless top, with fire bursting from both arms.',
  'fawcas-sketch': 'Page of loose pencil sketches exploring Fawcas: poses, faces, gauntlets and flames.',
  'fawcas-design': 'Five head studies of Fawcas from different angles, refining his hair and expression.',
  'fawcas-story': 'Rough comic panels testing Fawcas in short dramatic scenes.',
  'fawcas-final': 'Finished illustration of Fawcas standing in darkness with flames engulfing his arms.',
  'shape-crowned': 'Character sheet: a round, crowned creature with spectacles, annotated sketch beside the coloured version.',
  'shape-rabbit': 'Character sheet: a rabbit-eared figure in a green cap and headphones mid-leap, with an annotated gesture sketch.',
  'shape-sailor': 'Character sheet: a broad, bearded sailor with tiny legs, annotated sketch beside the coloured version.',
  'shape-lizard': 'Character sheet: a lanky lizard-like figure in a pink hoodie and beanie, annotated sketch beside the coloured version.',
};

const TITLE = {
  'skarra-duskmoor': ['Skarra Duskmoor'],
  dainsleif: ['Dainsleif'],
  'misdemeanors-at-the-cult': ['Misdemeanors at the Cult!', 'Webtoon cover'],
  tsurumi: ['Tsurumi', 'Golden Kamuy fan art'],
  'project-hail-mary': ['Project Hail Mary', 'Fan art'],
};

export function art(slug) {
  const m = manifest[slug];
  if (!m) throw new Error(`Unknown artwork: ${slug}`);
  const [title = '', note = ''] = TITLE[slug] || [];
  // Folders are named by target width; a file smaller than 960px lives in /960 at its own width.
  const srcset = m.sizes.map((w) => `/media/${w <= 960 ? 960 : w}/${slug}.webp ${w}w`);
  return {
    slug,
    ...m,
    ratio: m.w / m.h,
    title,
    note,
    alt: ALT[slug] || '',
    src: `/media/960/${slug}.webp`,
    srcset: srcset.join(', '),
    full: `/media/full/${slug}.${m.ext}`,
  };
}

/** Home gallery, in rows. `reveal` marks the wide pieces that sit under paper until clicked. */
export const galleryRows = [
  { kind: 'row', items: ['misdemeanors-at-the-cult', 'red-sun', 'tsurumi'] },
  { kind: 'bleed', items: ['project-hail-mary'], reveal: true },
  { kind: 'row', items: ['ghost-masks', 'red-hat'] },
  { kind: 'row', items: ['lineup-trio', 'skarra-duskmoor'], reveal: ['lineup-trio'] },
  { kind: 'row', items: ['yellow-katana', 'fox', 'lilac'] },
  { kind: 'row', items: ['helmet-and-sword', 'veiled'], reveal: ['helmet-and-sword'] },
  { kind: 'row', items: ['red-portrait', 'dainsleif', 'three-adventurers'] },
];
export const galleryAll = galleryRows.flatMap((r) => r.items).map(art);

export const characters = [
  { name: 'Alexander', sheets: ['alexander-1', 'alexander-2'] },
  { name: 'Icarus', sheets: ['icarus-1', 'icarus-2'] },
  { name: 'Kaida', sheets: ['kaida-1'] },
  { name: 'Vera', sheets: ['vera-1', 'vera-2'] },
  { name: 'Zhongshu', sheets: ['zhongshu-1', 'zhongshu-2'] },
].map((c) => ({ ...c, id: c.name.toLowerCase(), art: c.sheets.map(art) }));

export const sheetsAll = characters.flatMap((c) => c.art.map((a) => ({ ...a, title: c.name, note: 'Character sheet' })));

export const course = {
  title: 'How to Merchandise Your Art',
  url: 'https://cicadapriest.gumroad.com/l/ponka',
  thumb: art('course-merchandise'),
};

export const links = {
  email: 'tuanphongnv@gmail.com',
  phone: '+1 (343) 551-1864',
  phoneHref: 'tel:+13435511864',
  instagram: 'https://www.instagram.com/ponka_pone/',
  tiktok: 'https://www.tiktok.com/@ponka.pone',
  linkedin: 'https://www.linkedin.com/in/phong-nguyenvutuan-699a46356/',
};
