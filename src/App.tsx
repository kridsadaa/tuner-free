import { useState } from 'react';
import { useMicrophone } from './useMicrophone';
import { Needle } from './Needle';
import { Waveform } from './Waveform';
import { SAO_U_TUNINGS, matchString, type SaoUTuning } from './saoU';
import './App.css';

type Mode = 'chromatic' | 'sao-u';

export default function App() {
  const { note, listening, error, volume, analyserNode, start, stop } = useMicrophone();
  const [mode, setMode] = useState<Mode>('chromatic');
  const [tuning, setTuning] = useState<SaoUTuning>(SAO_U_TUNINGS[0]);

  // Chromatic mode values
  const chromaticInTune = note !== null && Math.abs(note.cents) < 5;

  // ซออู้ mode values
  const match = note ? matchString(note.hz, tuning) : null;
  const saoInTune = match !== null && Math.abs(match.cents) < 5;
  const activeCents = mode === 'sao-u' ? (match?.cents ?? 0) : (note?.cents ?? 0);
  const inTune = mode === 'sao-u' ? saoInTune : chromaticInTune;

  return (
    <div className="app">
      <header>
        <h1>Tuner</h1>
        <p className="subtitle">Free · No ads · Client-side only</p>
      </header>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn${mode === 'chromatic' ? ' active' : ''}`}
          onClick={() => setMode('chromatic')}
        >
          Chromatic
        </button>
        <button
          className={`mode-btn${mode === 'sao-u' ? ' active' : ''}`}
          onClick={() => setMode('sao-u')}
        >
          ซออู้
        </button>
      </div>

      <main>
        {mode === 'chromatic' ? (
          <>
            {/* Chromatic note display */}
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
          </>
        ) : (
          <>
            {/* ซออู้ tuning selector */}
            <div className="tuning-selector">
              {SAO_U_TUNINGS.map((t) => (
                <button
                  key={t.id}
                  className={`tuning-btn${tuning.id === t.id ? ' active' : ''}`}
                  onClick={() => setTuning(t)}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* String cards */}
            <div className="string-cards">
              {tuning.strings.map((s, i) => {
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

            {/* Current detected hz */}
            <div className="hz-display">
              {note ? `${note.hz.toFixed(2)} Hz` : '— Hz'}
            </div>
          </>
        )}

        {/* Needle — always shown */}
        <div className="needle-wrap">
          <Needle cents={activeCents} />
        </div>

        <div className={`badge${inTune && note ? ' visible' : ''}`}>
          IN TUNE ✓
        </div>

        <Waveform analyser={analyserNode} />

        <div className="vol-bar-wrap">
          <div className="vol-bar" style={{ width: `${Math.min(100, volume * 300)}%` }} />
        </div>

        {error && <p className="error">{error}</p>}

        <button
          className={`btn ${listening ? 'btn-stop' : 'btn-start'}`}
          onClick={listening ? stop : start}
        >
          {listening ? 'Stop' : 'Start Tuner'}
        </button>

        {!listening && <p className="hint">Tap "Start Tuner" and allow microphone</p>}
      </main>

      <footer>
        <p>ซออู้ · Guitar · Violin · Bass · Any instrument</p>
      </footer>
    </div>
  );
}
