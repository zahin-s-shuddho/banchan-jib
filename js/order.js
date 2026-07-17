/* Banchan Jib — order page: summary + DM note builder */
(function () {
  const S = window.BJ_SETTINGS;

  function buildNote() {
    const items = BJCart.items();
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const area = document.getElementById('f-area').value.trim();
    const note = document.getElementById('f-note').value.trim();

    if (!items.length) return 'Your basket is empty — add something delicious from the menu first!';

    let msg = `안녕하세요 Banchan Jib! 🍚\nI'd like to reserve this week's batch:\n\n`;
    items.forEach(p => { msg += `• ${p.name} (${p.kr}) × ${p.qty} — BDT ${p.price * p.qty}\n`; });
    msg += `\nTotal: BDT ${BJCart.total()}\n`;
    msg += `\nName: ${name || '—'}\nPhone: ${phone || '—'}\nArea: ${area || '—'}`;
    if (note) msg += `\nNote: ${note}`;
    msg += `\n\n잘 먹겠습니다! 🙏`;
    return msg;
  }

  function renderSummary() {
    const items = BJCart.items();
    const list = document.getElementById('order-summary');
    if (!list) return;
    list.innerHTML = items.length
      ? items.map(p => `<li><span>${p.name} × ${p.qty}</span><span>BDT ${p.price * p.qty}</span></li>`).join('')
        + `<li class="tot"><span>Total</span><span>BDT ${BJCart.total()}</span></li>`
      : '';
    const pv = document.getElementById('dm-preview');
    if (pv) pv.textContent = buildNote();
  }

  function validate() {
    let ok = true;
    ['f-name', 'f-phone', 'f-area'].forEach(id => {
      const input = document.getElementById(id);
      const bad = !input.value.trim();
      input.closest('.field').classList.toggle('invalid', bad);
      if (bad && ok) { input.focus(); ok = false; }
    });
    if (!BJCart.count()) {
      BJToast('Your basket is empty — pick something from the menu first.', '앗!');
      ok = false;
    }
    if (!ok && window.Halmeoni && window.Halmeoni.setGlobalMood) {
      window.Halmeoni.setGlobalMood('worried', { reason: "Something's missing — I want to make sure this reaches you safely." });
    }
    return ok;
  }

  async function copyNote() {
    const txt = buildNote();
    try { await navigator.clipboard.writeText(txt); return true; }
    catch {
      const ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); return true; } catch { return false; }
      finally { ta.remove(); }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('order-form')) return;
    renderSummary();
    document.addEventListener('bj:cart', renderSummary);
    document.getElementById('order-form').addEventListener('input', renderSummary);

    /* the note is copied to the clipboard, then the chat thread itself opens
       (deep-linking into the app on phones) — Instagram and Messenger don't
       allow outside sites to pre-fill a message, so pasting is the one step
       left for the customer.

       the window MUST open synchronously inside the click handler — any
       await or setTimeout before window.open() breaks the browser's "this
       came from a direct user gesture" check, and mobile browsers silently
       block it as a popup. copyNote() runs after, into the already-open tab. */
    async function openDm(desktopUrl, mobileUrl, profileUrl, platformLabel) {
      if (!validate()) return;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const target = isMobile ? mobileUrl : desktopUrl;

      const win = window.open('', '_blank', 'noopener');
      if (!win) {
        /* popup blocked — try once more, landing on the profile page instead
           of the DM thread, so they can at least reach us that way */
        const fallback = window.open(profileUrl, '_blank', 'noopener');
        if (!fallback) BJToast(`Please open ${platformLabel} to message us — pop-ups are blocked.`, '앗!');
        return;
      }
      try { win.opener = null; } catch {}
      win.location.href = target;

      const copied = await copyNote();
      BJToast(copied ? 'Note copied! Opening our chat — just paste it in.' : 'Could not copy — please copy the note above manually.', copied ? '복사 완료!' : '앗!');
    }

    document.getElementById('btn-ig').addEventListener('click', () => {
      openDm(S.instagramDm, S.instagramDmMobile, `https://instagram.com/${S.instagram}`, 'Instagram');
    });

    document.getElementById('btn-fb').addEventListener('click', () => {
      openDm(S.facebookDm, S.facebookDmMobile, `https://facebook.com/${S.facebook}`, 'Facebook');
    });
  });
})();
