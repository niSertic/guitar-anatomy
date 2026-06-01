document.addEventListener('DOMContentLoaded', () => {
  initHotspots();
  initSignalPath();
});

// ── Part content ──────────────────────────────────────────────────────────────
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

// Non-interactive linked parts map to their lead part's content.
const PART_LEAD = {
  frets:     'neck',
  tunerbtns: 'tuners',
  covers:    'bridge',
};

// ── Static list definition ────────────────────────────────────────────────────
// Ordered display list for the parts strip below the guitar.
const LIST_ITEMS_DEF = [
  { label: 'Body',             part: 'body'      },
  { label: 'Neck & Fretboard', part: 'neck'      },
  { label: 'Tuning Machines',  part: 'tuners'    },
  { label: 'Strings',          part: 'strings'   },
  { label: 'Pickups',          part: 'pickups'   },
  { label: 'Pickguard',        part: 'pickguard' },
  { label: 'Pickup Selector',  part: 'switch'    },
  { label: 'Control Knobs',    part: 'controls'  },
  { label: 'Bridge & Tremolo', part: 'bridge'    },
  { label: 'Output Jack',      part: 'jack'      },
];

// ── Interaction ───────────────────────────────────────────────────────────────

const INTERACTIVE_PARTS = new Set([
  'body', 'tuners', 'neck', 'strings', 'pickups',
  'pickguard', 'switch', 'controls', 'bridge', 'jack',
]);

const PART_GROUPS = new Map([
  ['neck',   ['neck',   'frets']],
  ['tuners', ['tuners', 'tunerbtns']],
  ['bridge', ['bridge', 'covers']],
]);

function linkedParts(partName) {
  return PART_GROUPS.get(partName) || [partName];
}

// ── Signal Path ───────────────────────────────────────────────────────────────

const SP_CONTENT = {
  strings:  { label: 'Strings',          text: 'A plucked ferromagnetic string vibrates at its fundamental and harmonics — purely mechanical motion, no electrical signal yet. This is the raw source.' },
  pickups:  { label: 'Pickups',          text: 'The vibrating steel string disturbs the coil\'s magnetic field, inducing a tiny alternating voltage (electromagnetic induction). Mechanical vibration becomes an electrical signal here.' },
  selector: { label: 'Pickup Selector',  text: 'The 5-way switch selects which pickup(s) feed the circuit — one coil or a blend of two — determining which signal and tonal character continues.' },
  voltone:  { label: 'Volume & Tone',    text: 'The volume pot sets overall level; the tone pot bleeds treble to ground through a capacitor. The signal is shaped in amplitude and brightness before leaving the guitar.' },
  jack:     { label: 'Output Jack',      text: 'The shaped signal passes to the cable as a low-level, high-impedance audio signal (a few hundred millivolts). The guitar\'s job is done; the signal leaves the instrument.' },
  amp:      { label: 'Amplifier',        text: 'The cable feeds the weak signal to the amp, which boosts it to drive a speaker — completing the chain. (The amp sits outside the guitar itself.)' },
};

