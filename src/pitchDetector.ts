// YIN pitch detection algorithm
export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const bufferSize = buffer.length;
  const halfSize = Math.floor(bufferSize / 2);
  const yinBuffer = new Float32Array(halfSize);

  // Step 1: difference function
  for (let tau = 0; tau < halfSize; tau++) {
    yinBuffer[tau] = 0;
    for (let j = 0; j < halfSize; j++) {
      const delta = buffer[j] - buffer[j + tau];
      yinBuffer[tau] += delta * delta;
    }
  }

  // Step 2: cumulative mean normalized difference
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = (yinBuffer[tau] * tau) / runningSum;
  }

  // Step 3: absolute threshold with parabolic interpolation
  const threshold = 0.15;
  for (let tau = 2; tau < halfSize; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      const better = parabolicInterpolation(yinBuffer, tau);
      return sampleRate / better;
    }
  }

  return null;
}

function parabolicInterpolation(array: Float32Array, x: number): number {
  const x0 = x < 1 ? x : x - 1;
  const x2 = x + 1 < array.length ? x + 1 : x;
  if (x0 === x) return array[x] <= array[x2] ? x : x2;
  if (x2 === x) return array[x] <= array[x0] ? x : x0;
  const s0 = array[x0];
  const s1 = array[x];
  const s2 = array[x2];
  return x + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface NoteInfo {
  note: string;
  octave: number;
  hz: number;
  cents: number; // -50 to +50
}

export function frequencyToNote(hz: number): NoteInfo {
  const A4 = 440;
  const semitones = 12 * Math.log2(hz / A4);
  const roundedSemitones = Math.round(semitones);
  const cents = (semitones - roundedSemitones) * 100;

  // A4 is midi note 69
  const midi = roundedSemitones + 69;
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = ((midi % 12) + 12) % 12;

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    hz,
    cents,
  };
}
