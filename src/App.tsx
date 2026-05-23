import { useState, useEffect } from 'react';
import { useMicrophone } from './useMicrophone';
import { Needle } from './Needle';
import { Waveform } from './Waveform';
import { StabilityChart } from './StabilityChart';
import { INSTRUMENTS, matchString, type Instrument, type Tuning } from './tunings';
import { playTone, stopTone, startMetronome, stopMetronome } from './audioOutput';
import './App.css';

type Mode = 'chromatic' | 'instrument';

export default function App() {
  const [referenceA4, setReferenceA4] = useState(440);
  const { note, centsHistory, listening, error, volume, analyserNode, start, stop } = useMicrophone(referenceA4);
  const [mode, setMode] = useState<Mode>('chromatic');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(INSTRUMENTS[0]);
  const [selectedTuning, setSelectedTuning] = useState<Tuning>(INSTRUMENTS[0].tunings[0]);
  const [isStageMode, setIsStageMode] = useState(false);

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
    setMode('instrument');
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
  const match = note && mode === 'instrument' ? matchString(note.hz, selectedTuning, referenceA4) : null;
  const instrumentInTune = match !== null && Math.abs(match.cents) < 5;

  const activeCents = mode === 'instrument' ? (match?.cents ?? 0) : (note?.cents ?? 0);
  const inTune = mode === 'instrument' ? instrumentInTune : chromaticInTune;

  return (
    <div className={`app${isStageMode ? ' stage-mode' : ''}${inTune && note ? ' in-tune-bg' : ''}`}>
      {!isStageMode && (
        <header>
          <h1>Tuner Free</h1>
          <p className="subtitle">Online Instrument Tuner</p>
          
          <nav className="nav-container">
            <div className="main-modes">
              <button
                className={`mode-btn${mode === 'chromatic' ? ' active' : ''}`}
                onClick={() => setMode('chromatic')}
              >
                Chromatic
              </button>
              <span className="nav-divider"></span>
              <div className="instrument-list">
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.id}
                    className={`mode-btn${mode === 'instrument' && selectedInstrument.id === inst.id ? ' active' : ''}`}
                    onClick={() => handleInstrumentChange(inst)}
                  >
                    {inst.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="calibration-wrap">
            <label>A4 = {referenceA4}Hz</label>
            <input
              type="range"
              min="410"
              max="450"
              value={referenceA4}
              onChange={(e) => setReferenceA4(parseInt(e.target.value))}
            />
          </div>
        </header>
      )}

      {isStageMode && (
        <button className="exit-stage-btn" onClick={() => setIsStageMode(false)}>
          ✕ Exit Stage Mode
        </button>
      )}

      <main>
        <section aria-label="Tuning Interface">
          {mode === 'chromatic' ? (
            <div className="display-area">
              <div className={`note-display${inTune ? ' in-tune' : ''}`}>
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
                {note ? `${note.hz.toFixed(2)} Hz` : '— Hz'}
              </div>
            </div>
          ) : (
            <div className="display-area">
              <h2 className="instrument-title">{selectedInstrument.name}</h2>
              {!isStageMode && selectedInstrument.tunings.length > 1 && (
                <div className="tuning-selector">
                  {selectedInstrument.tunings.map((t) => (
                    <button
                      key={t.id}
                      className={`tuning-btn${selectedTuning.id === t.id ? ' active' : ''}`}
                      onClick={() => setSelectedTuning(t)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}

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
                      className={`string-card${isActive && note ? ' active' : ''}${cardInTune ? ' in-tune' : ''}${isPlaying ? ' playing' : ''}`}
                      onClick={() => !isStageMode && toggleTone(s.hz)}
                    >
                      <span className="string-label">{s.label}</span>
                      <span className="string-note">{s.note}</span>
                      {!isStageMode && <span className="string-hz">{targetHz.toFixed(1)} Hz</span>}
                      <span className="string-cents">
                        {isActive && note
                          ? `${cents! > 0 ? '+' : ''}${Math.round(cents!)} ¢`
                          : isPlaying ? '🔊' : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!isStageMode && (
                <div className="hz-display">
                  {note ? `${note.hz.toFixed(2)} Hz` : '— Hz'}
                </div>
              )}
            </div>
          )}

          <div className="needle-wrap" aria-hidden="true">
            <Needle cents={activeCents} />
          </div>

          {!isStageMode && centsHistory.length > 0 && (
            <StabilityChart history={centsHistory} />
          )}

          <div className={`badge${inTune && note ? ' visible' : ''}`} role="status">
            IN TUNE ✓
          </div>

          {!isStageMode && (
            <div className="visualizer-area">
              <Waveform analyser={analyserNode} />
              <div className="vol-bar-wrap" aria-label="Volume Level">
                <div className="vol-bar" style={{ width: `${Math.min(100, volume * 300)}%` }} />
              </div>
            </div>
          )}

          {error && <p className="error" role="alert">{error}</p>}

          <div className="controls">
            <button
              className={`btn ${listening ? 'btn-stop' : 'btn-start'}`}
              onClick={listening ? stop : start}
            >
              {listening ? 'Stop' : 'Start Tuner'}
            </button>
            {!listening && !isStageMode && <p className="hint">Tap "Start Tuner" and allow microphone</p>}
          </div>
        </section>

        {!isStageMode && (
          <button className="stage-toggle-btn" onClick={() => setIsStageMode(true)}>
            🎭 Enable Stage Mode (Big & Clear)
          </button>
        )}

        {/* Metronome Section */}
        {!isStageMode && (
          <section className="metronome-section">
            <h3>Metronome</h3>
            <div className="metronome-controls">
              <div className="bpm-display">{bpm} BPM</div>
              <input
                type="range"
                min="40"
                max="208"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
              />
              <button 
                className={`btn-metro ${metronomeOn ? 'active' : ''}`}
                onClick={() => setMetronomeOn(!metronomeOn)}
              >
                {metronomeOn ? 'STOP' : 'START'}
              </button>
            </div>
          </section>
        )}

        {!isStageMode && (
          <section className="seo-content">
            <article>
              <h2>Free Online Instrument Tuner</h2>
              <p>
                Tune your Guitar, Violin, Bass, Ukulele, and traditional Thai instruments like Sao U
                directly in your browser. Our tuner uses high-precision pitch detection to help you
                achieve perfect intonation.
              </p>
              <ul>
                <li><strong>Accurate:</strong> Precision within 1 cent.</li>
                <li><strong>Fast:</strong> Real-time response with visual feedback.</li>
                <li><strong>Private:</strong> All audio processing happens on your device. No data is sent to any server.</li>
              </ul>
            </article>
          </section>
        )}
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Tuner Free · Chromatic Tuner for All Instruments</p>
      </footer>
    </div>
  );
}
