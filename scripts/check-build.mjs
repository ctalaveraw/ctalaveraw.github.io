import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const path = (file) => resolve(root, file);

const homepage = readFileSync(path('dist/index.html'), 'utf8');

const required = {
  'Homepage generated': existsSync(path('dist/index.html')),
  '404 page generated': existsSync(path('dist/404.html')),
  'Favicon generated': existsSync(path('dist/favicon.svg')),
  'Correct portfolio identity': homepage.includes('Christian Talavera'),
  'ARM64 project present': homepage.includes('ARM64 Platform Lab'),
  'OpenWrt projects present': homepage.includes('OpenWrt'),
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
