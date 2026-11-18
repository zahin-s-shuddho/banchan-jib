/* drawn.js: hand-drawn chrome for Banchan Jib via drawably (vendored, MIT).
   Real elements keep working; drawably draws the ink around them.
   Runs on load and again whenever cart/menu/order scripts render new markup. */
import {
  drawablyButton, drawablyCard, drawablyBadge, drawablyInput, drawablyTextarea,
  drawablySelect, drawablyCircle, drawablyUnderline, drawablyHighlight,
  drawablyList, drawablyDivider,
} from "./vendor/drawably/index.js";

const root = document.documentElement;
root.classList.add("dw");
const css = getComputedStyle(root);
const v = (n, f) => (css.getPropertyValue(n).trim() || f);
const INK = v("--brown-deep", "#46301f");
const KIMCHI = v("--kimchi", "#b8452f");
const SAGE = v("--sage", "#9aa88a");
const SEAWEED = v("--seaweed", "#5a6a3c");
const CREAM = v("--cream", "#f6f0e7");
const PAPER = "#fff8f2";

const once = (el) => (el.dataset.dw ? false : (el.dataset.dw = "1"));
const safe = (fn) => { try { fn(); } catch (e) { /* missing inner field etc. */ } };

/* selector → how to draw it */
const RULES = [
  [".btn", (el) => {
    const c = el.classList;
    if (c.contains("btn-primary")) return drawablyButton(el, { variant: "solid", stroke: INK, fill: KIMCHI, paper: PAPER, width: 2.4 });
    if (c.contains("btn-sage")) return drawablyButton(el, { variant: "solid", stroke: INK, fill: SAGE, paper: INK, width: 2.4 });
    if (c.contains("btn-cream")) return drawablyButton(el, { stroke: CREAM, fill: CREAM, width: 2.2 });
    return drawablyButton(el, { stroke: INK, fill: INK, width: 2.4 });
  }],
  [".dish-card, .letter, .pd-panel, .order-panel, .step, .info-card, .price-sheet, .cart-item, .fact-sheet, .get-card", (el) =>
    drawablyCard(el, { stroke: INK, width: 1.8, roughness: 1.1, boil: 0.25 })],
  [".plan-card", (el) => drawablyCard(el, { stroke: "rgba(70,48,31,.55)", width: 1.6, roughness: 1.8, boil: 0.25 })],
  [".granny-says, .dm-preview, .qty", (el) => drawablyCard(el, { stroke: INK, width: 2, roughness: 1.3 })],
  [".pd-tags span, .plan-card .tagline", (el) => drawablyBadge(el, { stroke: SEAWEED })],
  [".stamp", (el) => drawablyCircle(el, { stroke: KIMCHI, width: 2.2 })],
  [".price-chip, .step .num", (el) => drawablyBadge(el, { stroke: KIMCHI })],
  [".cart-btn, .social-row a:not(.btn), .nav-burger", (el) => drawablyCard(el, { stroke: el.closest("footer") ? CREAM : INK, width: 2 })],
  ["a.scribble, .nav-links a[aria-current], .nav-links a.active", (el) => drawablyUnderline(el, { stroke: KIMCHI, width: 2 })],
  [".pd-panel ul", (el) => drawablyList(el, { marker: "check", stroke: SEAWEED })],
  [".order-summary-list", (el) => el.children.length && drawablyList(el, { stroke: INK })],
  [".page-title em", (el) => drawablyUnderline(el, { stroke: KIMCHI, width: 2.6 })],
  [".sec-title em", (el, i) => (document.querySelectorAll(".sec-title em").length && [...document.querySelectorAll(".sec-title em")].indexOf(el) % 2
    ? drawablyHighlight(el, { fill: SAGE }) : drawablyUnderline(el, { stroke: KIMCHI, width: 2.6 }))],
  [".dw-rule, hr.rule", (el) => drawablyDivider(el, { stroke: "rgba(70,48,31,.5)" })],
  ["mark.dw-hl", (el) => drawablyHighlight(el, { fill: "#e9b44c" })],
];

function wrapField(field) {
  if (field.closest(".dw-field")) return;
  const w = document.createElement("span");
  w.className = "dw-field";
  field.before(w); w.append(field);
  const opts = { stroke: INK, paper: "rgba(255,253,248,.85)", width: 2 };
  safe(() => field.tagName === "TEXTAREA" ? drawablyTextarea(w, opts)
    : field.tagName === "SELECT" ? drawablySelect(w, opts) : drawablyInput(w, opts));
}

function scan(scope = document) {
  for (const [sel, fn] of RULES)
    scope.querySelectorAll(sel).forEach((el) => { if (once(el)) safe(() => fn(el)); });
  scope.querySelectorAll(".field input:not([type=checkbox]):not([type=radio]), .field textarea, .field select").forEach(wrapField);
}

scan();
let queued = false;
new MutationObserver(() => {
  if (queued) return; queued = true;
  setTimeout(() => { queued = false; scan(); }, 30);
}).observe(document.body, { childList: true, subtree: true });
setTimeout(scan, 600); /* catch content painted after the loader */
