// signals.jsx — signal generators + reusable Trace renderer.
// Pure-JS synthetic signals so the prototype feels alive without a backend.

// Deterministic-ish PRNG so traces don't reflow on every render.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 1/f-ish pink noise (Voss-McCartney lite)
function pinkNoise(n, seed = 1) {
  const rand = mulberry32(seed);
  const rows = 6;
  const buf = new Array(rows).fill(0);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    for (let r = 0; r < rows; r++) {
      if (i % (1 << r) === 0) buf[r] = (rand() - 0.5);
    }
    let s = 0;
    for (let r = 0; r < rows; r++) s += buf[r];
    out[i] = s / rows;
  }
  return out;
}

// EEG band info — frequencies, narrative copy (basic + advanced), head heat region.
const BANDS = [
  {
    key: 'delta', label: 'Delta', range: '0.5–4 Hz', freq: 2,
    color: 'var(--c-plum)',
    when: 'Deep, dreamless sleep',
    body: 'Slow, sweeping waves. Dominant during stage 3 NREM sleep — when you are not dreaming and the brain is consolidating memory.',
    bodyAdv: 'Slow-wave activity (SWA, 0.5–4 Hz) is the canonical marker of homeostatic sleep pressure (Process S in the Borbély two-process model). Mechanistically arises from thalamocortical Up/Down state alternation and broad cortico-cortical synchronization. Quantified as PSD in the 0.5–4 Hz window with multitaper or Welch; pathological elevation in waking is a hallmark of metabolic encephalopathy.',
    where: 'Frontal & temporal',
    feel: 'You are out cold.',
    region: { x: 50, y: 30, r: 22 },
  },
  {
    key: 'theta', label: 'Theta', range: '4–8 Hz', freq: 6,
    color: 'var(--c-blue)',
    when: 'Drowsy, meditation, deep focus',
    body: 'The dreamy, drifting band. Spikes during the moment between awake and asleep, in deep meditation, and in hippocampal memory work.',
    bodyAdv: 'Distinguish two functionally distinct theta sources: (1) frontal-midline theta at Fz, indexing cognitive control and conflict monitoring (Cavanagh & Frank, 2014); and (2) hippocampal/temporal theta, central to spatial navigation and episodic encoding. Theta-gamma phase-amplitude coupling is widely used as a memory-encoding biomarker. Beware drowsy theta: lower-amplitude, more posterior, and a confound in vigilance studies.',
    where: 'Hippocampus & midline',
    feel: 'Light and floaty, half-thoughts.',
    region: { x: 50, y: 50, r: 18 },
  },
  {
    key: 'alpha', label: 'Alpha', range: '8–13 Hz', freq: 10,
    color: 'var(--c-sage)',
    when: 'Relaxed wakefulness, eyes closed',
    body: 'Close your eyes and a beautiful 10 Hz hum rises across the back of your head. Open them — it vanishes (the Berger effect, 1929).',
    bodyAdv: 'Alpha is a family, not a band. Posterior occipital alpha (visual idling) is distinct from sensorimotor mu (~10 Hz over C3/C4, suppressed by movement or motor imagery). Functional inhibition hypothesis (Jensen & Mazaheri, 2010): alpha gates information by inhibiting task-irrelevant cortex. Frontal alpha asymmetry (F4-F3) is widely cited as an approach-withdrawal index but has poor reliability in single-session designs.',
    where: 'Occipital (back of head)',
    feel: 'Calm, idle, wakeful rest.',
    region: { x: 50, y: 78, r: 20 },
  },
  {
    key: 'beta', label: 'Beta', range: '13–30 Hz', freq: 22,
    color: 'var(--c-ochre)',
    when: 'Active thinking, focus',
    body: 'Fast, busy, alert. The work band — engaged in problem-solving, conversation, or anything cognitively loaded.',
    bodyAdv: 'Split into low (13–20 Hz) and high (20–30 Hz) sub-bands. Sensorimotor beta event-related desynchronization (ERD) accompanies movement preparation; post-movement beta rebound (PMBR) follows offset. Excessive beta synchronization in the subthalamic nucleus is a pathophysiological signature of Parkinson\'s disease, targeted therapeutically by deep-brain stimulation. Beta also shows up in working memory maintenance (Spitzer & Haegens, 2017).',
    where: 'Frontal & central',
    feel: 'Engaged, alert, on the task.',
    region: { x: 50, y: 38, r: 24 },
  },
  {
    key: 'gamma', label: 'Gamma', range: '30–80+ Hz', freq: 45,
    color: 'var(--c-terra)',
    when: 'High-level processing, binding',
    body: 'The fastest, smallest waves. Implicated in conscious perception and the binding of features into a unified experience — though the science here is still hot.',
    bodyAdv: 'Sub-divided into low gamma (30–80 Hz) and high gamma / broadband (>80 Hz). Singer\'s binding-by-synchrony hypothesis remains debated. Crucial methodological caveat: scalp EEG above 30 Hz is heavily contaminated by frontalis/temporalis EMG; published "gamma effects" without rigorous EMG control should be read sceptically. Intracranial recordings show high-gamma broadband as a reliable proxy for local population firing rate.',
    where: 'Distributed',
    feel: 'Sharp, integrative, "aha".',
    region: { x: 50, y: 50, r: 30 },
  },
];

