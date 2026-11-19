/* cursor-bridge.js: when this site is shown inside Zahin Sultan's portfolio demo
   (an iframe), report the mouse position to the portfolio so its cursor can follow
   onto this page. Does nothing when the site is opened on its own, and only talks
   to the portfolio's own origins, after the portfolio says hello first. */
(function () {
  if (window.top === window) return;
  var ALLOWED = /^https?:\/\/(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|zahinsultan\.pages\.dev|[a-z0-9-]+\.zahinsultan\.pages\.dev)$/;
  var host = null;
  window.addEventListener("message", function (e) {
    if (host || !ALLOWED.test(e.origin) || !e.data || e.data.cursorBridge !== "hello") return;
    host = e.origin;
    /* the portfolio draws the cursor, so this page hides its own */
    var s = document.createElement("style");
    s.textContent = "*,*::before,*::after{cursor:none!important}.q-cursor,.cursor-dot,.cursor-ring{display:none!important}";
    (document.head || document.documentElement).appendChild(s);
  });
  ["pointermove", "pointerdown", "pointerup"].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (!host || e.pointerType !== "mouse") return;
      window.parent.postMessage({ cursorBridge: type, x: e.clientX, y: e.clientY }, host);
    }, { passive: true, capture: true });
  });
})();
