import { useState, useEffect } from "react";
import { useMicrophone } from "./useMicrophone";
import { Needle } from "./Needle";
import { Waveform } from "./Waveform";
import { StabilityChart } from "./StabilityChart";
import {
  INSTRUMENTS,
  matchString,
  type Instrument,
  type Tuning,
} from "./tunings";
import {
  playTone,
  stopTone,
  startMetronome,
  stopMetronome,
} from "./audioOutput";
import { usePWAInstaller } from "./usePWAInstaller";
import { PWAInstallBanner, IOSInstallHint } from "./PWAInstallBanner";
import "./App.css";

type Mode = "chromatic" | "instrument";

export default function App() {
  const [referenceA4, setReferenceA4] = useState(440);
  const {
    note,
    centsHistory,
    listening,
    error,
    volume,
    analyserNode,
    start,
    stop,
  } = useMicrophone(referenceA4);
  const [mode, setMode] = useState<Mode>("chromatic");
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(
    INSTRUMENTS[0],
  );
  const [selectedTuning, setSelectedTuning] = useState<Tuning>(
    INSTRUMENTS[0].tunings[0],
  );
  const [isStageMode, setIsStageMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── PWA install flow ────────────────────────────────────────────────────
  const { isReadyToInstall, isStandalone, triggerInstall } = usePWAInstaller();

  // Metronome state
  const [bpm, setBpm] = useState(120);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [playingToneHz, setPlayingToneHz] = useState<number | null>(null);

  useEffect(() => {
    if (metronomeOn) {
      startMetronome(bpm);
    } else {
      stopMetronome();
    }
    return () => stopMetronome();
  }, [metronomeOn, bpm]);

  const handleInstrumentChange = (inst: Instrument) => {
    setSelectedInstrument(inst);
    setSelectedTuning(inst.tunings[0]);
    setMode("instrument");
    setIsDrawerOpen(false);
  };

  const handleChromaticSelect = () => {
    setMode("chromatic");
    setIsDrawerOpen(false);
  };

  const toggleTone = (hz: number) => {
    const targetHz = hz * (referenceA4 / 440);
    if (playingToneHz === targetHz) {
      stopTone();
      setPlayingToneHz(null);
    } else {
      playTone(targetHz);
      setPlayingToneHz(targetHz);
    }
  };

  // Logic for tuning
  const chromaticInTune = note !== null && Math.abs(note.cents) < 5;
  const match =
    note && mode === "instrument"
      ? matchString(note.hz, selectedTuning, referenceA4)
      : null;
  const instrumentInTune = match !== null && Math.abs(match.cents) < 5;

  const activeCents =
    mode === "instrument" ? (match?.cents ?? 0) : (note?.cents ?? 0);
  const inTune = mode === "instrument" ? instrumentInTune : chromaticInTune;

  return (
    <div
      className={`app${isStageMode ? " stage-mode" : ""}${inTune && note ? " in-tune-bg" : ""}`}
    >
      {/* ── PWA Install Portal ── */}
      {isReadyToInstall && !isStandalone && !isStageMode && (
        <PWAInstallBanner onInstall={triggerInstall} />
      )}
      {!isStandalone && !isStageMode && <IOSInstallHint />}

      {!isStageMode && (
        <header>
          <h1>Tuner Free</h1>
          <p className="subtitle">Online Instrument Tuner</p>

          {/* ── Compact mode bar with drawer toggle ── */}
          <div className="mode-bar">
            {/* Current selection chip */}
            <div className="mode-chip" aria-live="polite">
              <span className="mode-chip-dot" aria-hidden="true" />
              <span>
                {mode === "chromatic"
                  ? "Chromatic"
                  : selectedInstrument.name}
              </span>
              {mode === "instrument" && selectedInstrument.tunings.length > 1 && (
                <span className="mode-chip-tuning">
                  &nbsp;· {selectedTuning.name}
                </span>
              )}
            </div>

            {/* Toggle button */}
            <button
              className={`drawer-toggle${isDrawerOpen ? " open" : ""}`}
              onClick={() => setIsDrawerOpen((v) => !v)}
              aria-expanded={isDrawerOpen}
              aria-controls="instrument-drawer"
              aria-label="Select instrument"
              id="drawer-toggle-btn"
            >
              <span className="drawer-toggle-label">Select</span>
              <svg
                className="drawer-toggle-icon"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2 4h12v1.5H2V4Zm2 3h8v1.5H4V7Zm2 3h4v1.5H6V10Z" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* ── Slide Drawer ── */}
      {!isStageMode && (
        <>
          {/* Backdrop */}
          <div
            className={`drawer-backdrop${isDrawerOpen ? " visible" : ""}`}
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <nav
            id="instrument-drawer"
            className={`instrument-drawer${isDrawerOpen ? " open" : ""}`}
            aria-label="Instrument selector"
          >
            <div className="drawer-header">
              <span className="drawer-title">Select Mode</span>
              <button
                className="drawer-close"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close instrument selector"
                id="drawer-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {/* Chromatic */}
              <div className="drawer-section">
                <p className="drawer-section-label">Chromatic</p>
                <button
                  className={`drawer-item${mode === "chromatic" ? " active" : ""}`}
                  onClick={handleChromaticSelect}
                  id="drawer-chromatic-btn"
                >
                  <span className="drawer-item-name">Chromatic</span>
                  <span className="drawer-item-desc">All 12 notes</span>
                  {mode === "chromatic" && (
                    <svg className="drawer-check" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Thai Instruments */}
              <div className="drawer-section">
                <p className="drawer-section-label">
                  <span className="drawer-section-icon">🎵</span> เครื่องดนตรีไทย
                </p>
                {INSTRUMENTS.filter((i) => i.category === "thai").map((inst) => (
                  <button
                    key={inst.id}
                    className={`drawer-item${
                      mode === "instrument" && selectedInstrument.id === inst.id
                        ? " active"
                        : ""
                    }`}
                    onClick={() => handleInstrumentChange(inst)}
                    id={`drawer-inst-${inst.id}`}
                  >
                    <span className="drawer-item-name">{inst.name}</span>
                    <span className="drawer-item-desc">
                      {inst.tunings.length > 1
                        ? `${inst.tunings.length} ทาง`
                        : inst.tunings[0].strings.length + " สาย"}
                    </span>
                    {mode === "instrument" && selectedInstrument.id === inst.id && (
                      <svg className="drawer-check" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* International Instruments */}
              <div className="drawer-section drawer-section--intl">
                <p className="drawer-section-label">
                  <span className="drawer-section-icon">🎸</span> International
                </p>
                {INSTRUMENTS.filter((i) => i.category === "international").map((inst) => (
                  <button
                    key={inst.id}
                    className={`drawer-item${
                      mode === "instrument" && selectedInstrument.id === inst.id
                        ? " active"
                        : ""
                    }`}
                    onClick={() => handleInstrumentChange(inst)}
                    id={`drawer-inst-${inst.id}`}
                  >
                    <span className="drawer-item-name">{inst.name}</span>
                    <span className="drawer-item-desc">
                      {inst.tunings.length > 1
                        ? `${inst.tunings.length} tunings`
                        : inst.tunings[0].strings.length + " strings"}
                    </span>
                    {mode === "instrument" && selectedInstrument.id === inst.id && (
                      <svg className="drawer-check" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {/* Calibration */}
              <div className="drawer-section drawer-section--calibration">
                <p className="drawer-section-label">Reference Pitch</p>
                <div className="drawer-calibration">
                  <span className="drawer-calibration-value">A4 = {referenceA4} Hz</span>
                  <input
                    id="a4-range"
                    type="range"
                    min="410"
                    max="450"
                    value={referenceA4}
                    onChange={(e) => setReferenceA4(parseInt(e.target.value))}
                    aria-label="Reference pitch A4 calibration"
                    className="drawer-calibration-slider"
                  />
                </div>
              </div>
            </div>
          </nav>
        </>
      )}

      {isStageMode && (
        <button
          className="exit-stage-btn"
          onClick={() => setIsStageMode(false)}
        >
          ✕ Exit Stage Mode
        </button>
      )}

      <main>
        <section aria-label="Tuning Interface">
          {/* ── Display Panel ── */}
          <div className="display-area">
            {mode === "chromatic" ? (
              <div className="note-display-row">
                <div className={`note-display${inTune ? " in-tune" : ""}`}>
                  {note ? (
                    <>
                      <span className="note-name">{note.note}</span>
                      <span className="note-octave">{note.octave}</span>
                    </>
                  ) : (
                    <span className="note-name dim">—</span>
                  )}
                </div>
                <div className="hz-display">
                  {note ? `${note.hz.toFixed(2)} Hz` : "— Hz"}
                </div>
              </div>
            ) : (
              <>
                {!isStageMode && selectedInstrument.tunings.length > 1 && (
                  <div className="tuning-selector">
                    {selectedInstrument.tunings.map((t) => (
                      <button
                        key={t.id}
                        className={`tuning-btn${selectedTuning.id === t.id ? " active" : ""}`}
                        onClick={() => setSelectedTuning(t)}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="note-display-row">
                  <h2 className="instrument-title">
                    {selectedInstrument.name}
                  </h2>
                  {!isStageMode && (
                    <div className="hz-display">
                      {note ? `${note.hz.toFixed(2)} Hz` : "— Hz"}
                    </div>
                  )}
                </div>

                <div className="string-cards">
                  {selectedTuning.strings.map((s, i) => {
                    const isActive = match?.index === i;
                    const cents = isActive ? match!.cents : null;
                    const cardInTune = cents !== null && Math.abs(cents) < 5;
                    const targetHz = s.hz * (referenceA4 / 440);
                    const isPlaying = playingToneHz === targetHz;

                    return (
                      <div
                        key={i}
                        className={`string-card${isActive && note ? " active" : ""}${cardInTune ? " in-tune" : ""}${isPlaying ? " playing" : ""}`}
                        onClick={() => !isStageMode && toggleTone(s.hz)}
                        role="button"
                        tabIndex={0}
                        aria-label={`String ${s.label} — ${s.note}`}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !isStageMode && toggleTone(s.hz)
                        }
                      >
                        <span className="string-label">{s.label}</span>
                        <span className="string-note">{s.note}</span>
                        {!isStageMode && (
                          <span className="string-hz">
                            {targetHz.toFixed(1)} Hz
                          </span>
                        )}
                        <span className="string-cents">
                          {isActive && note
                            ? `${cents! > 0 ? "+" : ""}${Math.round(cents!)} ¢`
                            : isPlaying
                              ? "♪"
                              : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Needle always inside panel */}
            <div className="needle-wrap" aria-hidden="true">
              <Needle cents={activeCents} />
            </div>

            <div
              className={`badge${inTune && note ? " visible" : ""}`}
              role="status"
            >
              IN TUNE ✓
            </div>

            {!isStageMode && centsHistory.length > 0 && (
              <StabilityChart history={centsHistory} />
            )}

            {!isStageMode && (
              <div
                className="visualizer-area"
                style={{ padding: "0 16px 16px" }}
              >
                <Waveform analyser={analyserNode} />
                <div className="vol-bar-wrap" aria-label="Volume Level">
                  <div
                    className="vol-bar"
                    style={{ width: `${Math.min(100, volume * 300)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <div className="controls">
            <button
              className={`btn ${listening ? "btn-stop" : "btn-start"}`}
              onClick={listening ? stop : start}
            >
              {listening ? "Stop Tuner" : "Start Tuner"}
            </button>
            {!listening && !isStageMode && (
              <p className="hint">Allow microphone access when prompted</p>
            )}
          </div>
        </section>

        {!isStageMode && (
          <button
            className="stage-toggle-btn"
            onClick={() => setIsStageMode(true)}
          >
            Stage Mode
          </button>
        )}

        {/* Metronome Section */}
        {!isStageMode && (
          <section className="metronome-section" aria-label="Metronome">
            <div className="metronome-header">
              <h3>Metronome</h3>
              <button
                className={`btn-metro ${metronomeOn ? "active" : ""}`}
                onClick={() => setMetronomeOn(!metronomeOn)}
                aria-pressed={metronomeOn}
              >
                {metronomeOn ? "Stop" : "Start"}
              </button>
            </div>
            <div className="metronome-controls">
              <div className="bpm-display" aria-live="polite">
                {bpm}{" "}
                <span
                  style={{
                    fontSize: "0.6em",
                    color: "var(--text-3)",
                    fontWeight: 500,
                  }}
                >
                  BPM
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="208"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                aria-label="Tempo in BPM"
              />
            </div>
          </section>
        )}

        {!isStageMode && (
          <section className="seo-content">
            <article>
              <h2>Free Online Instrument Tuner</h2>
              <p>
                Tune your Guitar, Violin, Bass, Ukulele, Cello, and traditional
                Thai instruments directly in your browser — no app download
                needed. Tuner Free uses high-precision pitch detection to help
                you achieve perfect intonation in real time.
              </p>
              <ul className="feature-list">
                <li>
                  <strong>Accurate:</strong> Precision within 1 cent using the
                  Pitchy algorithm.
                </li>
                <li>
                  <strong>Fast:</strong> Real-time response with visual waveform
                  and stability chart.
                </li>
                <li>
                  <strong>Private:</strong> All audio stays on your device.
                  Nothing is sent to any server.
                </li>
                <li>
                  <strong>Free:</strong> No ads, no subscriptions, no sign-up
                  required.
                </li>
              </ul>
            </article>

            <article>
              <h2>Supported Instruments</h2>

              <section className="instrument-desc">
                <h3>Guitar Tuner</h3>
                <p>
                  Tune your acoustic or electric guitar in Standard (E A D G B
                  e) or Drop D tuning. Each string card lights up when your
                  pitch is close, turning green when you're in tune.
                </p>
              </section>

              <section className="instrument-desc">
                <h3>Violin Tuner</h3>
                <p>
                  Tune your violin in Standard tuning (G D A E). The real-time
                  needle and stability chart help you find and hold each pitch
                  accurately.
                </p>
              </section>

              <section className="instrument-desc">
                <h3>Bass Tuner</h3>
                <p>
                  Tune your bass guitar in Standard tuning (E A D G). The
                  low-frequency pitch detection is optimized to handle bass
                  strings accurately.
                </p>
              </section>

              <section className="instrument-desc">
                <h3>Thai Instrument Tuner (ซออู้, ซอด้วง, ซอสามสาย)</h3>
                <p>
                  Tuner Free is one of the few online tuners with dedicated
                  support for Thai classical instruments. Tune ซออู้ (Sao U) in
                  four tunings — ทางเพียงออ, ทางกลาง, ทางนอก, and ทางใน — as
                  well as ซอด้วง (Sao Duang) and ซอสามสาย (Sao Sam Sai).
                </p>
              </section>
            </article>

            <article className="faq-section">
              <h2>Frequently Asked Questions</h2>

              <details className="faq-item">
                <summary>Is Tuner Free really free to use?</summary>
                <p>
                  Yes, completely free. No ads, no subscriptions, no sign-up
                  required. Just open the website and start tuning.
                </p>
              </details>

              <details className="faq-item">
                <summary>Does Tuner Free work on mobile?</summary>
                <p>
                  Yes. It works on all modern browsers including mobile browsers
                  on iOS and Android. Just allow microphone access when
                  prompted.
                </p>
              </details>

              <details className="faq-item">
                <summary>Does my audio get sent to a server?</summary>
                <p>
                  No. All audio processing happens entirely on your device using
                  the Web Audio API. Your microphone audio is never uploaded
                  anywhere, ensuring complete privacy.
                </p>
              </details>

              <details className="faq-item">
                <summary>Can I tune Thai instruments with Tuner Free?</summary>
                <p>
                  Yes! Tuner Free has dedicated modes for ซออู้, ซอด้วง, and
                  ซอสามสาย — with multiple tunings for ซออู้ including
                  ทางเพียงออ, ทางกลาง, ทางนอก, and ทางใน.
                </p>
              </details>

              <details className="faq-item">
                <summary>How accurate is the tuner?</summary>
                <p>
                  Tuner Free uses the Pitchy pitch detection algorithm with
                  accuracy within 1 cent. The stability chart lets you see how
                  steady your pitch is over time.
                </p>
              </details>
            </article>
          </section>
        )}
      </main>

      <footer>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Tuner Free · Free Online Chromatic Tuner
        </p>
        <p className="footer-credit">
          Created by{" "}
          <a
            href="https://www.linkedin.com/in/kridsada-bunta/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Kridsada
          </a>
          {" · "}
          <a
            href="https://github.com/kridsadaa/tuner-free"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <svg
              className="footer-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {" "}GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
