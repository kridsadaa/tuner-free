import { useMicrophone } from './useMicrophone';
import { Needle } from './Needle';
import { Waveform } from './Waveform';
import './App.css';

export default function App() {
  const { note, listening, error, volume, analyserNode, start, stop } = useMicrophone();

  const inTune = note !== null && Math.abs(note.cents) < 5;

  return (
    <div className="app">
      <header>
        <h1>Tuner</h1>
        <p className="subtitle">Free · No ads · Client-side only</p>
      </header>

      <main>
        {/* Note display */}
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

        {/* Hz display */}
        <div className="hz-display">
          {note ? `${note.hz.toFixed(2)} Hz` : '— Hz'}
        </div>

        {/* Needle gauge */}
        <div className="needle-wrap">
          <Needle cents={note?.cents ?? 0} />
        </div>

        {/* In-tune badge */}
        <div className={`badge${inTune ? ' visible' : ''}`}>
          IN TUNE ✓
        </div>

        {/* Waveform */}
        <Waveform analyser={analyserNode} />

        {/* Volume bar */}
        <div className="vol-bar-wrap">
          <div
            className="vol-bar"
            style={{ width: `${Math.min(100, volume * 300)}%` }}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button
          className={`btn ${listening ? 'btn-stop' : 'btn-start'}`}
          onClick={listening ? stop : start}
        >
          {listening ? 'Stop' : 'Start Tuner'}
        </button>

        {!listening && (
          <p className="hint">Tap "Start Tuner" and allow microphone</p>
        )}
      </main>

      <footer>
        <p>ซออู้ · Guitar · Violin · Bass · Any instrument</p>
      </footer>
    </div>
  );
}
