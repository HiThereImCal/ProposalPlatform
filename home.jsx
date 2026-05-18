// home.jsx — Study 3 proposal document for Karen.
// Single-scroll document. Cover → background → constructs → diagnosis →
// proposed trigger → experimental design → methods → references.

function HomeMap({ density, theme, onToggleTheme }) {
  const dt = 1 / 50;
  const [seed, setSeed] = React.useState(3);

  const { signal, events } = React.useMemo(
    () => genEDA({ n: 1500, dt, seed, scrCount: 7, tonicBase: 4.2 }),
    [seed]
  );
  const { tonic, phasic } = React.useMemo(() => decomposeEDA(signal, dt), [signal]);
  const scrs = React.useMemo(() => detectSCRs(phasic, dt, 0.18), [phasic]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="doc-root" data-density={density}>
      {/* Document top strip — QUB brand bar */}
      <div className="doc-topbar">
        <div className="doc-topbar-l">
          <span className="doc-topbar-wordmark">Queen&apos;s University Belfast</span>
          <span className="doc-topbar-divider" aria-hidden="true">·</span>
          <span className="doc-topbar-school">School of EEECS</span>
        </div>
        <div className="doc-topbar-r">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="12" y1="2" x2="12" y2="4.5" />
                  <line x1="12" y1="19.5" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="4.5" y2="12" />
                  <line x1="19.5" y1="12" x2="22" y2="12" />
                  <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
                  <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
                  <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
                  <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M20 14.5 A8.5 8.5 0 1 1 9.5 4 A6.8 6.8 0 0 0 20 14.5 Z"
                      fill="currentColor" />
              </svg>
            )}
            <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      <article className="doc">

        {/* ── COVER ─────────────────────────────────────────── */}
        <header className="doc-cover">
          <div className="doc-cover-eyebrow">Study 3 Proposal · Dual-register EDA trigger</div>
          <h1 className="doc-cover-title">
            One signal, two constructs.<br/>
            <em>A dual-register EDA trigger for adaptive XR mitigations.</em>
          </h1>
          <div className="doc-cover-byline">
            <div><span className="doc-byline-l">Author</span> Cal</div>
            <div><span className="doc-byline-l">Supervisor</span> Karen</div>
            <div><span className="doc-byline-l">Date</span> {today}</div>
          </div>
          <div className="doc-cover-rule" />
          <div className="doc-abstract">
            <div className="doc-abstract-tag">Abstract</div>
            <p>
              Studies 1 and 2 established that lightweight mitigations reduce MR
              cognitive load. The Study 2 bioadaptive trigger fires on raw EDA
              amplitude, but raw amplitude is functionally a noisy phasic detector:
              it crosses threshold on any fast rise in skin conductance regardless
              of whether the underlying construct is a sustained increase in
              cognitive load or discrete salience.
            </p>
            <p>
              The proposal upgrades the trigger by decomposing EDA into its tonic
              (SCL) and phasic (SCR) components and routing each construct to its
              own controller &mdash; tonic SCL drives sustained mitigations, phasic
              SCRs drive event-locked ones. A within-subjects four-condition design
              tests whether the dual register dissociates: raw threshold (control),
              phasic-only, tonic-only, and combined. The hypothesis is falsifiable
              under three distinct failure modes.
            </p>
          </div>
        </header>

        {/* ── § 1 BACKGROUND ─────────────────────────────────── */}
        <section className="doc-section">
          <h2 className="doc-h2"><span className="doc-h2-n">§ 1</span> Background &mdash; the EDA signal has two parts</h2>
          <div className="doc-body">
            <p>
              Electrodermal activity (EDA) is a single voltage trace from the palm
              or fingers, but the trace is a sum of two physiologically distinct
              processes. The <strong>tonic</strong> component (Skin Conductance
              Level, SCL) is a slow baseline driven by basal sympathetic drive to
              eccrine sweat glands. The <strong>phasic</strong> component (Skin
              Conductance Responses, SCRs) is a series of brief 1&ndash;5&thinsp;s
              peaks, each one a burst of skin sympathetic nerve activity triggered
              by a specific event &mdash; a stimulus, a startle, a thought, or
              spontaneous noise.
            </p>
            <p>
              Standard signal processing recovers the two components by low-passing
              the raw signal to estimate the tonic baseline, then subtracting it to
              expose the phasic peaks. Below, a synthetic 30&thinsp;s recording with
              seven stimulus events shows the decomposition live.
            </p>
          </div>

          <DecompositionDemo
            signal={signal} tonic={tonic} phasic={phasic} events={events} scrs={scrs}
            onReroll={() => setSeed(seed + 1)}
          />

          <div className="doc-adv-note">
            <span className="doc-adv-tag">Methods note</span>
            Decomposition shown here is a 6&thinsp;s moving-average tonic estimator
            with a 3&thinsp;s smoothing pass. Production pipelines should use a
            causal Kalman filter or sparse-online deconvolution; the offline
            standards (CDA, cvxEDA) are non-causal and add 3&ndash;6&thinsp;s
            latency, which is unsuitable for a real-time closed loop.
          </div>
        </section>

        {/* ── § 2 TWO CONSTRUCTS ─────────────────────────────── */}
        <section className="doc-section">
          <h2 className="doc-h2"><span className="doc-h2-n">§ 2</span> Two constructs, not two views of one signal</h2>
          <blockquote className="doc-pull">
            <p>
              Tonic and phasic activity are not different windows on the same
              construct &mdash; they index <em>different things</em>.
            </p>
            <p>
              Tonic SCL tracks <strong>sustained arousal and cognitive load</strong>{' '}
              over minutes. Phasic SCRs track{' '}
              <strong>discrete salience and orienting</strong> over seconds.
            </p>
          </blockquote>
          <div className="doc-body">
            <p>
              The autonomic substrates are dissociable, the canonical EDA
              literature treats them in separate chapters, and NeuroKit2&apos;s
              standard pipeline returns them as separate channels by design. The
              split is the field&apos;s default position, not a modelling choice.
            </p>
          </div>

          <ConstructTable />

          {/* SCR detection methods sub-section */}
          <h3 className="doc-h3"><span className="doc-h3-l">§ 2.1</span> SCR detection criteria</h3>
          <div className="doc-body">
            <p>
              An SCR is identified on the phasic channel as a local maximum
              satisfying:
            </p>
            <ul className="doc-rules">
              <li><strong>Amplitude</strong> &ge; threshold (0.01&ndash;0.05&thinsp;µS in convention; we use a higher threshold for demonstration)</li>
              <li><strong>Rise time</strong> approx. 1&ndash;3&thinsp;s from onset to peak</li>
              <li><strong>Recovery half-time</strong> approx. 2&ndash;10&thinsp;s</li>
              <li><strong>Refractory</strong> &ge; 1.5&thinsp;s between successive peaks; closer peaks are merged</li>
              <li><strong>Decomposition</strong>: overlapping SCRs require continuous decomposition analysis (CDA / cvxEDA); simple thresholding over-counts in dense ISI regimes</li>
              <li><strong>Reliability</strong>: amplitude internal consistency &alpha;&nbsp;&gt;&nbsp;0.8 requires roughly 30 trials; 5&ndash;15% of samples are non-responders (&lt; 2 NS-SCRs/min)</li>
            </ul>
          </div>
        </section>

        {/* ── § 3 DIAGNOSIS ──────────────────────────────────── */}
        <section className="doc-section">
          <h2 className="doc-h2"><span className="doc-h2-n">§ 3</span> The current trigger is the wrong shape for the construct</h2>
          <div className="doc-body">
            <p>
              The Study 2 trigger fires when raw skin conductance crosses an
              amplitude threshold. In practice this fires on any fast rise &mdash; a
              startle, a posture shift, a held breath, a non-specific SCR &mdash;
              regardless of whether the underlying construct is a sustained
              increase in cognitive load.
            </p>
          </div>

          <blockquote className="doc-pull doc-pull-warn">
            <p>
              The current system uses raw values as the cognitive load proxy.
              However, <strong>phasic SCRs do not index sustained load</strong>{' '}
              and are included in raw values, <em>potentially</em> affecting the
              accuracy of the trigger mechanism &mdash; phasic SCRs do not index
              sustained load.
            </p>
          </blockquote>

          <div className="doc-diag">
            <div className="doc-diag-cell doc-diag-problem">
              <div className="doc-diag-tag">Current trigger</div>
              <h3 className="doc-diag-h">A raw amplitude threshold is a noisy phasic detector.</h3>
              <p>
                Raw threshold crossings on a composite signal are dominated by
                phasic events. Treating those crossings as a load signal mismatches
                the construct: it asks phasic SCRs to do a job they cannot do, and
                produces the diminishing-returns pattern observed in Study 2.
              </p>
            </div>
            <div className="doc-diag-arrow" aria-hidden="true">→</div>
            <div className="doc-diag-cell doc-diag-fix">
              <div className="doc-diag-tag">Proposed trigger</div>
              <h3 className="doc-diag-h">Decompose. Route each construct to its own controller.</h3>
              <p>
                Tonic SCL drives the load channel and its sustained mitigations.
                Phasic SCRs drive event-locked mitigations, where their construct
                &mdash; discrete salience &mdash; is the right one to respond to.
                Neither channel is asked to substitute for the other.
              </p>
            </div>
          </div>
        </section>

        {/* ── § 4 PROPOSED SYSTEM ──────────────────────────── */}
        <section className="doc-section">
          <h2 className="doc-h2"><span className="doc-h2-n">§ 4</span> Proposed system &mdash; dual register, two controllers</h2>
          <div className="doc-body">
            <p>
              The proposed closed loop has two parallel registers consuming
              different parts of the decomposed signal. They drive different
              mitigation types on different timescales.
            </p>
          </div>

          <div className="doc-registers">
            <div className="doc-register doc-register-tonic">
              <div className="doc-reg-h">
                <span className="doc-reg-swatch" style={{ background: 'var(--c-blue)' }} />
                <span className="doc-reg-name">Tonic register</span>
                <span className="doc-reg-tag">slow loop · 30&ndash;90&thinsp;s window</span>
              </div>
              <p className="doc-reg-construct">
                Indexes <strong>sustained arousal and cognitive load</strong>.
              </p>
              <p className="doc-reg-body">
                Tracks tonic/SCL average values over a rolling window. Used to
                continuously adjust and/or trigger sustained mitigations &mdash;
                reducing cognitive load when participants show sustained tonic
                increases (a visible indicator of rising load), and increasing
                difficulty when tonic is stable over a long period (a calm,
                under-loaded participant).
              </p>
              <div className="doc-reg-drives">
                <span className="doc-reg-drives-l">Drives</span>
                scene dimming · ambient blur depth · difficulty scaling
              </div>
            </div>

            <div className="doc-register doc-register-phasic">
              <div className="doc-reg-h">
                <span className="doc-reg-swatch" style={{ background: 'var(--c-terra)' }} />
                <span className="doc-reg-name">Phasic register</span>
                <span className="doc-reg-tag">fast loop · per event</span>
              </div>
              <p className="doc-reg-construct">
                Indexes <strong>discrete salience and orienting</strong>.
              </p>
              <p className="doc-reg-body">
                Each detected SCR is a discrete event. If it falls within the 1&ndash;5&thinsp;s
                window after a known stimulus, it is attributed to that stimulus
                (ER-SCR) and fires event-locked mitigations. Outside the window it
                is treated as non-specific (NS-SCR) and contributed to the tonic
                covariate.
              </p>
              <div className="doc-reg-drives">
                <span className="doc-reg-drives-l">Drives</span>
                haptic confirmation · spotlight onset · branching cues · per-event logging
              </div>
            </div>
          </div>
        </section>

        {/* ── § 5 EXPERIMENTAL DESIGN ──────────────────────── */}
        <section className="doc-section">
          <h2 className="doc-h2"><span className="doc-h2-n">§ 5</span> Study 3 experimental design</h2>
          <div className="doc-body">
            <p>
              Within-subjects comparison of four trigger conditions against the
              Study 2 task baseline. Each condition tests a specific component of
              the dual-register hypothesis and can fail independently.
            </p>
          </div>

          <div className="doc-conditions">
            <div className="doc-cond doc-cond-c0">
              <div className="doc-cond-tl">
                <span className="doc-cond-code">C0</span>
                <span className="doc-cond-tag">control</span>
              </div>
              <h4 className="doc-cond-name">Raw EDA threshold</h4>
              <div className="doc-cond-sig">
                <span className="doc-reg-swatch" style={{ background: 'var(--c-ink-soft)' }} />
                raw amplitude → blanket mitigations
              </div>
              <p className="doc-cond-test">Replicates Study 2. Sets the floor every other condition must beat.</p>
            </div>

            <div className="doc-cond doc-cond-c1">
              <div className="doc-cond-tl">
                <span className="doc-cond-code">C1</span>
                <span className="doc-cond-tag">fast loop only</span>
              </div>
              <h4 className="doc-cond-name">Phasic SCR only</h4>
              <div className="doc-cond-sig">
                <span className="doc-reg-swatch" style={{ background: 'var(--c-terra)' }} />
                phasic → event-locked mitigations
              </div>
              <p className="doc-cond-test">
                <em>Falsifies if</em> C1 ≤ C0 &mdash; phasic detection adds nothing.
              </p>
            </div>

            <div className="doc-cond doc-cond-c2">
              <div className="doc-cond-tl">
                <span className="doc-cond-code">C2</span>
                <span className="doc-cond-tag">slow loop only</span>
              </div>
              <h4 className="doc-cond-name">Tonic SCL only</h4>
              <div className="doc-cond-sig">
                <span className="doc-reg-swatch" style={{ background: 'var(--c-blue)' }} />
                tonic → sustained mitigations
              </div>
              <p className="doc-cond-test">
                <em>Falsifies if</em> C2 ≤ C0 &mdash; SCL is not a viable load trigger here.
              </p>
            </div>

            <div className="doc-cond doc-cond-c3">
              <div className="doc-cond-tl">
                <span className="doc-cond-code">C3</span>
                <span className="doc-cond-tag">full dual register</span>
              </div>
              <h4 className="doc-cond-name">Phasic + Tonic</h4>
              <div className="doc-cond-sig">
                <span className="doc-reg-swatch" style={{ background: 'var(--c-blue)' }} />
                <span className="doc-reg-swatch" style={{ background: 'var(--c-terra)' }} />
                both → independent controllers
              </div>
              <p className="doc-cond-test">
                <em>Falsifies if</em> C3 ≈ C2 &mdash; phasic adds no marginal value.
              </p>
            </div>
          </div>

        </section>


      </article>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Decomposition demo — raw / tonic / phasic stacked traces
