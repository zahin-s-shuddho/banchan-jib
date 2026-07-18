/* ══════════════════════════════════════════════════════════
   Banchan Jib — Photo Studio (local framing tool)
   Loads the pristine originals, lets you pan + zoom each photo,
   and writes the framed result back to the live site images.
   Non-destructive: always works from _orig_backup, so you can
   re-frame any time without quality loss.
   ══════════════════════════════════════════════════════════ */
(function () {
  const PRODUCTS = [
    { id: 'geotjeori',  name: 'Geotjeori Cup',       sub: 'Fresh Cabbage Kimchi' },
    { id: 'dangeun',    name: 'Dangeun Namul Cup',   sub: 'Seasoned Carrots' },
    { id: 'shigeumchi', name: 'Shigeumchi Namul Cup', sub: 'Seasoned Spinach' },
    { id: 'trio',       name: 'The Banchan Trio',    sub: '3-Cup Bundle Set' },
  ];
  const SRC = id => `/assets/img/_orig_backup/${id}.jpg`;
  const OUT_FULL = 1300, OUT_SM = 560;
  const DEFAULT_T = () => ({ scale: 1, panX: 0, panY: 0 });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* draw the framed image into a square context of side S */
  function drawFramed(ctx, img, S, t, bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
    const d = S * t.scale;
    const x = (S - d) / 2 + t.panX * S;
    const y = (S - d) / 2 + t.panY * S;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x, y, d, d);
  }

  function sampleBg(img) {
    const c = document.createElement('canvas'); c.width = c.height = 8;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, 8, 8);
    const d = x.getImageData(0, 0, 8, 8).data;
    // average the 4 corners
    const px = [[0, 0], [7, 0], [0, 7], [7, 7]].map(([a, b]) => (b * 8 + a) * 4);
    let r = 0, g = 0, bl = 0;
    px.forEach(i => { r += d[i]; g += d[i + 1]; bl += d[i + 2]; });
    return `rgb(${r / 4 | 0},${g / 4 | 0},${bl / 4 | 0})`;
  }

  async function loadCrops() {
    try { return await (await fetch('/studio/crops.json?b=' + Date.now())).json(); }
    catch { return {}; }
  }

  function makeCard(p, seed) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${p.name}</h2>
      <div class="sub">${p.sub} · <code>${p.id}.jpg</code></div>
      <div class="stage"><canvas></canvas></div>
      <div class="controls">
        <label>Zoom</label>
        <input type="range" class="zoom" min="0.6" max="2.6" step="0.005" value="${seed.scale}">
        <span class="zoomval">${(seed.scale * 100).toFixed(0)}%</span>
      </div>
      <div class="btnrow">
        <button class="btn-reset">Reset</button>
        <button class="btn-save">Save to site</button>
      </div>
      <div class="status"></div>
      <div class="legend">Solid circle = what shows on the site (round crop). Crosshair = center.</div>`;
    document.getElementById('grid').appendChild(card);

    const stage = card.querySelector('.stage');
    const canvas = card.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const zoom = card.querySelector('.zoom');
    const zoomval = card.querySelector('.zoomval');
    const status = card.querySelector('.status');

    let t = { ...DEFAULT_T(), ...seed };
    let img = null, bg = '#000';

    const DISP = 460;
    canvas.width = DISP; canvas.height = DISP;

    function render() {
      if (!img) return;
      drawFramed(ctx, img, DISP, t, bg);
      // overlays
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(DISP / 2, DISP / 2, DISP / 2 - 1, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,80,80,.9)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(DISP / 2, 0); ctx.lineTo(DISP / 2, DISP);
      ctx.moveTo(0, DISP / 2); ctx.lineTo(DISP, DISP / 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      [1 / 3, 2 / 3].forEach(f => {
        ctx.beginPath(); ctx.moveTo(DISP * f, 0); ctx.lineTo(DISP * f, DISP);
        ctx.moveTo(0, DISP * f); ctx.lineTo(DISP, DISP * f); ctx.stroke();
      });
      ctx.restore();
      zoomval.textContent = (t.scale * 100).toFixed(0) + '%';
      zoom.value = t.scale;
    }

    const im = new Image();
    im.onload = () => { img = im; bg = sampleBg(im); render(); };
    im.src = SRC(p.id);

    /* drag to pan */
    let drag = null;
    stage.addEventListener('pointerdown', e => {
      drag = { x: e.clientX, y: e.clientY, px: t.panX, py: t.panY };
      stage.classList.add('grabbing'); stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      t.panX = clamp(drag.px + (e.clientX - drag.x) / r.width, -0.6, 0.6);
      t.panY = clamp(drag.py + (e.clientY - drag.y) / r.height, -0.6, 0.6);
      render();
    });
    const endDrag = e => { drag = null; stage.classList.remove('grabbing'); try { stage.releasePointerCapture(e.pointerId); } catch {} };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* wheel to zoom */
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      t.scale = clamp(t.scale - e.deltaY * 0.0012, 0.6, 2.6);
      render();
    }, { passive: false });

    zoom.addEventListener('input', () => { t.scale = +zoom.value; render(); });
    card.querySelector('.btn-reset').addEventListener('click', () => { t = DEFAULT_T(); render(); status.textContent = ''; });

    card.querySelector('.btn-save').addEventListener('click', async () => {
      if (!img) return;
      status.className = 'status'; status.textContent = 'Saving…';
      try {
        const mk = S => { const c = document.createElement('canvas'); c.width = c.height = S; drawFramed(c.getContext('2d'), img, S, t, bg); return c.toDataURL('image/jpeg', S > 800 ? 0.9 : 0.82); };
        const r = await fetch('/studio/save', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, full: mk(OUT_FULL), sm: mk(OUT_SM), transform: t }),
        });
        if (!r.ok) throw new Error(await r.text());
        status.textContent = '✓ Saved to the site (' + new Date().toLocaleTimeString() + ')';
      } catch (err) {
        status.className = 'status err'; status.textContent = '✕ ' + err.message;
      }
    });

    return { save: () => card.querySelector('.btn-save').click() };
  }

  (async function init() {
    const crops = await loadCrops();
    const cards = PRODUCTS.map(p => makeCard(p, crops[p.id] || DEFAULT_T()));
    document.getElementById('save-all').addEventListener('click', () => cards.forEach(c => c.save()));
  })();
})();