function initSignalPath() {
  const diagram    = document.getElementById('sp-diagram');
  const nodesWrap  = document.getElementById('sp-nodes');
  const svg        = document.getElementById('sp-svg');
  const track      = document.getElementById('sp-track');
  const dot        = document.getElementById('sp-dot');
  const playBtn    = document.getElementById('sp-play-btn');
  const blurb      = document.getElementById('sp-blurb');
  const blurbTitle = document.getElementById('sp-blurb-title');
  const blurbText  = document.getElementById('sp-blurb-text');

  if (!diagram) return;

  const nodeEls = Array.from(nodesWrap.querySelectorAll('.sp-node'));

  // Read node ring center positions relative to the SVG overlay
  function nodePoints() {
    const svgRect = svg.getBoundingClientRect();
    return nodeEls.map(el => {
      const r = el.querySelector('.sp-node-ring').getBoundingClientRect();
      return { x: r.left + r.width  / 2 - svgRect.left,
               y: r.top  + r.height / 2 - svgRect.top };
    });
  }

  // (Re)draw the polyline through all node centers
  function buildPath() {
    if (svg.getBoundingClientRect().width === 0) return;
    const pts = nodePoints();
    track.setAttribute('d',
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
  }

  // Cumulative distances to each node along the polyline (for pulse sync)
  function cumLengths() {
    const pts = nodePoints();
    const acc = [0];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      acc.push(acc[i-1] + Math.sqrt(dx*dx + dy*dy));
    }
    return acc;
  }

  // ── Node interaction ──────────────────────────────────────
  function activateNode(id) {
    nodeEls.forEach(el => el.classList.toggle('sp-node-active', el.dataset.sp === id));
    const c = SP_CONTENT[id];
    if (!c) return;
    blurbTitle.textContent = c.label;
    blurbText.textContent  = c.text;
    blurb.classList.remove('sp-blurb-hidden');
  }

  nodeEls.forEach(el => {
    el.addEventListener('click', () => activateNode(el.dataset.sp));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateNode(el.dataset.sp); }
    });
  });

  // ── Pulse animation ───────────────────────────────────────
  const DURATION = 3000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animId = null;

  function flashNode(el) {
    el.classList.add('sp-node-lit');
    setTimeout(() => el.classList.remove('sp-node-lit'), 700);
  }

  function runPulse() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }

    buildPath();
    const totalLen = track.getTotalLength();
    if (totalLen === 0) return;

    playBtn.disabled = true;
    playBtn.textContent = 'Playing…';

    if (reducedMotion) {
      nodeEls.forEach((el, i) => setTimeout(() => flashNode(el), i * 100));
      setTimeout(() => {
        playBtn.disabled = false;
        playBtn.textContent = 'Replay signal';
      }, nodeEls.length * 100 + 700);
      return;
    }

    const lens  = cumLengths();
    const litSet = new Set();
    let start = null;

    dot.style.opacity = '1';

    function frame(ts) {
      if (start === null) start = ts;
      const t   = Math.min((ts - start) / DURATION, 1);
      const len = t * totalLen;
      const pt  = track.getPointAtLength(len);

      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);

      nodeEls.forEach((el, i) => {
        if (!litSet.has(i) && len >= lens[i]) {
          litSet.add(i);
          flashNode(el);
        }
      });

      if (t < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        dot.style.opacity = '0';
        playBtn.disabled = false;
        playBtn.textContent = 'Replay signal';
        animId = null;
      }
    }

    animId = requestAnimationFrame(frame);
  }

  playBtn.addEventListener('click', runPulse);

  // Redraw connector on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildPath, 80);
  });

  // Initial draw after two frames to ensure layout is settled
  requestAnimationFrame(() => requestAnimationFrame(buildPath));
}

// ── Anatomy hotspots ──────────────────────────────────────────────────────────

function initHotspots() {
  const guitar = document.getElementById('guitar');
  if (!guitar) return;

  const allParts = Array.from(guitar.querySelectorAll('[data-part]'));
  const parts    = allParts.filter(el => INTERACTIVE_PARTS.has(el.dataset.part));

  parts.forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', el.dataset.name);
  });

  const card = buildCard();
  document.body.appendChild(card);

  let selectedPart = null;

  // ── Parts list ──────────────────────────────────────────────
  // listItems is populated below; setHighlight references it via closure.
  const listItems = [];
  const listContainer = document.getElementById('parts-list');

  // ── Highlight / dim ─────────────────────────────────────────
  // Central state function — called by both SVG parts and list buttons.
  // glowEl: the SVG <g> or <path> element to highlight, or null to reset.
  function setHighlight(glowEl) {
    // SVG dim/highlight
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

    // Two-way sync: mark the matching list button as active.
    const activeKey = glowEl
      ? (PART_LEAD[glowEl.dataset.part] || glowEl.dataset.part)
      : null;
    listItems.forEach(btn => {
      btn.classList.toggle('list-active', btn.dataset.part === activeKey);
    });
  }

  function openCard(el) {
    selectedPart = el;
    setHighlight(el);

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

  // ── SVG part event listeners ────────────────────────────────
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

  // Close card when clicking outside the card, any SVG part, and the parts list.
  document.addEventListener('click', e => {
    if (!selectedPart) return;
    if (card.contains(e.target)) return;
    if (parts.some(p => p.contains(e.target))) return;
    if (listContainer && listContainer.contains(e.target)) return;
    closeCard();
  });

  // ── Parts list build ────────────────────────────────────────
  if (listContainer) {
    LIST_ITEMS_DEF.forEach(({ label, part }) => {
      const partEl = parts.find(p => p.dataset.part === part);
      if (!partEl) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'parts-list-item';
      btn.dataset.part = part;
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', label);
      btn.textContent = label;

      btn.addEventListener('mouseenter', ()  => setHighlight(partEl));
      btn.addEventListener('mouseleave', ()  => setHighlight(selectedPart));
      btn.addEventListener('focus',      ()  => setHighlight(partEl));
      btn.addEventListener('blur',       ()  => setHighlight(selectedPart));
      btn.addEventListener('click',      ()  => openCard(partEl));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCard(partEl);
        }
      });

      listContainer.appendChild(btn);
      listItems.push(btn);
    });
  }

  // ── Viewport tracking ───────────────────────────────────────
  function onViewportChange() {
    if (selectedPart && !card.classList.contains('card-hidden')) {
      positionCard(selectedPart);
    }
  }
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, { passive: true });

  // ── Card positioning ────────────────────────────────────────
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

  // ── Card construction ───────────────────────────────────────
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
