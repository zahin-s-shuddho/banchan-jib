/* Banchan Jib — product page renderer + choreography */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('main[data-product]');
    if (!root) return;
    const p = window.BJ_BY_ID[root.dataset.product];
    if (!p) return;

    /* ── hero ── */
    document.getElementById('pd-root').innerHTML = `
      <div class="halmeoni-inline" data-halmeoni="serving" style="position:absolute;top:56px;right:max(1vw,8px);width:min(108px,15vw);z-index:2" aria-hidden="true"></div>
      <div class="plate-stage">
        <div>
          <div class="plate-3d" data-plate>
            <img src="${p.img}" alt="${p.name} (${p.sub}) served on a white plate" width="880" height="880">
            <div class="shine"></div>
          </div>
          <div class="plate-shadow" style="margin-inline:auto"></div>
        </div>
      </div>
      <div class="pd-info">
        <span class="kr-serif">${p.kr}</span><span class="kr-read">${p.krRead}</span>
        <h1>${p.name}</h1>
        <p class="pd-sub">${p.sub}</p>
        <p class="pd-price">BDT ${p.price} <small>/ cup${p.id === 'trio' ? ' set' : ''}</small></p>
        <p class="pd-story">${p.story}</p>
        <div class="pd-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="qty-row">
          <div class="qty" aria-label="Quantity">
            <button type="button" data-q="-1" aria-label="One less">−</button>
            <span class="q" id="pd-qty">1</span>
            <button type="button" data-q="1" aria-label="One more">+</button>
          </div>
          <button class="btn btn-primary" data-add="${p.id}" data-qty-from="#pd-qty">Add to basket · 담기</button>
        </div>
        <div class="meter-block" id="pd-meters">
          ${['spice', 'crunch', 'garlic'].map(k => `
            <div class="meter-row">
              <label>${k === 'spice' ? '매운맛 Spice' : k === 'crunch' ? '아삭함 Crunch' : '마늘 Garlic'}</label>
              <div class="meter-dots" role="img" aria-label="${k} level ${p.meter[k]} of 5">
                ${[1, 2, 3, 4, 5].map(i => `<i class="${i <= p.meter[k] ? 'on' + (k !== 'spice' ? ' sage-dot' : '') : ''}"></i>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
    window.BJ_fillHalmeoni && window.BJ_fillHalmeoni();

    /* ── extras ── */
    document.getElementById('pd-extra').innerHTML = `
      <div class="pd-panel" data-reveal>
        <h3>Pairs well with</h3>
        <ul>${p.pairs.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="pd-panel" data-reveal>
        <h3>Keeping it fresh</h3>
        <ul><li>${p.keeps}</li><li>Comes in a sealed, fridge-ready cup.</li></ul>
        <div class="granny-says"><b>할머니 says</b>“${p.granny}”</div>
      </div>`;

    /* ── related ── */
    const others = window.BJ_PRODUCTS.filter(x => x.id !== p.id);
    document.getElementById('pd-related').innerHTML = others.map(window.BJ_dishCard).join('');

    /* ── qty stepper ── */
    const qEl = document.getElementById('pd-qty');
    document.getElementById('pd-root').addEventListener('click', e => {
      const b = e.target.closest('[data-q]');
      if (!b) return;
      qEl.textContent = Math.max(1, Math.min(20, +qEl.textContent + +b.dataset.q));
    });

    /* ── plate 3D tilt + slow spin ── */
    const plate = document.querySelector('[data-plate]');
    if (window.gsap && !REDUCED) {
      gsap.to(plate.querySelector('img'), { rotation: 360, duration: 70, repeat: -1, ease: 'none' });
      if (matchMedia('(pointer:fine)').matches) {
        const stage = document.querySelector('.plate-stage');
        stage.addEventListener('mousemove', e => {
          const r = stage.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -16;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 16;
          gsap.to(plate, { rotateX: rx, rotateY: ry, duration: 0.5, ease: 'power2.out' });
        });
        stage.addEventListener('mouseleave', () => gsap.to(plate, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,0.4)' }));
      }
      /* entrance */
      document.addEventListener('bj:revealed', () => {
        gsap.from(plate, { scale: 0.4, rotation: -30, opacity: 0, duration: 1.2, ease: 'elastic.out(1,0.5)' });
        gsap.from('.pd-info > *', { y: 34, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', delay: 0.2 });
      }, { once: true });
      /* meter dots pop in on scroll */
      gsap.from('#pd-meters .meter-dots i', {
        scale: 0, stagger: 0.04, duration: 0.5, ease: 'back.out(2.5)',
        scrollTrigger: { trigger: '#pd-meters', start: 'top 88%' },
      });
      /* bg korean word parallax */
      gsap.to('.bg-kr', { yPercent: 26, scrollTrigger: { trigger: '.product-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    }
  });
})();
