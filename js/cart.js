/* Banchan Jib — cart store + drawer */
(function () {
  const KEY = 'bj_cart_v1';

  const Cart = {
    read() {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
      catch { return {}; }
    },
    write(c) {
      localStorage.setItem(KEY, JSON.stringify(c));
      Cart.render();
    },
    add(id, qty = 1) {
      const c = Cart.read();
      c[id] = (c[id] || 0) + qty;
      Cart.write(c);
      Cart.bump();
    },
    setQty(id, qty) {
      const c = Cart.read();
      const removing = qty <= 0 && c[id] != null;
      if (qty <= 0) delete c[id]; else c[id] = qty;
      Cart.write(c);
      if (removing && window.Halmeoni && window.Halmeoni.setGlobalMood) {
        window.Halmeoni.setGlobalMood('worried', { reason: "Wait, you're taking that one out completely? I hope everything's alright." });
      }
    },
    clear() { Cart.write({}); },
    count() { return Object.values(Cart.read()).reduce((a, b) => a + b, 0); },
    total() {
      return Object.entries(Cart.read()).reduce((sum, [id, q]) => {
        const p = window.BJ_BY_ID[id];
        return p ? sum + p.price * q : sum;
      }, 0);
    },
    items() {
      return Object.entries(Cart.read())
        .map(([id, q]) => ({ ...window.BJ_BY_ID[id], qty: q }))
        .filter(p => p.id);
    },

    /* ── UI ── */
    bump() {
      const badge = document.querySelector('.cart-count');
      if (!badge) return;
      badge.classList.remove('pop');
      void badge.offsetWidth;
      badge.classList.add('pop');
    },
    render() {
      const n = Cart.count();
      const badge = document.querySelector('.cart-count');
      if (badge) {
        badge.textContent = n;
        badge.classList.toggle('show', n > 0);
      }
      const list = document.querySelector('.cart-items');
      if (list) {
        const items = Cart.items();
        if (!items.length) {
          const face = window.Halmeoni ? Halmeoni.svg('sad') : '';
          list.innerHTML = `<div class="cart-empty"><div class="halmeoni-inline" style="width:96px;margin:0 auto 1rem" aria-hidden="true">${face}</div>Your basket is empty for now.<br>Fresh batches are waiting on the menu.</div>`;
        } else {
          list.innerHTML = items.map(p => `
            <div class="cart-item" data-id="${p.id}">
              <img src="${p.imgSm}" alt="${p.name}">
              <div>
                <div class="ci-name">${p.name}</div>
                <div class="ci-price">BDT ${p.price} × ${p.qty} = <b>BDT ${p.price * p.qty}</b></div>
              </div>
              <div class="qty">
                <button type="button" data-dec aria-label="One less ${p.name}">−</button>
                <span class="q">${p.qty}</span>
                <button type="button" data-inc aria-label="One more ${p.name}">+</button>
              </div>
            </div>`).join('');
        }
      }
      const totalEl = document.querySelector('[data-cart-total]');
      if (totalEl) totalEl.textContent = `BDT ${Cart.total()}`;
      document.dispatchEvent(new CustomEvent('bj:cart', { detail: { count: n } }));
    },
    open() {
      document.querySelector('.cart-drawer')?.classList.add('open');
      document.querySelector('.drawer-veil')?.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (window.Halmeoni && window.Halmeoni.setGlobalMood) {
        window.Halmeoni.setGlobalMood(
          Cart.count() ? 'happy' : 'sad',
          { reason: Cart.count() ? "Good, you've got a nice little order started." : "Your basket's empty... let's fix that." }
        );
      }
    },
    close() {
      document.querySelector('.cart-drawer')?.classList.remove('open');
      document.querySelector('.drawer-veil')?.classList.remove('open');
      document.body.style.overflow = '';
    },
  };

  /* delegated qty controls inside drawer / order page */
  document.addEventListener('click', e => {
    const row = e.target.closest('[data-id]');
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest('[data-inc]')) Cart.setQty(id, (Cart.read()[id] || 0) + 1);
    if (e.target.closest('[data-dec]')) Cart.setQty(id, (Cart.read()[id] || 0) - 1);
  });

  window.BJCart = Cart;
})();
