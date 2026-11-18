/* Banchan Jib — menu page */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('menu-grid');
  if (grid) grid.innerHTML = window.BJ_PRODUCTS.map(window.BJ_dishCard).join('');

  /* the official menu board, 1:1 with the Instagram menu */
  const M = window.BJ_MENU, board = document.getElementById('menu-board');
  if (!M || !board) return;
  const add = (id, label) => `<button class="mb-add" type="button" data-add="${id}" aria-label="Add ${label} to basket">+</button>`;
  board.querySelector('[data-mb="mains"]').innerHTML = M.mains.map(m => `
    <div class="mb-main">
      <img src="${m.imgSm}" alt="${m.name}" width="120" height="120" loading="lazy">
      <div>
        <h3>${m.name}</h3>
        <p class="mb-price">BDT ${m.price} ${add(m.id, m.name)}</p>
        <p class="mb-desc">${m.desc}</p>
      </div>
    </div>`).join('');
  board.querySelector('[data-mb="banchan"]').innerHTML = M.banchanOrder.map(id => {
    const p = window.BJ_BY_ID[id];
    return `
    <div class="mb-banchan">
      <a class="mb-bname" href="/products/${p.slug}.html">${p.name}</a>
      <img src="${p.imgSm}" alt="" width="64" height="64" loading="lazy">
      <span class="mb-bp"><small>BDT</small>${p.price}${add(p.id, p.name + ' with main, 80g')}</span>
      <span class="mb-bp"><small>BDT</small>${p.priceSolo}${add(p.id + '-solo', p.name + ' solo, 150g')}</span>
    </div>`;
  }).join('');
  board.querySelector('[data-mb="addons"]').innerHTML = M.addons.map(a => `
    <div class="mb-addon">
      <h3>${a.name}</h3>
      ${a.note ? `<p class="mb-desc mb-desc--plain">${a.note}</p>` : ''}
      ${a.desc ? `<p class="mb-desc">${a.desc}</p>` : ''}
      <p class="mb-price">${a.price ? `BDT ${a.price} ${add(a.id, a.name)}` : `${a.priceLabel} <small class="mb-dm">ask in your DM</small>`}</p>
    </div>`).join('');
  board.querySelector('[data-mb="note"]').textContent = M.note;
});

/* she's delighted you came to browse the menu */
document.addEventListener('bj:revealed', () => {
  setTimeout(() => {
    if (window.Halmeoni && window.Halmeoni.react) window.Halmeoni.react([
      ['surprised', "Oh! You're here for the menu!"],
      ['happy', 'Take your time, everything\'s good today.'],
    ]);
  }, 500);
}, { once: true });