// Generate an EEG trace: weighted sum of band sinusoids + pink noise.
function genEEG({ n = 500, t0 = 0, dt = 1 / 250, weights, seed = 7, noise = 0.4 }) {
  const w = weights || { delta: 0.3, theta: 0.4, alpha: 0.6, beta: 0.4, gamma: 0.2 };
  const noiseBuf = pinkNoise(n, seed);
  const out = new Float32Array(n);
  const rand = mulberry32(seed + 1);
  const phases = {};
  for (const b of BANDS) phases[b.key] = rand() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const t = t0 + i * dt;
    let s = 0;
    for (const b of BANDS) {
      const a = (w[b.key] || 0) * 1.0;
      s += a * Math.sin(2 * Math.PI * b.freq * t + phases[b.key]);
    }
    s += noiseBuf[i] * noise * 3;
    out[i] = s;
  }
  return out;
}

// Inject artifacts into an EEG trace.
function addArtifacts(sig, opts = {}) {
  const { blinks = true, lineNoise = true, drift = true, seed = 11 } = opts;
  const n = sig.length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = sig[i];
  if (drift) {
    for (let i = 0; i < n; i++) {
      out[i] += 1.6 * Math.sin(2 * Math.PI * 0.15 * (i / 250));
    }
  }
  if (lineNoise) {
    for (let i = 0; i < n; i++) {
      out[i] += 0.45 * Math.sin(2 * Math.PI * 50 * (i / 250));
    }
  }
  if (blinks) {
    const rand = mulberry32(seed);
    const blinkCount = 3;
    for (let b = 0; b < blinkCount; b++) {
      const center = Math.floor(rand() * (n - 60)) + 30;
      const width = 18;
      for (let i = -width; i <= width; i++) {
        if (center + i >= 0 && center + i < n) {
          out[center + i] += 4.5 * Math.exp(-(i * i) / (2 * 6 * 6));
        }
      }
    }
  }
  return out;
}

// EDA / Skin conductance: slow tonic baseline + a few SCRs.
function genEDA({ n = 1500, dt = 1 / 50, seed = 3, scrCount = 6, tonicBase = 4 }) {
  const out = new Float32Array(n);
  const rand = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const t = i * dt;
    out[i] = tonicBase
      + 0.6 * Math.sin(2 * Math.PI * 0.015 * t)
      + 0.3 * Math.sin(2 * Math.PI * 0.04 * t + 1.0);
  }
  const events = [];
  for (let k = 0; k < scrCount; k++) {
    const onset = 0.05 + rand() * 0.85;
    const amp = 0.6 + rand() * 1.3;
    events.push({ onset, amp });
  }
  events.sort((a, b) => a.onset - b.onset);
  for (const ev of events) {
    const onsetIdx = Math.floor(ev.onset * n);
    for (let i = onsetIdx; i < n; i++) {
      const tau = (i - onsetIdx) * dt;
      const wave = ev.amp * (1 - Math.exp(-tau / 0.75)) * Math.exp(-tau / 4.5);
      out[i] += wave;
      if (wave < 0.001 && tau > 1) break;
    }
  }
  for (let i = 0; i < n; i++) out[i] += (rand() - 0.5) * 0.04;
  return { signal: out, events };
}

// Decompose EDA into tonic + phasic (moving average estimate)
function decomposeEDA(signal, dt = 1 / 50) {
  const n = signal.length;
  const win = Math.floor(6 / dt);
  const tonic = new Float32Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += signal[i];
    if (i >= win) sum -= signal[i - win];
    tonic[i] = sum / Math.min(i + 1, win);
  }
  const tonicSmooth = new Float32Array(n);
  const sw = Math.floor(3 / dt);
  let s2 = 0;
  for (let i = 0; i < n; i++) {
    s2 += tonic[i];
    if (i >= sw) s2 -= tonic[i - sw];
    tonicSmooth[i] = s2 / Math.min(i + 1, sw);
  }
  const phasic = new Float32Array(n);
  for (let i = 0; i < n; i++) phasic[i] = signal[i] - tonicSmooth[i];
  return { tonic: tonicSmooth, phasic };
}

