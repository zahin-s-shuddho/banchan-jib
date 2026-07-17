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
       left for the customer */
    document.getElementById('btn-ig').addEventListener('click', async () => {
      if (!validate()) return;
      const copied = await copyNote();
      BJToast(copied ? 'Note copied! Opening our chat — just paste it in.' : 'Could not copy — please copy the note above manually.', copied ? '복사 완료!' : '앗!');
      setTimeout(() => window.open(S.instagramDm, '_blank', 'noopener'), 900);
    });

    document.getElementById('btn-fb').addEventListener('click', async () => {
      if (!validate()) return;
      const copied = await copyNote();
      BJToast(copied ? 'Note copied! Opening our chat — just paste it in.' : 'Could not copy — please copy the note above manually.', copied ? '복사 완료!' : '앗!');
      setTimeout(() => window.open(S.facebookDm, '_blank', 'noopener'), 900);
    });
  });
})();
