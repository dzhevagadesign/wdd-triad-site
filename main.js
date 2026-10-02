/* WDD Triad landing */

/* ---------- hero cards: entrance ----------
   Starts the CSS entrance (.is-in) once the grid is on screen and counts the gauge 0.00 → 0.75
   in step with the arc (same delay, duration and easing as .g-e5 in style.css). */
(() => {
  const grid = document.querySelector('[data-intro]');
  if (!grid) return;
  const value = grid.querySelector('.g-value');
  const target = parseFloat(value.textContent);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function count() {
    if (reduce) return;
    const delay = 550, dur = 1500;
    const t0 = performance.now() + delay;
    value.textContent = (0).toFixed(2);
    (function tick(now) {
      const t = Math.min(1, Math.max(0, (now - t0) / dur));
      value.textContent = (target * ease(t)).toFixed(2);
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  // plain position check rather than IntersectionObserver: it runs right away on load, so the
  // cards can never stay hidden if the observer is late or never fires
  function check() {
    const r = grid.getBoundingClientRect();
    if (r.top > innerHeight * 0.85 || r.bottom < 0) return;
    removeEventListener('scroll', check);
    grid.classList.add('is-in');
    count();
  }
  addEventListener('scroll', check, { passive: true });
  check();
})();

/* ---------- "Дані, яким можна довіряти": card stack ----------
   While .trust__pin is stuck, scroll distance s moves the cards like a grid (card height + 80px gap):
   card k sits at y = k·PITCH − s and parks at 0. Arrival of card j is a = 1 − y/PITCH. A card's depth
   d is the sum of arrivals of the cards after it; by depth it shrinks (origin top), rises and gets a
   white veil, so parked cards peek out above the front one in a cascade (Figma: 24 / 45 / 58px). */
(() => {
  const section = document.querySelector('[data-trust]');
  if (!section) return;
  const pin = section.querySelector('.trust__pin');
  const cards = [...section.querySelectorAll('.vcard')];
  const veils = cards.map(c => c.querySelector('.vcard__veil'));
  const n = cards.length;

  const GAP = 80;
  const DWELL = 200;                       // scroll the full pile stays put before FAQ comes up
  const LIFT  = [0, 24, 45, 58];           // px the card's top edge peeks above the front card
  const SCALE = [1, 0.867, 0.778, 0.696];  // 1064 → 922 → 828 → 741
  const VEIL  = [0, 0.66, 0.85, 0.93];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const at = (arr, d) => {
    const i = Math.min(Math.floor(d), arr.length - 1);
    const j = Math.min(i + 1, arr.length - 1);
    return arr[i] + (arr[j] - arr[i]) * (d - i);
  };
  let pitch = 480;

  function layout() {
    pitch = cards[0].offsetHeight + GAP;
    section.style.height = `${pin.offsetHeight + (n - 1) * pitch + DWELL}px`;
  }

  function render() {
    const s = clamp(-section.getBoundingClientRect().top, 0, (n - 1) * pitch);
    let depth = 0;
    for (let k = n - 1; k >= 0; k--) {
      const y = Math.max(0, k * pitch - s);
      const d = Math.min(depth, LIFT.length - 1);
      cards[k].style.transform = `translate3d(0, ${(y - at(LIFT, d)).toFixed(2)}px, 0) scale(${at(SCALE, d).toFixed(4)})`;
      cards[k].style.opacity = clamp(LIFT.length - depth, 0, 1).toFixed(3);
      veils[k].style.opacity = at(VEIL, d).toFixed(3);
      depth += clamp(1 - y / pitch, 0, 1);
    }
  }

  let queued = false;
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; render(); }); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { layout(); request(); });
  layout();
  render();
})();

/* ---------- FAQ accordion: all closed by default, one open at a time ---------- */
const faqItems = [...document.querySelectorAll('.faq__item')];
faqItems.forEach(item => {
  item.querySelector('.faq__q').addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    faqItems.forEach(other => {
      const on = other === item && open;
      other.classList.toggle('is-open', on);
      other.querySelector('.faq__q').setAttribute('aria-expanded', on);
    });
  });
});