function detectSCRs(phasic, dt = 1 / 50, threshold = 0.1) {
  const n = phasic.length;
  const peaks = [];
  for (let i = 5; i < n - 5; i++) {
    let isPeak = phasic[i] > threshold;
    for (let k = -3; k <= 3 && isPeak; k++) {
      if (k !== 0 && phasic[i + k] > phasic[i]) isPeak = false;
    }
    if (isPeak) peaks.push({ idx: i, t: i * dt, amp: phasic[i] });
  }
  const filtered = [];
  let lastT = -10;
  for (const p of peaks) {
    if (p.t - lastT >= 1.5) {
      filtered.push(p);
      lastT = p.t;
    }
  }
  return filtered;
}

// Simple bandpass filter (1st-order RC cascade — illustrative).
function bandpass(signal, dt, lo, hi) {
  const n = signal.length;
  const RC_hi = 1 / (2 * Math.PI * lo);
  const a_hi = RC_hi / (RC_hi + dt);
  const hp = new Float32Array(n);
  let prevIn = signal[0], prevOut = 0;
  for (let i = 0; i < n; i++) {
    const out = a_hi * (prevOut + signal[i] - prevIn);
    hp[i] = out;
    prevOut = out;
    prevIn = signal[i];
  }
  const RC_lo = 1 / (2 * Math.PI * hi);
  const a_lo = dt / (RC_lo + dt);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    y = y + a_lo * (hp[i] - y);
    out[i] = y;
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────
// Path builders. polyPath = linear; smoothPath = Catmull-Rom cubic.
// ────────────────────────────────────────────────────────────────────

function polyPath(xs, ys) {
  let d = '';
  const n = xs.length;
  for (let i = 0; i < n; i++) {
    d += (i === 0 ? 'M' : 'L') + xs[i].toFixed(2) + ' ' + ys[i].toFixed(2) + ' ';
  }
  return d;
}

// Catmull-Rom → cubic bezier conversion. Tension 0.5 gives a clean smooth curve
// without overshoot. Used for the soft, ink-pen feel of clean traces.
function smoothPath(xs, ys, tension = 0.5) {
  const n = xs.length;
  if (n < 2) return '';
  const t = tension / 6;
  let d = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)} `;
  for (let i = 0; i < n - 1; i++) {
    const x0 = xs[i - 1] ?? xs[i];
    const y0 = ys[i - 1] ?? ys[i];
    const x1 = xs[i],     y1 = ys[i];
    const x2 = xs[i + 1], y2 = ys[i + 1];
    const x3 = xs[i + 2] ?? x2;
    const y3 = ys[i + 2] ?? y2;
    const cp1x = x1 + (x2 - x0) * t;
    const cp1y = y1 + (y2 - y0) * t;
    const cp2x = x2 - (x3 - x1) * t;
    const cp2y = y2 - (y3 - y1) * t;
    d += `C${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} `;
  }
  return d;
}

// ────────────────────────────────────────────────────────────────────
// Trace — reusable SVG line plot.
// ────────────────────────────────────────────────────────────────────

function Trace({
  signal, width = 800, height = 120, color = 'var(--c-ink)',
  strokeWidth = 1.6, padding = 8, range, gridColor,
  fillBelow = false, smooth = false, glow = false,
}) {
  const n = signal.length;
  let minV, maxV;
  if (range) { [minV, maxV] = range; }
  else {
    minV = Infinity; maxV = -Infinity;
    for (let i = 0; i < n; i++) {
      if (signal[i] < minV) minV = signal[i];
      if (signal[i] > maxV) maxV = signal[i];
    }
    if (maxV - minV < 0.001) { minV -= 1; maxV += 1; }
  }
  const innerH = height - 2 * padding;
  const innerW = width - 2 * padding;
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = padding + (i / (n - 1)) * innerW;
    ys[i] = padding + innerH - ((signal[i] - minV) / (maxV - minV)) * innerH;
  }
  const d = smooth ? smoothPath(xs, ys) : polyPath(xs, ys);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
         preserveAspectRatio="none" style={{ display: 'block' }}>
      {gridColor && (
        <g stroke={gridColor} strokeWidth="0.5" opacity="0.25">
          {[0.25, 0.5, 0.75].map((p) => (
            <line key={p} x1={padding} x2={width - padding}
                  y1={padding + innerH * p} y2={padding + innerH * p}
                  strokeDasharray="2 4" />
          ))}
        </g>
      )}
      {fillBelow && (
        <path d={d + ` L ${xs[n - 1].toFixed(2)} ${(height - padding).toFixed(2)} L ${xs[0].toFixed(2)} ${(height - padding).toFixed(2)} Z`}
              fill={color} opacity="0.10" />
      )}
      {glow && (
        <path d={d} fill="none" stroke={color}
              strokeWidth={strokeWidth * 4}
              strokeLinecap="round" strokeLinejoin="round"
              opacity="0.15" filter="blur(4px)" />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────
// AnimatedTrace — continuous-scroll oscilloscope.
// • Maintains a rolling buffer that shifts left and writes new samples on
//   the right each frame, like a real oscilloscope.
// • Lerps band weights toward target so changing bands transitions
//   smoothly (no abrupt waveform pop).
// • Uses smoothed bezier path for ink-pen feel.
// ────────────────────────────────────────────────────────────────────

function AnimatedTrace({
  weights, color, height = 120, speed = 1, seed = 7, noise = 0.4, glow = true,
}) {
  const N = 700;
  const SPS = 220; // samples per second of simulated signal time
  const targetRef = React.useRef(weights);
  const curRef = React.useRef({ ...weights });
  const phasesRef = React.useRef(null);
  const bufferRef = React.useRef(null);
  const noiseBufRef = React.useRef(null);
  const noiseIdxRef = React.useRef(0);
  const [, force] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => { targetRef.current = weights; }, [weights]);

  React.useEffect(() => {
    // Initialize buffer + phases once per (seed, noise) configuration.
    bufferRef.current = new Float32Array(N);
    const rand = mulberry32(seed);
    phasesRef.current = {};
    for (const b of BANDS) phasesRef.current[b.key] = rand() * Math.PI * 2;
    noiseBufRef.current = pinkNoise(N * 6, seed);
    noiseIdxRef.current = 0;

    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Lerp current weights toward target. tau ~ 0.18s — fast enough to feel
      // responsive when the user clicks a band, slow enough to be visibly smooth.
      const k = 1 - Math.exp(-dt / 0.18);
      for (const key of Object.keys(curRef.current)) {
        curRef.current[key] += (targetRef.current[key] - curRef.current[key]) * k;
      }

      // Append new samples on the right edge.
      const buf = bufferRef.current;
      const phases = phasesRef.current;
      const dxSec = dt * speed;
      const newSamples = Math.max(1, Math.round(dxSec * SPS));
      const sampleDt = dxSec / newSamples;
      for (let i = 0; i < N - newSamples; i++) buf[i] = buf[i + newSamples];
      for (let i = 0; i < newSamples; i++) {
        for (const b of BANDS) phases[b.key] += 2 * Math.PI * b.freq * sampleDt;
        let s = 0;
        for (const b of BANDS) {
          s += (curRef.current[b.key] || 0) * Math.sin(phases[b.key]);
        }
        const nb = noiseBufRef.current;
        s += nb[noiseIdxRef.current % nb.length] * noise * 3;
        noiseIdxRef.current++;
        buf[N - newSamples + i] = s;
      }
      force();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [seed, noise, speed]);

  if (!bufferRef.current) return <div style={{ height }} />;
  return (
    <Trace
      signal={bufferRef.current}
      color={color} height={height}
      range={[-3, 3]} strokeWidth={2}
      smooth glow={glow}
    />
  );
}

Object.assign(window, {
  BANDS, genEEG, addArtifacts, genEDA, decomposeEDA, detectSCRs, bandpass,
  Trace, AnimatedTrace, mulberry32, smoothPath, polyPath,
  TopBar,
});

// ─────────────────────────────────────────────────────────────────────
// TopBar — shared across sub-pages. Owns the Advanced toggle.
// ─────────────────────────────────────────────────────────────────────

function TopBar({ onBack, crumb, advanced, setAdvanced }) {
  return (
    <div className="topbar">
      <button className="topbar-back" onClick={onBack}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M10 3 L5 8 L10 13" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Syllabus
      </button>
      <div className="topbar-crumb">{crumb}</div>
      <div className="topbar-spacer" />
      {setAdvanced && (
        <label className={`adv-toggle ${advanced ? 'on' : ''}`}>
          <span className="adv-toggle-l">
            <span className="adv-toggle-eyebrow">Mode</span>
            <span className="adv-toggle-state">{advanced ? 'Advanced' : 'Beginner'}</span>
          </span>
          <span className="adv-toggle-track" role="switch" aria-checked={advanced}>
            <span className="adv-toggle-thumb" />
          </span>
          <input type="checkbox" checked={advanced}
                 onChange={(e) => setAdvanced(e.target.checked)}
                 style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );
}
