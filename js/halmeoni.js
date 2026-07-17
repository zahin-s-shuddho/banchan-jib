/* ══════════════════════════════════════════════════════════
   할머니 · Halmeoni — the Banchan Jib mascot
   Rendered from the illustrated sticker set in
   /assets/img/halmeoni/.
   ══════════════════════════════════════════════════════════ */
window.Halmeoni = (function () {
  const BASE = '/assets/img/halmeoni/';
  const FILES = {
    happy: 'halmeoni-happy.png',
    serious: 'halmeoni-serious.png',
    sad: 'halmeoni-sad.png',
    worried: 'halmeoni-worried.png',
    surprised: 'halmeoni-surprised.png',
    angry: 'halmeoni-angry.png',
    excited: 'halmeoni-excited.png',
    wave: 'halmeoni-wave.png',
    cooking: 'halmeoni-cooking.png',
    delivering: 'halmeoni-delivery-tray.png',
    serving: 'halmeoni-serving-banchan.png',
    proud: 'halmeoni-thumbs-up.png',
    idea: 'halmeoni-great-idea.png',
    heart: 'halmeoni-heart.png',
  };

  /* the seven core emotional states — used by cart/game logic */
  const MOODS = ['happy', 'serious', 'sad', 'worried', 'surprised', 'angry', 'excited'];
  /* the full sticker set — used by the draggable sticker's tap-cycle */
  const ALL = Object.keys(FILES);

  const MOOD_LABEL = {
    happy: '기뻐요 · happy', serious: '진지해요 · steady', sad: '슬퍼요 · sad',
    worried: '걱정돼요 · worried', surprised: '놀랐어요 · surprised',
    angry: '화났어요 · annoyed', excited: '신나요 · excited',
    wave: '안녕하세요 · hello', cooking: '요리 중 · cooking', delivering: '배달 가요 · delivering',
    serving: '맛보세요 · serving', proud: '최고예요 · proud', idea: '좋은 생각 · great idea',
    heart: '사랑을 담아 · with love',
  };

  const TOAST_MSG = {
    happy: 'Halmeoni is feeling happy now.',
    serious: 'Halmeoni is feeling serious now.',
    sad: 'Halmeoni is feeling sad now.',
    worried: 'Halmeoni is feeling worried now.',
    surprised: 'Halmeoni is feeling surprised now.',
    angry: 'Halmeoni is a little annoyed!',
    excited: 'Halmeoni is so excited!',
    wave: 'Halmeoni says hello!',
    cooking: "Halmeoni's cooking something up.",
    delivering: 'Halmeoni is out on delivery.',
    serving: 'Halmeoni is serving up banchan.',
    proud: 'Halmeoni gives it a thumbs up!',
    idea: 'Halmeoni has a great idea!',
    heart: 'Halmeoni sends her love.',
  };

  /* fallback reason, used only when a trigger didn't supply its own —
     every real trigger in halmeoni-drag.js passes something more specific */
  const DEFAULT_REASON = {
    happy: "I'm just glad you're here.",
    serious: "Let's get back to looking at the food so I can cook.",
    sad: "I was hoping you'd stay a little longer.",
    worried: "I just want to make sure everything's alright.",
    surprised: 'Oh! I wasn\'t expecting that.',
    angry: "Aigoo, someone's making a mess of my table.",
    excited: "I can't help it, I love this part!",
    wave: "Just saying hello — 어서오세요!",
    cooking: "Give me a moment, something's on the stove.",
    delivering: "This one's headed out soon.",
    serving: "Fresh out of the kitchen, just for you.",
    proud: 'That was a good choice.',
    idea: "I've been thinking about this one.",
    heart: 'This kitchen runs on 정 — care for the people who eat here.',
  };

  function svg(mood = 'happy') {
    const file = FILES[mood] || FILES.happy;
    return `<img src="${BASE}${file}" alt="" aria-hidden="true" draggable="false" style="width:100%;display:block">`;
  }

  return { svg, moods: MOODS, allMoods: ALL, moodLabel: MOOD_LABEL, toastMsg: TOAST_MSG, defaultReason: DEFAULT_REASON };
})();
