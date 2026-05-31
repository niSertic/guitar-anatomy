document.addEventListener('DOMContentLoaded', () => {
  initHotspots();
});

// ── Part content ──────────────────────────────────────────────────────────────
// Keyed by data-part value. Each entry has title, func (Function), tonal (Tonal impact).
const PART_CONTENT = {
  body: {
    title: 'Body',
    func:  'The solid slab (typically alder, ash, or basswood) that anchors the bridge, pickups, and electronics and transfers string vibration through the wood.',
    tonal: 'Tonewood and mass shape resonance and sustain — alder is balanced and full-spectrum, ash adds bright snap and upper mids, and heavier bodies generally lengthen sustain.',
  },
  neck: {
    title: 'Neck & Fretboard',
    func:  'The clamped maple neck carries string tension and sets scale length; the fretboard surface (maple or rosewood) defines where notes are stopped.',
    tonal: 'Fretboard material colors the attack — maple is bright and tight, rosewood warmer with softened highs; neck stiffness and scale length affect tension and harmonic clarity.',
  },
  tuners: {
    title: 'Tuning Machines',
    func:  'Geared tuners on the headstock adjust string tension to set and hold precise pitch, with the gear ratio setting tuning resolution.',
    tonal: 'Primarily about stability, but solid tuners preserve tuning under bends and tremolo use, and headstock mass can subtly influence sustain.',
  },
  strings: {
    title: 'Strings',
    func:  'Ferromagnetic strings vibrate over the pickups; their gauge and core (round or flat wound) set the fundamental and harmonic content the pickups translate into signal.',
    tonal: 'Heavier gauges give more output, fuller lows, and longer sustain; lighter gauges favor easier bends and brighter response. Fresh strings emphasize upper harmonics.',
  },
  pickups: {
    title: 'Pickups',
    func:  'Magnetic coils sense string vibration via electromagnetic induction, converting it into the signal sent to the amp; the three-single-coil layout offers neck, middle, and bridge positions.',
    tonal: 'The defining tonal element — single coils are bright, glassy, and articulate; the bridge pickup is brightest and hottest, the neck warmest and roundest.',
  },
  pickguard: {
    title: 'Pickguard',
    func:  'A laminated plate that mounts the pickups, controls, and switch as one assembly and protects the finish from pick wear.',
    tonal: 'Largely cosmetic and structural, with minimal direct tonal effect, though it can very slightly damp body resonance.',
  },
  switch: {
    title: 'Pickup Selector',
    func:  'The five-way blade switch routes which pickup or combination feeds the output: neck, neck+middle, middle, middle+bridge, and bridge.',
    tonal: 'Positions 2 and 4 combine two pickups for the hollow, out-of-phase ‘quack’ prized in funk and clean tones; end positions isolate a single pickup’s character.',
  },
  controls: {
    title: 'Control Knobs',
    func:  'A master volume plus tone controls attenuate signal level and roll off high frequencies through a capacitor.',
    tonal: 'Volume interacts with the amp’s input to clean up or push gain; the tone pot bleeds treble to ground for darker voicings without changing pickup selection.',
  },
  bridge: {
    title: 'Bridge & Tremolo',
    func:  'The synchronized tremolo bridge anchors the strings, sets intonation and string height at the saddles, and pivots to vary pitch via the arm.',
    tonal: 'Saddle material and bridge mass affect sustain and brightness; a floating tremolo adds shimmer but trades some sustain and tuning stability versus a decked or hardtail setup.',
  },
  jack: {
    title: 'Output Jack',
    func:  'The mono ¼-inch jack delivers the combined signal from the electronics to the instrument cable and on to the amplifier.',
    tonal: 'No tonal shaping of its own, but a clean connection prevents the signal loss, crackle, and dropouts that would degrade the output.',
  },
};

// Non-interactive linked parts: map to the lead part whose content should show.
const PART_LEAD = {
  frets:     'neck',
  tunerbtns: 'tuners',
  covers:    'bridge',
};

// ── Part interaction ──────────────────────────────────────────────────────────

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

    // Non-interactive linked parts (frets, tunerbtns, covers) show their
    // lead part's content; all other parts use their own data-part key.
    const key  = PART_LEAD[el.dataset.part] || el.dataset.part;
    const info = PART_CONTENT[key];

    card.querySelector('.card-title').textContent         = info ? info.title : el.dataset.name;
    card.querySelector('.card-function-text').textContent = info ? info.func  : '';
    card.querySelector('.card-tonal-text').textContent    = info ? info.tonal : '';

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
      '<div class="card-section">' +
        '<span class="card-label">Function</span>' +
        '<p class="card-text card-function-text"></p>' +
      '</div>' +
      '<div class="card-section">' +
        '<span class="card-label">Tonal impact</span>' +
        '<p class="card-text card-tonal-text"></p>' +
      '</div>';
    el.querySelector('.card-close').addEventListener('click', e => {
      e.stopPropagation();
      closeCard();
    });
    return el;
  }
}
