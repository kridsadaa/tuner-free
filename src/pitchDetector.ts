import { PitchDetector } from 'pitchy';

export interface NoteInfo {
  note: string;
  octave: number;
  hz: number;
  cents: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let detector: PitchDetector<Float32Array> | null = null;

export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  if (!detector || detector.inputLength !== buffer.length) {
    detector = PitchDetector.forFloat32Array(buffer.length);
  }
  const [pitch, clarity] = detector.findPitch(buffer, sampleRate);
  // clarity > 0.9 = confident detection
  if (clarity < 0.9 || pitch < 60 || pitch > 2000) return null;
  return pitch;
}

export function frequencyToNote(hz: number, referenceA4: number = 440): NoteInfo {
  const semitones = 12 * Math.log2(hz / referenceA4);
  const rounded = Math.round(semitones);
  const cents = (semitones - rounded) * 100;
  const midi = rounded + 69;
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = ((midi % 12) + 12) % 12;
  return { note: NOTE_NAMES[noteIndex], octave, hz, cents };
}
