/* Banchan Jib — homepage choreography */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    /* inject week's batch cards */
    const track = document.querySelector('.week-track');
    if (track) track.insertAdjacentHTML('beforeend', window.BJ_PRODUCTS.map(window.BJ_dishCard).join(''));
  });

  document.addEventListener('bj:motion-ready', () => {
    if (!window.gsap) return;

    /* ── hero entrance ── */
    document.addEventListener('bj:revealed', () => {
      const lines = document.querySelectorAll('.hero-title .line');
      gsap.from(lines, { yPercent: 110, duration: 1, stagger: 0.14, ease: 'power4.out' });
      gsap.from('.hero-plate', {
        scale: 0, rotation: -20, duration: 1.1, stagger: 0.1, ease: 'elastic.out(1, 0.55)', delay: 0.25, clearProps: 'scale,rotation',
      });
      gsap.from('.hero-icon img', { scale: 0.6, rotation: 8, duration: 1, ease: 'elastic.out(1, 0.4)' });
    }, { once: true });

    /* ── steam wisps ── */
    if (!REDUCED) {
      document.querySelectorAll('.steam path').forEach((p, i) => {
        gsap.set(p, { strokeDasharray: 120, strokeDashoffset: 120 });
        gsap.timeline({ repeat: -1, delay: i * 1.1 })
          .to(p, { opacity: 0.7, strokeDashoffset: 0, duration: 2.2, ease: 'sine.inOut' })
          .to(p, { opacity: 0, y: -14, duration: 1.2, ease: 'sine.in' })
          .set(p, { strokeDashoffset: 120, y: 0 });
      });
    }

    /* ── hero mouse parallax ── */
    if (!REDUCED && matchMedia('(pointer:fine)').matches) {
      const hero = document.querySelector('.hero');
      const plates = document.querySelectorAll('.hero-plate');
      hero.addEventListener('mousemove', e => {
        const cx = (e.clientX / innerWidth - 0.5), cy = (e.clientY / innerHeight - 0.5);
        plates.forEach(pl => {
          if (pl.classList.contains('peeled')) return;
          const d = +pl.dataset.depth;
          gsap.to(pl, { x: cx * 46 * d, y: cy * 34 * d, rotation: cx * 6 * d, duration: 1, ease: 'power2.out' });
        });
        gsap.to('.hero-icon', { x: cx * -14, y: cy * -10, duration: 1 });
      });
    }

    /* ── plates drift out on scroll — one tween per plate, so peeling one
       (which kills its own tweens) never disturbs its sibling's tween ── */
    document.querySelectorAll('.hero-plate').forEach(pl => {
      const dir = pl.classList.contains('p1') || pl.classList.contains('p2') ? -60 : 60;
      gsap.to(pl, {
        xPercent: dir, opacity: 0,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: 0.8 },
      });
    });

    /* ── pinned horizontal week's batch (desktop only) ──
       on tablet/mobile the section is a plain native horizontal scroll-snap
       carousel, handled entirely by CSS (@media max-width:860px) — no JS
       needed there, which sidesteps the class of bugs where matchMedia
       can't auto-revert manual style mutations on breakpoint changes. */
    ScrollTrigger.matchMedia({
      '(min-width: 861px) and (prefers-reduced-motion: no-preference)': () => {
        const track = document.querySelector('.week-track');
        const stage = document.querySelector('.pin-stage');
        if (!track) return;
        const dist = () => track.scrollWidth - stage.clientWidth + 120;
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.pin-week', start: 'top top', end: () => '+=' + dist(),
            pin: true, scrub: 0.7, invalidateOnRefresh: true,
          },
        });
      },
    });

    /* ── letter unfold ── */
    const letter = document.querySelector('[data-letter]');
    if (letter) {
      gsap.from(letter, {
        rotateX: -68, opacity: 0, transformOrigin: 'top center', duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: letter, start: 'top 78%' },
      });
    }
  });
})();
