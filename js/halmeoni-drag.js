/* ══════════════════════════════════════════════════════════
   Halmeoni — draggable floating mascot + ambient reactions

   She reacts to what you do (mood changes silently, no popup).
   Clicking/tapping her never changes her mood — it just reveals
   *why* she's feeling that way, in a speech bubble, until you
   tap again or she reacts to something new.
   ══════════════════════════════════════════════════════════ */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function currentSize() { return matchMedia('(max-width: 640px)').matches ? 92 : 128; }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function mount() {
    if (!window.Halmeoni || document.getElementById('halmeoni-sticker')) return;

    const el = document.createElement('div');
    el.className = 'halmeoni-sticker';
    el.id = 'halmeoni-sticker';
    el.setAttribute('role', 'img');
    el.setAttribute('tabindex', '0');
    let SIZE = currentSize();
    el.style.width = SIZE + 'px';

    const bob = document.createElement('div');
    bob.className = 'halmeoni-bob';

    let mood = sessionStorage.getItem('bj_halmeoni_mood') || 'wave';
    if (!Halmeoni.allMoods.includes(mood)) mood = 'wave';
    let currentReason = Halmeoni.defaultReason[mood];
    bob.innerHTML = Halmeoni.svg(mood);
    el.appendChild(bob);

    /* first-visit "you can drag/tap her" hint */
    const hint = document.createElement('div');
    hint.className = 'halmeoni-hint';
    hint.innerHTML = `<span class="kr">눌러보세요!</span>drag me · tap to ask why`;
    el.appendChild(hint);

    /* the reason bubble — hidden until tapped */
    const reasonBubble = document.createElement('div');
    reasonBubble.className = 'halmeoni-reason';
    reasonBubble.setAttribute('role', 'status');
    reasonBubble.setAttribute('aria-live', 'polite');
    el.appendChild(reasonBubble);

    el.setAttribute('aria-label', `Halmeoni, the Banchan Jib grandma. Press Enter to hear why she's feeling this way, or drag her around.`);
    document.body.appendChild(el);

    /* position resets to her home corner on every page load — dragging is a
       per-page game, not persisted, so she never lands on top of page content
       that differs from the page she was last dragged around on */
    function place(x, y) {
      const w = el.offsetWidth || SIZE, h = el.offsetHeight || SIZE;
      x = clamp(x, 8, innerWidth - w - 8);
      y = clamp(y, 70, innerHeight - h - 8);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
    }
    function goHome() { place(innerWidth - SIZE - 26, innerHeight - SIZE - 34); }
    goHome();

    /* only a real drag counts as "moved on purpose" — until then, any
       resize/orientation change should re-anchor her to the corner fresh,
       not just clamp her old (now possibly stale) coordinates */
    let userMoved = false;

    /* first-visit hint bubble */
    if (!localStorage.getItem('bj_halmeoni_intro_seen')) {
      setTimeout(() => hint.classList.add('show'), 1600);
      setTimeout(() => hint.classList.remove('show'), 6200);
      localStorage.setItem('bj_halmeoni_intro_seen', '1');
    }

    /* ── mood control ──
       every mood change is silent (no popup) — the reason is just stored,
       revealed only when the user taps her. Nothing here persists across
       pages except the very last mood, so she never looks "stuck." */
    function setMood(next, opts = {}) {
      const { bounce = true, reason } = opts;
      const changed = mood !== next;
      mood = next;
      currentReason = reason || Halmeoni.defaultReason[mood] || '';
      bob.innerHTML = Halmeoni.svg(mood);
      sessionStorage.setItem('bj_halmeoni_mood', mood);
      el.setAttribute('aria-label', `Halmeoni, the Banchan Jib grandma. Press Enter to hear why she's feeling this way, or drag her around.`);
      if (changed && bounce && window.gsap && !REDUCED) {
        gsap.fromTo(bob, { scale: 0.7, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1,0.45)' });
      }
      /* a stale reason showing next to a now-different face is confusing —
         close the bubble so the user re-taps for the current one */
      if (changed) reasonBubble.classList.remove('show');
    }
    /* fire a chain of ambient reactions — sequence is [[mood, reason], ...] */
    function react(sequence, gap = 1100) {
      sequence.forEach(([m, reason], i) => setTimeout(() => setMood(m, { reason }), i * gap));
    }

    let reasonHideT;
    function toggleReason() {
      const showing = reasonBubble.classList.contains('show');
      hint.classList.remove('show');
      clearTimeout(reasonHideT);
      if (showing) { reasonBubble.classList.remove('show'); return; }
      reasonBubble.innerHTML = `<span class="kr">${Halmeoni.moodLabel[mood]?.split('·')[0]?.trim() || ''}</span>${currentReason}`;
      /* bubble opens on whichever side of her has more room (normally her
         left, since she lives bottom-right), and never grows wider than
         that side can fit — so it's always fully on screen */
      const r = el.getBoundingClientRect();
      const spaceLeft = r.left - 22;
      const spaceRight = innerWidth - r.right - 22;
      const flip = spaceRight > spaceLeft;
      reasonBubble.classList.toggle('flip-right', flip);
      reasonBubble.style.maxWidth = Math.max(120, Math.min(260, flip ? spaceRight : spaceLeft)) + 'px';
      reasonBubble.classList.add('show');
      reasonHideT = setTimeout(() => reasonBubble.classList.remove('show'), 6000);
    }

    /* ── drag ── */
    let dragging = false, moved = false;
    let startPX = 0, startPY = 0, startL = 0, startT = 0;

    el.addEventListener('pointerdown', e => {
      if (e.button && e.button !== 0) return;
      dragging = true; moved = false;
      el.classList.add('dragging');
      hint.classList.remove('show');
      try { el.setPointerCapture(e.pointerId); } catch {}
      const r = el.getBoundingClientRect();
      startPX = e.clientX; startPY = e.clientY;
      startL = r.left; startT = r.top;
    });

    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startPX, dy = e.clientY - startPY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { moved = true; userMoved = true; }
      place(startL + dx, startT + dy);
      if (window.gsap && !REDUCED) {
        gsap.to(el, { rotation: clamp(dx * 0.12, -18, 18), duration: 0.15 });
      }
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (window.gsap && !REDUCED) {
        gsap.to(el, { rotation: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' });
        gsap.fromTo(bob, { scaleY: 0.82, scaleX: 1.1 }, { scaleY: 1, scaleX: 1, duration: 0.55, ease: 'elastic.out(1,0.35)' });
      } else {
        el.style.transform = '';
      }
      if (!moved) toggleReason();
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReason(); }
    });

    /* screen size / orientation changes: if she's still in her default
       corner spot, re-anchor fresh to the (new) corner rather than just
       clamping her old coordinates — otherwise a portrait→landscape flip
       can strand her in the middle of the screen. If she's been dragged
       on purpose, just keep her clamped where she is. */
    let resizeT;
    function onViewportChange() {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        SIZE = currentSize();
        el.style.width = SIZE + 'px';
        if (userMoved) {
          const r = el.getBoundingClientRect();
          place(r.left, r.top);
        } else {
          goHome();
        }
      }, 120);
    }
    addEventListener('resize', onViewportChange);
    addEventListener('orientationchange', onViewportChange);

    window.Halmeoni.setGlobalMood = setMood;
    window.Halmeoni.react = react;

    /* ── ambient reactions — she notices what you're doing ──
       one big prioritized map, most-specific selector first. Hovering
       almost anything interactive gets a contextual little reaction. */
    const react_ = (m, reason) => setMood(m, { reason });
    const NAV_MOOD = {
      '/menu.html': ['serving', 'Come, let me show you what\'s fresh today.'],
      '/order.html': ['delivering', 'Getting ready to send your order out!'],
      '/about.html': ['wave', 'Let me tell you a little about our kitchen.'],
    };
    const HOVER_MAP = [
      ['[data-add]', 'proud', "Good choice — that's one of my favorites."],
      ['.qty button[data-q="1"]', 'excited', 'More banchan? Now we\'re talking!'],
      ['.qty button[data-q="-1"]', 'sad', "Taking a little off? Okay, if that's what you'd like."],
      ['#btn-ig', 'wave', 'Come say hello on Instagram!'],
      ['#btn-fb', 'excited', 'Almost ready to send this off!'],
      ['.cart-foot .btn-primary', 'delivering', "Let's get your order on its way."],
      ['.hero-plate', 'excited', 'Careful with that — but go on, have a closer look!'],
      ['.dish-img-wrap', 'serving', 'Fresh out of the kitchen, just for you.'],
      ['.dish-card .btn-outline', 'idea', 'Curious? Let me tell you the story behind this one.'],
      ['.flip', 'idea', "There's more to it than you'd think — go on, take a peek."],
      ['#weeks-batch', 'excited', 'This is the best part — picking what\'s freshest this week!'],
      ['.social-row a, a.social-link', 'wave', 'Come find us online!'],
      ['.nav-logo', 'wave', 'Welcome back to Banchan Jib.'],
      ['.cart-btn', 'happy', "Ooh, checking your basket? Let's see what you've picked."],
      ['.footer-main a[href="/order.html"]', 'delivering', "Let's get your order on its way."],
      ['.footer-main a[href="/about.html"]', 'wave', 'Let me tell you a little about our kitchen.'],
      ['.footer-main a[href^="/products/"], .footer-main a[href="/menu.html"]', 'serving', 'Fresh out of the kitchen, just for you.'],
      ['.btn-primary', 'happy', "Go on, I think you'll like this."],
      ['.btn-sage', 'serving', "There's more where that came from."],
      ['.btn-outline', 'idea', 'Want to know more? Go ahead.'],
    ];

    /* the basket is special: unhovering it makes her sad, and — unlike
       everything else — plain scrolling will NOT clear that sadness.
       only hovering the basket or the menu again does. */
    let basketSadLock = false;
    document.addEventListener('mouseover', e => {
      for (const [sel, m, reason] of HOVER_MAP) {
        if (e.target.closest(sel)) {
          if (sel === '.cart-btn' || sel.includes('menu.html')) basketSadLock = false;
          return react_(m, reason);
        }
      }
    });
    document.querySelector('.cart-btn')?.addEventListener('mouseleave', () => {
      basketSadLock = true;
      react_('sad', "Aw, walking away already? Don't forget what's waiting for you.");
    });
    document.querySelectorAll('.nav-links a[href]').forEach(a => {
      const path = new URL(a.href, location.href).pathname;
      const entry = NAV_MOOD[path];
      if (entry) a.addEventListener('mouseenter', () => {
        if (path === '/menu.html') basketSadLock = false;
        react_(entry[0], entry[1]);
      });
    });

    /* mouse darting off the top of the page (toward the tab/window close
       controls) reads as "are you leaving?" — she gets worried, then sad */
    if (matchMedia('(pointer:fine)').matches) {
      let exitCooldown = false;
      document.addEventListener('mouseleave', e => {
        if (e.clientY > 0 || exitCooldown) return;
        exitCooldown = true;
        react([
          ['worried', 'Wait, are you leaving already?'],
          ['sad', 'Oh... I hope you come back soon.'],
        ]);
        setTimeout(() => { exitCooldown = false; }, 8000);
      });
    }

    /* reaching the footer settles her down */
    let footerIntersecting = false;
    const footer = document.querySelector('.footer');
    if (footer && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          footerIntersecting = entry.isIntersecting;
          if (entry.isIntersecting) react_('serious', "Let's get back to looking at the food so I can cook.");
        });
      }, { threshold: 0.15 });
      io.observe(footer);
    }

    /* plain scrolling, with nothing else going on, is just idle browsing —
       she defaults to a friendly hello, UNLESS the basket-sad state is
       locked in, or she's already settled into "serious" at the footer */
    let scrollT;
    addEventListener('scroll', () => {
      clearTimeout(scrollT);
      scrollT = setTimeout(() => {
        if (basketSadLock || footerIntersecting || mood === 'wave') return;
        react_('wave', 'Just keeping you company while you browse.');
      }, 220);
    }, { passive: true });

    /* generic scroll-into-view reactions for any section on any page —
       <section data-halmeoni-onview="idea" data-halmeoni-reason="..."> */
    if ('IntersectionObserver' in window) {
      const onviewIO = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) react_(entry.target.dataset.halmeoniOnview, entry.target.dataset.halmeoniReason);
        });
      }, { threshold: 0.3 });
      document.querySelectorAll('[data-halmeoni-onview]').forEach(el => onviewIO.observe(el));
    }
  }

  document.addEventListener('bj:revealed', mount, { once: true });
  /* fallback in case loader/revealed event doesn't fire (e.g. reduced motion edge cases) */
  setTimeout(mount, 2600);
})();