// ─────────────────────────────────────────────────────────────────────

function DecompositionDemo({ signal, tonic, phasic, events, scrs, onReroll }) {
  const totalSec = signal.length / 50;
  return (
    <div className="doc-demo">
      <div className="doc-demo-h">
        <span className="doc-demo-label">Fig. 1 &mdash; Live EDA decomposition</span>
        <span className="doc-demo-meta">
          {totalSec.toFixed(0)}&thinsp;s · {events.length} stimuli · {scrs.length} SCRs
        </span>
        <button className="doc-demo-reroll" onClick={onReroll}>
          ↻ new sample
        </button>
      </div>

      <div className="doc-demo-traces">
        <div className="doc-demo-trace">
          <div className="doc-demo-trace-tag">
            <span className="doc-trace-dot" style={{ background: 'var(--c-ink)' }} />
            Raw <span className="doc-demo-trace-unit">µS</span>
          </div>
          <div className="doc-demo-trace-body">
            <Trace signal={signal} color="var(--c-ink)" height={70}
                   range={[3, 8]} strokeWidth={1.4} smooth />
            <div className="doc-events">
              {events.map((ev, i) => (
                <div key={i} className="doc-evmark"
                     style={{ left: `${ev.onset * 100}%` }}>
                  <span className="doc-evlbl">S{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="doc-demo-trace">
          <div className="doc-demo-trace-tag">
            <span className="doc-trace-dot" style={{ background: 'var(--c-blue)' }} />
            Tonic SCL <span className="doc-demo-trace-unit">slow baseline</span>
          </div>
          <div className="doc-demo-trace-body">
            <Trace signal={tonic} color="var(--c-blue)" height={60}
                   range={[3.5, 6]} strokeWidth={2} smooth />
          </div>
        </div>

        <div className="doc-demo-trace">
          <div className="doc-demo-trace-tag">
            <span className="doc-trace-dot" style={{ background: 'var(--c-terra)' }} />
            Phasic SCR <span className="doc-demo-trace-unit">discrete peaks</span>
          </div>
          <div className="doc-demo-trace-body">
            <Trace signal={phasic} color="var(--c-terra)" height={70}
                   range={[-0.3, 1.6]} strokeWidth={1.6} smooth />
            <svg className="doc-peaks" viewBox="0 0 100 100" preserveAspectRatio="none">
              {scrs.map((p, i) => {
                const x = (p.idx / signal.length) * 100;
                const y = 100 - ((p.amp + 0.3) / 1.9) * 100;
                return (
                  <circle key={i} cx={x} cy={y} r="1.0"
                          fill="var(--c-terra)" stroke="var(--c-paper)"
                          strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="doc-demo-cap">
        <strong>S1&ndash;S{events.length}</strong> mark stimulus onsets on the raw
        trace. The tonic baseline drifts slowly across the recording and bears no
        consistent relationship to individual stimuli. The phasic channel produces
        discrete peaks, most of which fall within the 1&ndash;5&thinsp;s window
        following a stimulus (event-locked); the rest are non-specific SCRs.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Construct comparison table — restored, the centrepiece of § 2
// ─────────────────────────────────────────────────────────────────────

function ConstructTable() {
  return (
    <div className="doc-construct">
      <div className="doc-construct-h">
        <span className="doc-construct-h-row" />
        <span className="doc-construct-h-col doc-construct-tonic-h">
          <span className="doc-reg-swatch" style={{ background: 'var(--c-blue)' }} />
          Tonic SCL
        </span>
        <span className="doc-construct-h-col doc-construct-phasic-h">
          <span className="doc-reg-swatch" style={{ background: 'var(--c-terra)' }} />
          Phasic SCR
        </span>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">Indexes</div>
        <div>Sustained arousal · cognitive load · basal sympathetic tone</div>
        <div>Discrete orienting · salience · stimulus-evoked sympathetic bursts</div>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">Timescale</div>
        <div>Minutes to hours</div>
        <div>1&ndash;5&thinsp;s peaks; refractory ~1.5&thinsp;s</div>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">Substrate</div>
        <div>Basal sudomotor drive; central control via ventromedial PFC, hypothalamus</div>
        <div>Phasic skin sympathetic nerve bursts; cingulate and amygdala-driven</div>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">Use it for</div>
        <div>Sustained mitigations &mdash; dim, blur, difficulty, tempo</div>
        <div>Event-locked mitigations &mdash; haptic, spotlight, branching</div>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">Do <em>not</em> use it for</div>
        <div>Discrete events &mdash; SCL won&apos;t respond on a single trial</div>
        <div>Sustained increase in cognitive load &mdash; an SCR is a moment, not a state</div>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">Decomposition</div>
        <div>Low-pass &le; 0.05&thinsp;Hz; causal Kalman for real-time</div>
        <div>CDA or cvxEDA (offline, non-causal); causal Kalman / sparse deconvolution for real-time</div>
      </div>

      <div className="doc-construct-row">
        <div className="doc-construct-row-l">In NeuroKit2</div>
        <div><code>EDA_Tonic</code> &mdash; returned as its own channel</div>
        <div><code>EDA_Phasic</code> &mdash; returned as its own channel</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Logo mark
// ─────────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 16 Q8 8 12 16 T20 16 T28 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

Object.assign(window, { HomeMap });
