document.addEventListener('DOMContentLoaded', () => {
  initHotspots();
});

// Parts that open an info card when clicked/focused.
// frets, tunerbtns, covers are non-interactive but stay highlighted
// when their linked partner is selected (see PART_GROUPS below).
const INTERACTIVE_PARTS = new Set([
  'body', 'tuners', 'neck', 'strings', 'pickups',
  'pickguard', 'switch', 'controls', 'bridge', 'jack',
]);

// Linked highlight groups: selecting any interactive member keeps ALL
// members (including non-interactive ones) at full opacity.
const PART_GROUPS = new Map([
  ['neck',   ['neck',   'frets']],       // frets sits on neck; highlight together
  ['tuners', ['tuners', 'tunerbtns']],   // buttons are part of the tuner assembly
  ['bridge', ['bridge', 'covers']],      // spring-cover plate belongs with the bridge
]);

function linkedParts(partName) {
  return PART_GROUPS.get(partName) || [partName];
}

function initHotspots() {
  const guitar = document.getElementById('guitar');
  if (!guitar) return;

  // ALL part elements — used for applying/clearing part-active so that
  // non-interactive linked partners (frets, tunerbtns, covers) also respond.
  const allParts = Array.from(guitar.querySelectorAll('[data-part]'));

  // Interactive parts only — get event listeners and open info cards.
  const parts = allParts.filter(el => INTERACTIVE_PARTS.has(el.dataset.part));

  parts.forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', el.dataset.name);
  });

  const card = buildCard();
  document.body.appendChild(card);

  let selectedPart = null;

  // Add guitar-has-active to the SVG and part-active to the clicked group
  // plus any linked partners. Pass null to restore the resting state.
  function setHighlight(glowEl) {
    allParts.forEach(p => p.classList.remove('part-active'));
    if (glowEl) {
      guitar.classList.add('guitar-has-active');
      const linked = linkedParts(glowEl.dataset.part);
      // Apply part-active to every part in the linked set (interactive or not)
      allParts.forEach(p => {
        if (linked.includes(p.dataset.part)) p.classList.add('part-active');
      });
    } else {
      guitar.classList.remove('guitar-has-active');
    }
  }

  function openCard(el) {
    selectedPart = el;
    setHighlight(el);
    card.querySelector('.card-title').textContent = el.dataset.name;
    card.querySelector('.card-body').textContent = 'Description coming soon.';
    card.classList.remove('card-hidden');
    positionCard(el);
  }

  function closeCard() {
    selectedPart = null;
    setHighlight(null);
    card.classList.add('card-hidden');
  }

  parts.forEach(el => {
    el.addEventListener('mouseenter', ()  => setHighlight(el));
    el.addEventListener('mouseleave', ()  => setHighlight(selectedPart));
    el.addEventListener('focus',      ()  => setHighlight(el));
    el.addEventListener('blur',       ()  => setHighlight(selectedPart));
    el.addEventListener('click',      ()  => openCard(el));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard(el);
      }
    });
  });

  // Close card when clicking outside both the card and any interactive part.
  document.addEventListener('click', e => {
    if (!selectedPart) return;
    if (card.contains(e.target)) return;
    if (parts.some(p => p.contains(e.target))) return;
    closeCard();
  });

  function onViewportChange() {
    if (selectedPart && !card.classList.contains('card-hidden')) {
      positionCard(selectedPart);
    }
  }
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, { passive: true });

  function positionCard(el) {
    const rect   = el.getBoundingClientRect();
    const CARD_W = 240;
    const PAD    = 14;

    let top = rect.top - card.offsetHeight - PAD;
    if (top < PAD) top = rect.bottom + PAD;
    top = Math.max(PAD, Math.min(top, window.innerHeight - card.offsetHeight - PAD));

    let left = rect.left + (rect.width - CARD_W) / 2;
    left = Math.max(PAD, Math.min(left, window.innerWidth - CARD_W - PAD));

    card.style.left = `${left}px`;
    card.style.top  = `${top}px`;
  }

  function buildCard() {
    const el = document.createElement('div');
    el.className = 'glass-card card-hidden';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<button class="card-close" aria-label="Close info card">&times;</button>' +
      '<h3 class="card-title"></h3>' +
      '<p class="card-body"></p>';
    el.querySelector('.card-close').addEventListener('click', e => {
      e.stopPropagation();
      closeCard();
    });
    return el;
  }
}
