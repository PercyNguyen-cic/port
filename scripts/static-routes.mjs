// Neocities serves plain files, so each app route gets its own copy of index.html
// (dist/characters/index.html, ...). That way a direct visit or refresh on /characters works.
// not_found.html is Neocities' custom 404 page; serving the app there lets the router show its own "Not here" page.
import { copyFileSync, mkdirSync } from 'node:fs';

const routes = ['characters', 'process', 'about'];
for (const r of routes) {
  mkdirSync(`dist/${r}`, { recursive: true });
  copyFileSync('dist/index.html', `dist/${r}/index.html`);
}
copyFileSync('dist/index.html', 'dist/not_found.html');
console.log(`Static routes written: ${routes.join(', ')}, not_found.html`);
