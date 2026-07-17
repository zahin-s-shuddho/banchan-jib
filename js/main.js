/* ══════════════════════════════════════════════════════════
   Banchan Jib — shared chrome, loader, transitions, motion
   ══════════════════════════════════════════════════════════ */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = window.BJ_SETTINGS;

  /* ───────────────────── doodle library ───────────────────── */
  const DOODLES = {
    cabbage: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 56c-13 0-22-9-22-20 0-13 10-24 22-24s22 11 22 24c0 11-9 20-22 20Z"/><path d="M32 12c-3 8-4 18-2 28M22 16c-2 8-1 18 2 26M42 16c2 8 1 18-2 26M14 28c4 3 10 4 18 4s14-1 18-4"/></svg>`,
    carrot: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M40 24 14 54c-2 2-5-1-3-3l26-30"/><path d="M40 24c4-4 10-5 13-2s2 9-2 13c-3 3-8 3-11-1s-3-7 0-10Z" transform="rotate(180 45 29)"/><path d="M42 22c1-6 5-10 10-11M44 24c4-4 9-6 14-5M40 20c-1-5 1-10 4-13"/></svg>`,
    chili: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 50C10 46 8 34 14 26c3-4 8-6 13-5 2-6 8-9 14-8-2 3-2 6-1 8 8 4 12 14 6 22-7 9-20 11-28 7Z"/><path d="M40 14c2-4 6-6 10-6M24 30c-2 4-2 9 1 12"/></svg>`,
    garlic: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 14c-2 6-8 9-12 14-5 6-4 16 3 20 5 3 13 3 18 0 7-4 8-14 3-20-4-5-10-8-12-14Z"/><path d="M32 14c0 12-1 24 0 34M26 24c-2 8-2 16 0 22M38 24c2 8 2 16 0 22M30 8c0-2 1-4 2-5 1 1 2 3 2 5"/></svg>`,
    bowl: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 30h44c0 12-8 22-22 22S10 42 10 30Z"/><path d="M20 52h24M26 56h12"/><path d="M22 22c-2-3 2-5 0-8M32 22c-2-3 2-5 0-8M42 22c-2-3 2-5 0-8"/></svg>`,
    chopsticks: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 30 58M32 6l4 52"/><path d="M14 20l38-6"/></svg>`,
    spinach: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 58V26"/><path d="M32 34c-8 0-16-6-16-16 8-2 16 2 16 10M32 26c0-10 8-16 18-14 0 10-8 16-18 16"/><path d="M26 46c-5 0-9-3-10-8 6-1 10 2 10 6M38 42c5-1 9-4 9-9-6 0-9 3-9 7"/></svg>`,
    sesame: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><ellipse cx="18" cy="20" rx="5" ry="8" transform="rotate(-20 18 20)"/><ellipse cx="42" cy="16" rx="5" ry="8" transform="rotate(15 42 16)"/><ellipse cx="30" cy="40" rx="5" ry="8" transform="rotate(-8 30 40)"/><ellipse cx="50" cy="44" rx="5" ry="8" transform="rotate(25 50 44)"/><ellipse cx="14" cy="48" rx="5" ry="8" transform="rotate(-30 14 48)"/></svg>`,
    cup: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 22h32l-4 32c0 2-2 4-4 4H24c-2 0-4-2-4-4l-4-32Z"/><path d="M14 22c6-3 30-3 36 0M24 30c2 3 6 4 8 2s6-1 8 2"/></svg>`,
    heart: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 52C18 42 10 34 10 24c0-6 5-11 11-11 5 0 9 3 11 7 2-4 6-7 11-7 6 0 11 5 11 11 0 10-8 18-22 28Z"/><path d="M24 24c2-2 5-2 7 0"/></svg>`,
    steamrice: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 34c0-8 9-14 20-14s20 6 20 14H12Z"/><path d="M12 34h40c0 10-9 18-20 18s-20-8-20-18Z"/><path d="M26 14c-2-3 2-5 0-8M38 14c-2-3 2-5 0-8"/></svg>`,
  };
  window.BJ_DOODLES = DOODLES;

  const cartIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1.5 12.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 8Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>`;
  const igIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>`;
  const fbIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3h-3a5 5 0 0 0-5 5v3H6v4h3v9h4v-9h3l1-4h-4V8a1 1 0 0 1 1-1h3Z"/></svg>`;
  window.BJ_SOCIAL_ICONS = { ig: igIcon, fb: fbIcon };

  /* ───────────────────── loader (immediately) ───────────────────── */
  const seen = sessionStorage.getItem('bj_seen');
  const loader = document.createElement('div');
  loader.id = 'bj-loader';
  loader.innerHTML = `
    <div class="loader-bowl">${window.Halmeoni ? window.Halmeoni.svg('wave') : DOODLES.steamrice}</div>
    <div class="loader-word" aria-hidden="true"></div>
    <div class="loader-sub">setting the table…</div>`;
  document.addEventListener('DOMContentLoaded', () => document.body.prepend(loader));

  /* curtain for page exits */
  const curtain = document.createElement('div');
  curtain.id = 'bj-curtain';
  curtain.innerHTML = `<span class="kr-serif">잘 먹겠습니다</span>`;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(curtain));

  /* ───────────────────── shared chrome ───────────────────── */
  function buildNav() {
    const path = location.pathname;
    const active = (p) => (p === '/' ? path === '/' || path.endsWith('/index.html') : path.startsWith(p)) ? 'class="active"' : '';
    const nav = document.createElement('header');
    nav.className = 'nav';
    nav.innerHTML = `
      <div class="nav-inner">
        <a href="/" class="nav-logo" aria-label="Banchan Jib home">
          <img src="/assets/logo/icon.svg" alt="">
          <span class="word">Banchan Jib<small>반찬집</small></span>
        </a>
        <nav aria-label="Main">
          <ul class="nav-links" id="nav-links">
            <li><a href="/" ${active('/')}>Home<span class="kr-tip">집</span></a></li>
            <li><a href="/menu.html" ${active('/menu')}>Menu<span class="kr-tip">반찬</span></a></li>
            <li><a href="/about.html" ${active('/about')}>Our Story<span class="kr-tip">정</span></a></li>
            <li><a href="/order.html" ${active('/order')}>Order<span class="kr-tip">주문</span></a></li>
          </ul>
        </nav>
        <div style="display:flex;gap:.5rem;align-items:center">
          <button class="cart-btn" data-cart-open aria-label="Open your basket">
            ${cartIcon}<span>Basket</span><span class="cart-count" aria-hidden="true">0</span>
          </button>
          <button class="nav-burger" aria-label="Menu" aria-expanded="false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>`;
    document.body.prepend(nav);

    const burger = nav.querySelector('.nav-burger');
    const links = nav.querySelector('.nav-links');
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    links.addEventListener('click', () => links.classList.remove('open'));

    let lastY = 0;
    addEventListener('scroll', () => {
      const y = scrollY;
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hidden', y > 300 && y > lastY && !links.classList.contains('open'));
      lastY = y;
    }, { passive: true });
  }

  function buildDrawer() {
    const veil = document.createElement('div');
    veil.className = 'drawer-veil';
    const drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', 'Your basket');
    drawer.innerHTML = `
      <div class="cart-head">
        <h3><span class="kr">바구니</span>Your Basket</h3>
        <button class="cart-close" data-cart-close aria-label="Close basket">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <div class="cart-items"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>This week's batch</span><span class="amt" data-cart-total>BDT 0</span></div>
        <a href="/order.html" class="btn btn-primary">Reserve your batch →</a>
      </div>`;
    document.body.append(veil, drawer);
    veil.addEventListener('click', BJCart.close);
    document.addEventListener('click', e => {
      if (e.target.closest('[data-cart-open]')) BJCart.open();
      if (e.target.closest('[data-cart-close]')) BJCart.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') BJCart.close(); });
  }

  function buildFooter() {
    const f = document.createElement('footer');
    f.className = 'footer';
    f.innerHTML = `
      <div class="footer-game container">
        <span class="kr">할머니의 밥상</span>
        <h2>Fill Grandma's Table</h2>
        <p>Catch the falling banchan in your bowl — she hates seeing food go to waste.</p>
      </div>
      <div class="game-shell">
        <canvas id="bj-game" width="760" height="380" aria-label="Catch the banchan mini game"></canvas>
        <div class="game-hud"><span id="game-score">Servings: 0</span><span id="game-best"></span></div>
        <div class="game-overlay" id="game-overlay">
          <div class="halmeoni-inline" id="game-halmeoni" data-halmeoni="wave" style="width:88px" aria-hidden="true"></div>
          <h3>Catch the Banchan!</h3>
          <p>Move your mouse (or finger) to slide the bowl. Catch dishes to fill the table — drop three and dinner's over.</p>
          <span class="btn btn-primary">Set the table →</span>
        </div>
      </div>
      <div class="container">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="fb-logo">
              <img src="/assets/logo/icon.svg" alt="">
              <span class="word">Banchan Jib<small>반찬집</small></span>
            </div>
            <p>${S.tagline}. Homemade Korean side dishes, made with care in Bangladesh.</p>
            <div class="social-row">
              <a href="https://instagram.com/${S.instagram}" target="_blank" rel="noopener" aria-label="Banchan Jib on Instagram">${igIcon}</a>
              <a href="https://facebook.com/${S.facebook}" target="_blank" rel="noopener" aria-label="Banchan Jib on Facebook">${fbIcon}</a>
            </div>
          </div>
          <div>
            <h4>The Table</h4>
            <ul>
              <li><a href="/menu.html">This week's menu</a></li>
              <li><a href="/products/geotjeori.html">Geotjeori · 겉절이</a></li>
              <li><a href="/products/dangeun-namul.html">Seasoned Carrots · 당근나물</a></li>
              <li><a href="/products/shigeumchi-namul.html">Seasoned Spinach · 시금치나물</a></li>
              <li><a href="/products/banchan-trio.html">The Banchan Trio</a></li>
            </ul>
          </div>
          <div>
            <h4>The House</h4>
            <ul>
              <li><a href="/about.html">Our story</a></li>
              <li><a href="/order.html">How to order</a></li>
              <li><a href="${S.instagramDm}" target="_blank" rel="noopener" class="social-link">${igIcon}Instagram — DM to order</a></li>
              <li><a href="${S.facebookDm}" target="_blank" rel="noopener" class="social-link">${fbIcon}Facebook — DM to order</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Banchan Jib — made with 정 (jeong)</span>
          <span>맛있게 드세요 · eat deliciously</span>
        </div>
      </div>
      <div class="footer-wordmark" aria-hidden="true">반찬집</div>`;
    document.body.appendChild(f);
  }

  /* ───────────────────── doodle sprinkling ───────────────────── */
  function sprinkleDoodles() {
    const names = Object.keys(DOODLES);
    document.querySelectorAll('[data-doodles]').forEach((sec, si) => {
      const n = +sec.dataset.doodles || 3;
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        const name = names[(si * 3 + i * 5 + 2) % names.length];
        d.className = 'doodle ' + (i % 3 === 0 ? 'sage' : i % 3 === 1 ? '' : 'kimchi');
        d.innerHTML = DOODLES[name];
        const left = i % 2 === 0;
        d.style.cssText += `top:${12 + ((si * 17 + i * 31) % 70)}%;${left ? 'left' : 'right'}:${2 + ((si * 7 + i * 13) % 6)}%;transform:rotate(${-14 + ((si * 11 + i * 23) % 30)}deg)`;
        d.dataset.float = (0.4 + (i % 3) * 0.25).toFixed(2);
        sec.appendChild(d);
      }
    });
  }

  /* ───────────────────── shared dish card ───────────────────── */
  window.BJ_dishCard = function (p) {
    return `
      <article class="dish-card">
        <span class="dish-kr" aria-hidden="true">${p.kr}</span>
        <span class="price-chip">BDT ${p.price}</span>
        <a href="/products/${p.slug}.html" class="dish-img-wrap" aria-label="${p.name} — ${p.sub}">
          <img src="${p.imgSm}" alt="${p.name} (${p.sub}) on a white plate" loading="lazy" width="420" height="420">
        </a>
        <h3>${p.name}</h3>
        <p class="dish-sub">${p.sub}</p>
        <p class="desc">${p.short}</p>
        <div class="dish-actions">
          <a class="btn btn-outline" href="/products/${p.slug}.html">The story</a>
          <button class="btn btn-primary" data-add="${p.id}">Add to basket</button>
        </div>
      </article>`;
  };

  /* ───────────────────── static Halmeoni placements ─────────────────────
     exposed globally since some pages (product.js) inject [data-halmeoni]
     elements dynamically, after this first pass has already run */
  function fillHalmeoniInlines() {
    if (!window.Halmeoni) return;
    document.querySelectorAll('[data-halmeoni]').forEach(el => {
      el.innerHTML = Halmeoni.svg(el.dataset.halmeoni || 'happy');
    });
  }
  window.BJ_fillHalmeoni = fillHalmeoniInlines;

  /* ───────────────────── toast ───────────────────── */
  window.BJToast = function (msg, kr) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.innerHTML = `${kr ? `<span class="kr">${kr}</span>` : ''}<span>${msg}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 600); }, 3400);
  };

  /* ───────────────────── add-to-cart + fly animation ───────────────────── */
  function bindAddButtons() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const id = btn.dataset.add;
      const qty = +(document.querySelector(btn.dataset.qtyFrom)?.textContent || 1);
      BJCart.add(id, qty);
      const p = window.BJ_BY_ID[id];
      BJToast(`${p.name} tucked into your basket. Eat well, okay?`, '담았어요!');

      /* fly the dish to the basket */
      const target = document.querySelector('.cart-btn');
      const imgSrc = p.imgSm;
      if (!target || REDUCED || !window.gsap) return;
      const from = btn.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const dot = document.createElement('div');
      dot.className = 'fly-dot';
      dot.innerHTML = `<img src="${imgSrc}" alt="">`;
      dot.style.left = from.left + from.width / 2 - 26 + 'px';
      dot.style.top = from.top - 26 + 'px';
      document.body.appendChild(dot);
      gsap.to(dot, {
        left: to.left + to.width / 2 - 26,
        top: to.top,
        scale: 0.25,
        rotation: 340,
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => { dot.remove(); BJCart.bump(); },
      });
    });
  }

  /* ───────────────────── ribbons ───────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bj-marquee { to { transform: translateX(-50%); } }
    .ribbon-track { animation: bj-marquee var(--dur,26s) linear infinite; }
    .ribbon[data-reverse] .ribbon-track { animation-direction: reverse; }
    @media (prefers-reduced-motion: reduce) { .ribbon-track { animation: none; } }`;
  document.head.appendChild(style);

  function buildRibbons() {
    document.querySelectorAll('.ribbon[data-items]').forEach(r => {
      const items = r.dataset.items.split('|');
      const chunk = items.map(it => {
        const isKr = /[ㄱ-힝]/.test(it);
        return `<span class="${isKr ? 'kr' : ''}">${it}</span><span class="dot"></span>`;
      }).join('');
      // two identical halves → seamless -50% loop
      const half = `<div class="ribbon-chunk">${chunk.repeat(3)}</div>`;
      r.innerHTML = `<div class="ribbon-track" aria-hidden="true">${half}${half}</div>`;
    });
  }

  /* ───────────────────── motion (GSAP) ───────────────────── */
  function initMotion() {
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);

    /* reveal-ups */
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const children = el.dataset.reveal === 'stagger' ? el.children : [el];
      gsap.from(children, {
        y: 46, opacity: 0, duration: 0.9, ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 82%' },
      });
    });

    /* floating doodles */
    document.querySelectorAll('.doodle').forEach(d => {
      const amt = +(d.dataset.float || 0.5);
      gsap.to(d, {
        y: () => -34 * amt, rotation: '+=8',
        scrollTrigger: { trigger: d.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      });
      gsap.to(d, { y: '+=10', duration: 2.4 + amt * 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });

    /* 3D tilt cards */
    if (!REDUCED && matchMedia('(pointer:fine)').matches) {
      document.querySelectorAll('.dish-card, [data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
          gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 800, duration: 0.4, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
        });
      });
    }

    /* magnetic buttons */
    if (!REDUCED && matchMedia('(pointer:fine)').matches) {
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }));
      });
    }

    document.dispatchEvent(new CustomEvent('bj:motion-ready'));
  }

  /* ───────────────────── loader + reveal choreography ───────────────────── */
  function playLoader() {
    const page = document.querySelector('.page');
    const words = ['반찬', '정성', '집', '밥 한 끼'];
    const wordEl = loader.querySelector('.loader-word');
    const dur = seen ? 900 : 2100;
    sessionStorage.setItem('bj_seen', '1');

    let wi = 0;
    wordEl.textContent = words[0];
    const cycle = setInterval(() => { wordEl.textContent = words[++wi % words.length]; }, 420);

    const bowl = loader.querySelector('.loader-bowl svg, .loader-bowl img');
    if (window.gsap && !REDUCED) {
      gsap.to(bowl, { y: -8, duration: 0.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to(loader.querySelector('.loader-bowl'), { rotation: 4, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }

    setTimeout(() => {
      clearInterval(cycle);
      loader.classList.add('done');
      if (window.gsap && !REDUCED) {
        gsap.to(loader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut', onComplete: () => loader.remove() });
        if (page) {
          gsap.set(page, { opacity: 1 });
          gsap.from(page, { y: 30, opacity: 0, duration: 0.9, delay: 0.25, ease: 'power3.out', clearProps: 'transform' });
        }
      } else {
        loader.remove();
        if (page) page.style.opacity = 1;
      }
      document.dispatchEvent(new CustomEvent('bj:revealed'));
    }, dur);
  }

  /* page-exit curtain on internal links */
  function bindTransitions() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; // same-page anchor
      e.preventDefault();
      BJCart.close();
      if (window.gsap && !REDUCED) {
        const kr = curtain.querySelector('.kr-serif');
        gsap.timeline()
          .set(curtain, { yPercent: 101 })
          .to(curtain, { yPercent: 0, duration: 0.55, ease: 'power4.inOut' })
          .to(kr, { opacity: 1, duration: 0.25 }, '-=0.2')
          .add(() => { location.href = url.href; }, '+=0.1');
      } else {
        location.href = url.href;
      }
    });
  }

  /* ───────────────────── boot ───────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    buildDrawer();
    buildFooter();
    buildRibbons();
    sprinkleDoodles();
    fillHalmeoniInlines();
    BJCart.render();
    bindAddButtons();
    bindTransitions();
    initMotion();
    playLoader();
    if (window.BJGame) BJGame.init();
  });
})();
