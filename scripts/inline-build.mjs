// Folds the Vite build into a single self-contained HTML file.
//
// Needed because the game has to be shareable as one URL on hosts that serve a
// lone HTML document and block requests to any other origin or path. Since the
// game already ships no binary assets — audio is synthesized and every icon is
// inline SVG — the only external references are the built CSS and JS, so
// inlining those two makes the file completely standalone.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// <link rel="stylesheet" href="/assets/x.css"> -> <style>...</style>
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_m, href) => {
  const css = fs.readFileSync(path.join(dist, href.replace(/^\//, '')), 'utf8');
  return `<style>\n${css}\n</style>`;
});

// <script type="module" src="/assets/x.js"></script> -> <script type="module">...</script>
html = html.replace(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (_m, pre, src, post) => {
  const js = fs.readFileSync(path.join(dist, src.replace(/^\//, '')), 'utf8');
  const attrs = `${pre}${post}`.replace(/\s*crossorigin\s*/g, ' ').trim();
  // The bundle can contain "</script>" inside string literals, which would end
  // the tag early; splitting the sequence keeps it inert to the HTML parser.
  return `<script ${attrs}>\n${js.replace(/<\/script>/gi, '<\\/script>')}\n</script>`;
});

// The favicon is a separate file request, so drop the reference rather than
// leave a 404 in a page that is supposed to be self-contained.
html = html.replace(/<link rel="icon"[^>]*>/g, '');

const out = path.join(dist, 'bunkei-kitchen.html');
fs.writeFileSync(out, html, 'utf8');

// Second output for hosts that wrap the upload in their own document skeleton
// (they supply <html>/<head>/<body> themselves and reject a nested one). Same
// inlined payload, just the body's contents.
// Vite hoists the module script into <head>, so the style and script blocks are
// gathered from the whole document rather than from the body. The script is
// re-emitted last because main.ts queries #app as it executes, and a fragment
// has no parser-deferred <head> to rely on.
const bodyInner = html
  .replace(/[\s\S]*?<body[^>]*>/i, '')
  .replace(/<\/body>[\s\S]*/i, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style>[\s\S]*?<\/style>/gi, '');
const styles = [...html.matchAll(/<style>[\s\S]*?<\/style>/gi)].map((m) => m[0]).join('\n');
const scripts = [...html.matchAll(/<script[\s\S]*?<\/script>/gi)].map((m) => m[0]).join('\n');
const title = (html.match(/<title>([^<]*)<\/title>/) ?? [, '文型キッチン'])[1];
const fragment = `<title>${title}</title>\n${styles}\n${bodyInner.trim()}\n${scripts}\n`;
const fragmentOut = path.join(dist, 'bunkei-kitchen-embed.html');
fs.writeFileSync(fragmentOut, fragment, 'utf8');

// Also emitted as share/index.html: a static host serves index.html at the
// directory root, so the shared link is "example.com/" rather than
// "example.com/bunkei-kitchen.html". The folder holds exactly one file, which
// is all a self-contained build needs.
const shareDir = path.join(dist, 'share');
fs.mkdirSync(shareDir, { recursive: true });
const shareOut = path.join(shareDir, 'index.html');
fs.writeFileSync(shareOut, html, 'utf8');

for (const file of [out, fragmentOut, shareOut]) {
  const text = fs.readFileSync(file, 'utf8');
  const externalRefs = [...text.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith('data:') && !u.startsWith('#'));
  console.log(
    `${path.basename(file)}  ${(fs.statSync(file).size / 1024).toFixed(1)} kB  ` +
      `external refs: ${externalRefs.length ? externalRefs.join(', ') : 'none'}`,
  );
}
