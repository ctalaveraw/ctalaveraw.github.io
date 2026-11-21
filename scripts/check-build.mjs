import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const path = (file) => resolve(root, file);

const homepage = readFileSync(path('dist/index.html'), 'utf8');
const notesPagePath = path('dist/lab-notes/index.html');
const notesPage = existsSync(notesPagePath) ? readFileSync(notesPagePath, 'utf8') : '';

const required = {
  'Homepage generated': existsSync(path('dist/index.html')),
  '404 page generated': existsSync(path('dist/404.html')),
  'Lab notes index generated': existsSync(notesPagePath),
  'Home lab notes preview': homepage.includes('id="lab-notes"'),
  'Home lab notes navigation': homepage.includes('lab-notes.md'),
  'First lab note linked': homepage.includes('/lab-notes/#2026-10-09-kubernetes-rollout'),
  'Second lab note linked': homepage.includes('/lab-notes/#2026-10-03-r5c-storage'),
  'Kubernetes recovery notes rendered': notesPage.includes('10 of 10'),
  'R5C storage incident rendered': notesPage.includes('sectors'),
  'Recorded verification status': notesPage.includes('Verified'),
  'Unresolved incident status': notesPage.includes('Investigated'),
  'Kubernetes incident source linked': notesPage.includes(
    'https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/incidents/2026-10-09-platform-hello-failed-rollout.md',
  ),
  'R5C incident source linked': notesPage.includes(
    'https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/incidents/2026-10-03-usb-storage.md',
  ),
  'Favicon generated': existsSync(path('dist/favicon.svg')),
  'Correct portfolio identity': homepage.includes('Christian Talavera'),
  'Current AWS support role': homepage.includes('Infrastructure Support Engineer'),
  'Archival storage responsibilities': homepage.includes('archival-storage'),
  'ML engineering certification': homepage.includes('Machine Learning Engineer'),
  'AAS degree awarded': homepage.includes('Degree awarded 2026'),
  'WGU program shown': homepage.includes('Western Governors University'),
  'WGU expected graduation shown': homepage.includes('Expected May 2027'),
  'Experience work type': homepage.includes('work_type'),
  'ARM64 project present': homepage.includes('ARM64 Platform Lab'),
  'Architecture view present': homepage.includes('Architecture.md'),
  'Forgejo mirror documented': homepage.includes('Forgejo mirror'),
  'Recorded checks shown': homepage.includes('Recorded checks'),
  'Authority boundary shown': homepage.includes('Authority boundary'),
  'Flux source path documented': homepage.includes('Desired state'),
  'OpenWrt projects present': homepage.includes('OpenWrt'),
  'Repository evidence action': homepage.includes('View repository'),
  'Merged PR evidence action': homepage.includes('View merged PR'),
  'Tmux session indicator': homepage.includes('0:portfolio*'),
  'Theme status indicator': homepage.includes('id="status-theme"'),
  'Footer console control': homepage.includes('id="open-portfolio-terminal-status"'),
  'MokerLink PR linked': homepage.includes('https://github.com/openwrt/openwrt/pull/25193'),
  'GoodTop PR linked': homepage.includes('https://github.com/openwrt/openwrt/pull/25391'),
  'Portfolio repository linked': homepage.includes(
    'https://github.com/ctalaveraw/ctalaveraw.github.io',
  ),
  'Original domain removed': !existsSync(path('public/CNAME')),
};

const prohibited = [
  'Python Backend Developer',
  'hophnidev@gmail.com',
  'Tashkent, Uzbekistan',
  'stitch-crash',
  'superior-series',
];

for (const text of prohibited) {
  required[`No template content: ${text}`] = !homepage.includes(text);
}

let failures = 0;

for (const [name, passed] of Object.entries(required)) {
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${name}`);
  if (!passed) failures++;
}

assert.equal(failures, 0, `${failures} static output checks failed`);

console.log(`PASS: ${Object.keys(required).length} output checks`);
