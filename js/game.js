/* ══════════════════════════════════════════════════════════
   Fill Grandma's Table — footer mini-game
   Catch falling banchan in your bowl. Drop 3 and dinner's over.
   ══════════════════════════════════════════════════════════ */
(function () {
  const COLORS = { brown: '#5A3E2B', sage: '#7e8d63', kimchi: '#8b1400', sesame: '#c7b8a3' };

  function svgImage(name, color, size = 54) {
    const raw = window.BJ_DOODLES[name]
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
      .replaceAll('currentColor', color);
    const img = new Image(size, size);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(raw);
    return img;
  }

  const ITEM_DEFS = [
    { name: 'cabbage', color: COLORS.sage, points: 1 },
    { name: 'carrot', color: COLORS.kimchi, points: 1 },
    { name: 'spinach', color: COLORS.sage, points: 1 },
    { name: 'garlic', color: COLORS.brown, points: 1 },
    { name: 'cup', color: COLORS.brown, points: 2 },
    { name: 'chili', color: COLORS.kimchi, points: 3, spicy: true },
  ];

  const MILESTONES = {
    5: '아이고! Look at you go!',
    12: 'You’d make a fine kitchen helper.',
    20: 'Okay okay… dinner is READY.',
    35: 'Grandma is genuinely impressed.',
  };

  const GAME = {
    init() {
      const canvas = document.getElementById('bj-game');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const overlay = document.getElementById('game-overlay');
      const scoreEl = document.getElementById('game-score');
      const bestEl = document.getElementById('game-best');
      let W = canvas.width, H = canvas.height;

      /* the canvas spans the full width of its full-bleed shell — keep the
         drawing buffer matched to the actual rendered size so the game
         fills the whole band instead of being letterboxed/stretched */
      function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const newW = Math.round(rect.width), newH = Math.round(rect.height);
        if (!newW || !newH || (canvas.width === newW && canvas.height === newH)) return;
        canvas.width = newW; canvas.height = newH;
        W = newW; H = newH;
        if (bowl) bowl.x = Math.max(55, Math.min(W - 55, bowl.x));
      }

      const sprites = ITEM_DEFS.map(d => ({ ...d, img: svgImage(d.name, d.color) }));
      const bowlImg = svgImage('steamrice', COLORS.brown, 90);

      let best = +localStorage.getItem('bj_best') || 0;
      const showBest = () => { bestEl.textContent = best ? `Best table: ${best}` : ''; };
      showBest();

      let running = false, raf = null;
      /* declared before the first resizeCanvas() call — it reads `bowl`,
         and a let still in its temporal dead zone throws mid-init, which
         silently kills everything after it (including the start button) */
      let bowl, items, score, missed, spawnTimer, speed, msg, msgT, shake;

      resizeCanvas();
      let resizeT;
      addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(resizeCanvas, 150); });

      function reset() {
        bowl = { x: W / 2, w: 110, h: 60 };
        items = []; score = 0; missed = 0; spawnTimer = 0; speed = 1;
        msg = ''; msgT = 0; shake = 0;
        scoreEl.textContent = 'Servings: 0';
      }

      function spawn() {
        const def = sprites[Math.floor(Math.random() * sprites.length)];
        items.push({
          def, x: 40 + Math.random() * (W - 80), y: -40,
          vy: (1.4 + Math.random() * 1.1) * speed,
          rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.06,
          size: 44 + Math.random() * 14,
        });
      }

      function gameOver() {
        running = false;
        cancelAnimationFrame(raf);
        canvas.style.cursor = '';
        if (score > best) { best = score; localStorage.setItem('bj_best', best); showBest(); }
        const line = score >= 20 ? 'A feast! 잘 먹겠습니다!'
          : score >= 10 ? 'A good, honest dinner. Well done.'
          : 'Aigoo, we dropped a few… come back hungry.';
        const resultMood = score >= 20 ? 'proud' : score >= 10 ? 'happy' : score >= 4 ? 'worried' : 'sad';
        const face = overlay.querySelector('#game-halmeoni');
        if (face && window.Halmeoni) face.innerHTML = Halmeoni.svg(resultMood);
        overlay.querySelector('h3').textContent = `Table set: ${score} servings`;
        overlay.querySelector('p').textContent = line;
        overlay.querySelector('.btn').textContent = 'Set the table again →';
        overlay.classList.remove('hide');
      }

      function loop() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);

        /* table cloth stripes */
        ctx.save();
        if (shake > 0) { ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake *= 0.85; }
        ctx.fillStyle = 'rgba(168,182,154,.12)';
        for (let i = 0; i < W; i += 48) ctx.fillRect(i, 0, 24, H);

        /* spawn */
        spawnTimer -= 1;
        if (spawnTimer <= 0) {
          spawn();
          spawnTimer = Math.max(28, 70 - score * 1.6);
          speed = 1 + score * 0.03;
        }

        /* items */
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          it.y += it.vy; it.rot += it.vr;
          ctx.save();
          ctx.translate(it.x, it.y); ctx.rotate(it.rot);
          ctx.drawImage(it.def.img, -it.size / 2, -it.size / 2, it.size, it.size);
          ctx.restore();

          /* catch */
          const by = H - 64;
          if (it.y > by - 14 && it.y < by + 26 && Math.abs(it.x - bowl.x) < bowl.w / 2 + it.size * 0.25) {
            score += it.def.points;
            scoreEl.textContent = `Servings: ${score}`;
            if (it.def.spicy) {
              msg = '매워! Spicy bonus!'; msgT = 60;
              if (window.Halmeoni && window.Halmeoni.setGlobalMood) window.Halmeoni.setGlobalMood('surprised', { reason: 'Oh my, that one\'s got quite a kick!' });
            }
            if (MILESTONES[score]) { msg = MILESTONES[score]; msgT = 110; }
            items.splice(i, 1);
            continue;
          }
          /* miss */
          if (it.y > H + 30) {
            items.splice(i, 1);
            missed++;
            shake = 10;
            msg = missed >= 3 ? '' : ['Aigoo!', 'Careful now…', 'Last one, focus!'][missed - 1];
            msgT = 70;
            if (missed >= 3) return gameOver();
          }
        }

        /* bowl */
        const by = H - 64;
        ctx.save();
        ctx.translate(bowl.x, by);
        ctx.drawImage(bowlImg, -45, -20, 90, 90);
        ctx.restore();

        /* missed hearts */
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(W - 26 - i * 26, H - 22, 8, 0, Math.PI * 2);
          ctx.fillStyle = i < 3 - missed ? COLORS.kimchi : 'rgba(90,62,43,.18)';
          ctx.fill();
        }

        /* floating message */
        if (msgT > 0) {
          msgT--;
          ctx.font = '700 22px Quicksand, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = COLORS.brown;
          ctx.globalAlpha = Math.min(1, msgT / 25);
          ctx.fillText(msg, W / 2, 70);
          ctx.globalAlpha = 1;
        }
        ctx.restore();

        raf = requestAnimationFrame(loop);
      }

      /* controls */
      const toX = (clientX) => {
        const r = canvas.getBoundingClientRect();
        return ((clientX - r.left) / r.width) * W;
      };
      canvas.addEventListener('pointermove', e => { if (running) bowl.x = Math.max(55, Math.min(W - 55, toX(e.clientX))); });
      canvas.addEventListener('touchmove', e => {
        if (!running) return;
        e.preventDefault();
        bowl.x = Math.max(55, Math.min(W - 55, toX(e.touches[0].clientX)));
      }, { passive: false });
      addEventListener('keydown', e => {
        if (!running) return;
        if (e.key === 'ArrowLeft') bowl.x = Math.max(55, bowl.x - 34);
        if (e.key === 'ArrowRight') bowl.x = Math.min(W - 55, bowl.x + 34);
      });

      overlay.addEventListener('click', () => {
        resizeCanvas();
        reset();
        overlay.classList.add('hide');
        running = true;
        canvas.style.cursor = 'none';
        raf = requestAnimationFrame(loop);
      });
    },
  };

  window.BJGame = GAME;
})();
