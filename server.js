// Banchan Jib — tiny static server
// run: node server.js  →  http://localhost:4907
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4907;
const ROOT = __dirname;

/* ── Photo Studio ──────────────────────────────────────────────
   A local-only tool for manually re-framing the product photos.
   Flip this to false to make it completely disappear (the page,
   its assets, and the save endpoint all 404). Files stay on disk
   but are unreachable — flip back to true to bring it back. */
const STUDIO_ENABLED = true;

const STUDIO_IMAGES = {
  geotjeori:  { full: 'assets/img/geotjeori.jpg',  sm: 'assets/img/geotjeori-sm.jpg' },
  dangeun:    { full: 'assets/img/dangeun.jpg',    sm: 'assets/img/dangeun-sm.jpg' },
  shigeumchi: { full: 'assets/img/shigeumchi.jpg', sm: 'assets/img/shigeumchi-sm.jpg' },
  trio:       { full: 'assets/img/trio.jpg',       sm: 'assets/img/trio-sm.jpg' },
};

function handleStudioSave(req, res) {
  let body = '';
  req.on('data', c => { body += c; if (body.length > 30 * 1024 * 1024) req.destroy(); });
  req.on('end', () => {
    try {
      const { id, full, sm, transform } = JSON.parse(body);
      const target = STUDIO_IMAGES[id];
      if (!target) { res.writeHead(400); return res.end('unknown image'); }
      const toBuf = dataUrl => Buffer.from(String(dataUrl).split(',')[1], 'base64');
      fs.writeFileSync(path.join(ROOT, target.full), toBuf(full));
      fs.writeFileSync(path.join(ROOT, target.sm), toBuf(sm));
      /* persist the framing so re-opening the tool resumes where you left off */
      const cropsPath = path.join(ROOT, 'studio', 'crops.json');
      let crops = {};
      try { crops = JSON.parse(fs.readFileSync(cropsPath, 'utf8')); } catch {}
      if (transform) crops[id] = transform;
      fs.writeFileSync(cropsPath, JSON.stringify(crops, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, id }));
    } catch (e) {
      res.writeHead(500); res.end('save failed: ' + e.message);
    }
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  const rawPath = decodeURIComponent(req.url.split('?')[0]);

  /* studio routes — entirely gated behind STUDIO_ENABLED */
  if (rawPath === '/studio' || rawPath.startsWith('/studio/')) {
    if (!STUDIO_ENABLED) { res.writeHead(404); return res.end('not found'); }
    if (req.method === 'POST' && rawPath === '/studio/save') return handleStudioSave(req, res);
  }

  let urlPath = rawPath;
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  let filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (!path.extname(filePath)) filePath += '.html';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 — this dish is not on the menu');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`반찬집 serving warm at http://localhost:${PORT}`));
