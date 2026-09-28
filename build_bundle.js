const fs = require('fs');

const css = fs.readFileSync('./css/styles.css', 'utf-8');
const dataJs = fs.readFileSync('./js/data.js', 'utf-8');
const genJs = fs.readFileSync('./js/generator.js', 'utf-8');
const appJs = fs.readFileSync('./js/app.js', 'utf-8');
let html = fs.readFileSync('./index.html', 'utf-8');

// Replace external CSS link with inline <style>
html = html.replace(
  '<link rel="stylesheet" href="./css/styles.css">',
  `<style>\n${css}\n</style>`
);

// Replace external JS scripts with inline <script>
const scriptReplacement = `
  <!-- Embedded High-Performance Application Bundles (Guarantees 100% Zero-404 Hosting on GitHub Pages) -->
  <script>
${dataJs}
  </script>
  <script>
${genJs}
  </script>
  <script>
${appJs}
  </script>
`;

html = html.replace(
  /<script src="\.\/js\/data\.js"><\/script>[\s\S]*?<script src="\.\/js\/app\.js"><\/script>/,
  scriptReplacement.trim()
);

fs.writeFileSync('./index.html', html, 'utf-8');
console.log('✓ Successfully generated zero-dependency self-contained index.html');
