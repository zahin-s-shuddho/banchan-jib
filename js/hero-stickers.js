/* ══════════════════════════════════════════════════════════
   Hero food stickers — peel-off draggable plates.
   They stay INSIDE the hero section: peeling switches them to
   absolute positioning within it (never fixed, so they scroll
   away with the section instead of sticking to the viewport),
   and dragging is clamped to the section's bounds.
   ══════════════════════════════════════════════════════════ */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function makeDraggable(el) {
    /* .hero-plates is inset:0 inside .hero, so coordinates relative to it
       are also coordinates within the hero section */
    const zone = el.parentElement;
    let dragging = false, moved = false, peeled = false;
    let startPX = 0, startPY = 0, startL = 0, startT = 0;

    /* clamp a target (left, top) so the plate stays inside the section */
    function bounds() {
      const zr = zone.getBoundingClientRect();
      const w = el.offsetWidth, h = el.offsetHeight;
      return { maxX: Math.max(0, zr.width - w), maxY: Math.max(0, zr.height - h) };
    }

    function peel() {
      if (peeled) return;
      peeled = true;
      el.classList.add('peeled');
      if (window.gsap) gsap.killTweensOf(el);
      const r = el.getBoundingClientRect();
      const zr = zone.getBoundingClientRect();
      el.style.position = 'absolute';
      el.style.left = (r.left - zr.left) + 'px';
      el.style.top = (r.top - zr.top) + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
      if (window.gsap) gsap.set(el, { clearProps: 'transform,opacity,x,y,xPercent,rotation' });
      el.style.margin = '0';
    }

    function moveTo(x, y) {
      const b = bounds();
      el.style.left = clamp(x, 0, b.maxX) + 'px';
      el.style.top = clamp(y, 0, b.maxY) + 'px';
    }

    el.addEventListener('pointerdown', e => {
      if (e.button && e.button !== 0) return;
      dragging = true; moved = false;
      try { el.setPointerCapture(e.pointerId); } catch {}
      peel();
      startPX = e.clientX; startPY = e.clientY;
      startL = parseFloat(el.style.left) || 0;
      startT = parseFloat(el.style.top) || 0;
      el.classList.add('dragging');
      if (window.gsap && !REDUCED) {
        gsap.to(el, { scale: 1.08, duration: .22, ease: 'power2.out' });
      }
    });

    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startPX, dy = e.clientY - startPY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      moveTo(startL + dx, startT + dy);
      if (window.gsap && !REDUCED) {
        gsap.to(el, { rotation: clamp(dx * 0.1, -22, 22), duration: .15 });
      }
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (window.gsap && !REDUCED) {
        const rest = moved ? (Math.random() * 16 - 8) : 0;
        gsap.to(el, { scale: 1, rotation: rest, duration: .7, ease: 'elastic.out(1,0.45)' });
      } else {
        el.style.transform = '';
      }
      if (moved && window.Halmeoni && window.Halmeoni.setGlobalMood) {
        window.Halmeoni.setGlobalMood('angry', { reason: "Aigoo! You're messing up my table — please put that back where it belongs." });
      }
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    /* if the viewport resizes, re-clamp any peeled plate so it can't be
       stranded outside the section's new dimensions */
    addEventListener('resize', () => {
      if (!peeled) return;
      moveTo(parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0);
    });

    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'img');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'A side dish sticker — drag to move it around the table.');
    el.addEventListener('keydown', e => {
      const step = 24;
      const arrowMap = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (arrowMap[e.key]) {
        e.preventDefault();
        peel();
        moveTo((parseFloat(el.style.left) || 0) + arrowMap[e.key][0], (parseFloat(el.style.top) || 0) + arrowMap[e.key][1]);
      }
    });
  }

  function init() {
    document.querySelectorAll('.hero-plate').forEach(makeDraggable);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
