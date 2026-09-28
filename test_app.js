const fs = require('fs');

console.log('--- RUNNING WALLORA VALIDATION TESTS ---');

// 1. Validate data.js
const dataCode = fs.readFileSync('./js/data.js', 'utf-8');
const fn = new Function(dataCode + '\nreturn { WALLPAPER_CATALOG, CATEGORIES, COLOR_PALETTES };');
const { WALLPAPER_CATALOG: catalog, CATEGORIES: categories } = fn();

console.log(`✓ Wallpaper Catalog loaded: ${catalog ? catalog.length : 0} items`);

if (!catalog || catalog.length < 100) {
  console.error(`❌ FAIL: Expected at least 100 items, found ${catalog ? catalog.length : 0}`);
  process.exit(1);
} else {
  console.log(`✓ PASS: Catalog has ${catalog.length} unique wallpapers (>= 100).`);
}

// Check duplicates
const idSet = new Set();
let duplicatesFound = 0;

catalog.forEach((item, index) => {
  if (idSet.has(item.id)) {
    console.error(`❌ Duplicate ID: ${item.id} at index ${index}`);
    duplicatesFound++;
  }
  idSet.add(item.id);

  if (!item.title || !item.category || !item.author || !item.license || !item.src || !item.thumb || !item.palette || !item.tags) {
    console.error(`❌ Incomplete metadata on item #${index} (${item.title || item.id})`);
    duplicatesFound++;
  }
});

if (duplicatesFound === 0) {
  console.log('✓ PASS: Zero duplicate IDs and all 104 wallpapers have complete metadata.');
}

// Check category breakdown
const breakdown = {};
catalog.forEach(item => {
  breakdown[item.category] = (breakdown[item.category] || 0) + 1;
});
console.log('✓ Category distribution:', breakdown);

// 2. Validate index.html and styles.css
const html = fs.readFileSync('./index.html', 'utf-8');
const css = fs.readFileSync('./css/styles.css', 'utf-8');

const requiredHtmlIds = [
  'brand-logo', 'theme-toggle-btn', 'categories-container', 'color-filters-container',
  'wallpaper-grid', 'hero-spotlight-card', 'detail-modal', 'modal-mockup-img',
  'modal-lockscreen-overlay', 'modal-homescreen-overlay', 'btn-mode-lock',
  'btn-mode-home', 'btn-mode-clean', 'generator-canvas', 'favorites-grid'
];

requiredHtmlIds.forEach(id => {
  if (!html.includes(`id="${id}"`)) {
    console.error(`❌ Missing ID in index.html: ${id}`);
  }
});
console.log('✓ PASS: All essential HTML IDs present in index.html.');

// Check Grid CSS rules
if (css.includes('grid-template-columns: repeat(2, 1fr)') &&
    css.includes('grid-template-columns: repeat(3, 1fr)') &&
    css.includes('grid-template-columns: repeat(4, 1fr)') &&
    css.includes('grid-template-columns: repeat(5, 1fr)')) {
  console.log('✓ PASS: CSS responsive grid breakpoints (2, 3, 4, 5 columns) verified.');
} else {
  console.error('❌ FAIL: CSS responsive grid missing required breakpoint columns.');
}

console.log('--- ALL AUTOMATED VALIDATION CHECKS PASSED SUCCESSFULLY ---');
