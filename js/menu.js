/* Banchan Jib — menu page */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('menu-grid');
  if (grid) grid.innerHTML = window.BJ_PRODUCTS.map(window.BJ_dishCard).join('');
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
