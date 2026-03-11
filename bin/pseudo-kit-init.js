#!/usr/bin/env node
/**
 * pseudo-kit-init — project scaffold CLI
 *
 * Usage: npx pseudo-kit init [target-dir]
 *
 * Creates a minimal pseudo-kit project with:
 *   - index.html  — entry page with pseudo-kit-client loaded
 *   - components/ — empty folder for custom components
 *   - demo.html   — demo page showing a button-pk example
 *   - viewer.html — symlink/copy of pseudo-canvas-viewer.html hint
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const args = process.argv.slice(2);
if (args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: npx pseudo-kit init [target-dir]

Creates a minimal pseudo-html-kit project scaffold in [target-dir] (default: current directory).

Generated files:
  index.html          Entry page with pseudo-kit-client auto-loaded
  demo.html           Demo page showing button-pk, badge, and card components
  components/         Empty folder for your custom pseudo-html components
  package.json        Minimal package.json with pseudo-stack as dependency
`);
  process.exit(0);
}

const targetDir = resolve(args[0] || '.');

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

const PKG_VERSION = '0.5.1';

// ── Files to scaffold ────────────────────────────────────────────────────────

const files = {
  'package.json': JSON.stringify({
    name: targetDir.split('/').pop().split('\\').pop() || 'my-pseudo-kit-app',
    version: '0.1.0',
    type: 'module',
    scripts: {
      start: 'npx serve .',
    },
    dependencies: {
      'pseudo-stack': `^${PKG_VERSION}`,
    },
  }, null, 2) + '\n',

  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My pseudo-kit app</title>
  <script type="module">
    import PseudoKit from 'pseudo-stack/client';
    import { components } from 'pseudo-stack/assets';
    PseudoKit.registerAll(components);
    PseudoKit.init(document.body);
  </script>
</head>
<body>
  <h1>Hello pseudo-kit</h1>
  <button-pk variant="primary">Click me</button-pk>
</body>
</html>
`,

  'demo.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>pseudo-kit demo</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
    section { margin-bottom: 2rem; }
    h2 { font-size: 1rem; font-weight: 600; color: #64748b; margin: 0 0 .75rem; text-transform: uppercase; letter-spacing: .05em; }
  </style>
  <script type="module">
    import PseudoKit from 'pseudo-stack/client';
    import { components } from 'pseudo-stack/assets';
    PseudoKit.registerAll(components);
    PseudoKit.init(document.body);
  </script>
</head>
<body>
  <h1>pseudo-kit component demo</h1>

  <section>
    <h2>Buttons</h2>
    <button-pk>Default</button-pk>
    <button-pk variant="primary">Primary</button-pk>
    <button-pk variant="danger">Danger</button-pk>
  </section>

  <section>
    <h2>Badges</h2>
    <badge-pk>Default</badge-pk>
    <badge-pk variant="primary">Primary</badge-pk>
    <badge-pk variant="success">Success</badge-pk>
    <badge-pk variant="warning">Warning</badge-pk>
    <badge-pk variant="danger">Danger</badge-pk>
  </section>

  <section>
    <h2>Progress</h2>
    <progress-pk value="60" variant="primary" size="md"></progress-pk>
  </section>

  <section>
    <h2>Tabs</h2>
    <tabs-pk>
      <button slot="tabs" data-panel="t1">Tab 1</button>
      <button slot="tabs" data-panel="t2">Tab 2</button>
      <div slot="panels" id="t1"><p>Panel one content.</p></div>
      <div slot="panels" id="t2"><p>Panel two content.</p></div>
    </tabs-pk>
  </section>
</body>
</html>
`,
};

const componentsDirPath = join(targetDir, 'components');
if (!existsSync(componentsDirPath)) {
  mkdirSync(componentsDirPath, { recursive: true });
}

// ── Write files ──────────────────────────────────────────────────────────────

let created = 0;
let skipped = 0;

for (const [filename, content] of Object.entries(files)) {
  const filepath = join(targetDir, filename);
  if (existsSync(filepath)) {
    console.log(`  skip  ${filename} (already exists)`);
    skipped++;
  } else {
    writeFileSync(filepath, content, 'utf8');
    console.log(`  create ${filename}`);
    created++;
  }
}

console.log(`\n✅ pseudo-kit scaffold created in ${targetDir}`);
console.log(`   ${created} file(s) created, ${skipped} skipped`);
console.log('\nNext steps:');
console.log(`  cd ${args[0] || '.'}`);
console.log('  npm install');
console.log('  npx serve .');
console.log('\nOpen index.html or demo.html in your browser.');
