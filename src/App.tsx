import { useState } from 'react';
import { useMicrophone } from './useMicrophone';
import { Needle } from './Needle';
import { Waveform } from './Waveform';
import { INSTRUMENTS, matchString, type Instrument, type Tuning } from './tunings';
import './App.css';

type Mode = 'chromatic' | 'instrument';

export default function App() {
  const { note, listening, error, volume, analyserNode, start, stop } = useMicrophone();
  const [mode, setMode] = useState<Mode>('chromatic');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(INSTRUMENTS[0]);
  const [selectedTuning, setSelectedTuning] = useState<Tuning>(INSTRUMENTS[0].tunings[0]);

  const handleInstrumentChange = (inst: Instrument) => {
    setSelectedInstrument(inst);
    setSelectedTuning(inst.tunings[0]);
    setMode('instrument');
  };

  // Logic for tuning
  const chromaticInTune = note !== null && Math.abs(note.cents) < 5;
  const match = note && mode === 'instrument' ? matchString(note.hz, selectedTuning) : null;
  const instrumentInTune = match !== null && Math.abs(match.cents) < 5;

  const activeCents = mode === 'instrument' ? (match?.cents ?? 0) : (note?.cents ?? 0);
  const inTune = mode === 'instrument' ? instrumentInTune : chromaticInTune;

  return (
    <div className="app">
      <header>
        <h1>Tuner Free</h1>
        <p className="subtitle">Instrument Tuner · No ads · Client-side only</p>
        <nav className="mode-toggle">
          <button
            className={`mode-btn${mode === 'chromatic' ? ' active' : ''}`}
            onClick={() => setMode('chromatic')}
          >
            Chromatic
          </button>
          <div className="instrument-select-wrap">
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
        </nav>
      </header>

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
              {selectedInstrument.tunings.length > 1 && (
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
                  return (
                    <div
                      key={i}
                      className={`string-card${isActive && note ? ' active' : ''}${cardInTune ? ' in-tune' : ''}`}
                    >
                      <span className="string-label">{s.label}</span>
                      <span className="string-note">{s.note}</span>
                      <span className="string-hz">{s.hz.toFixed(1)} Hz</span>
                      <span className="string-cents">
                        {isActive && note
                          ? `${cents! > 0 ? '+' : ''}${Math.round(cents!)} ¢`
                          : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="hz-display">
                {note ? `${note.hz.toFixed(2)} Hz` : '— Hz'}
              </div>
            </div>
          )}

          <div className="needle-wrap" aria-hidden="true">
            <Needle cents={activeCents} />
          </div>

          <div className={`badge${inTune && note ? ' visible' : ''}`} role="status">
            IN TUNE ✓
          </div>

          <div className="visualizer-area">
            <Waveform analyser={analyserNode} />
            <div className="vol-bar-wrap" aria-label="Volume Level">
              <div className="vol-bar" style={{ width: `${Math.min(100, volume * 300)}%` }} />
            </div>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="controls">
            <button
              className={`btn ${listening ? 'btn-stop' : 'btn-start'}`}
              onClick={listening ? stop : start}
            >
              {listening ? 'Stop' : 'Start Tuner'}
            </button>
            {!listening && <p className="hint">Tap "Start Tuner" and allow microphone</p>}
          </div>
        </section>

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
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Tuner Free · Chromatic Tuner for All Instruments</p>
      </footer>
    </div>
  );
}
