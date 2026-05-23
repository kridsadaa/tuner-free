let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// --- Tone Generator ---
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

export function playTone(freq: number) {
  const ctx = getAudioContext();
  stopTone();

  oscillator = ctx.createOscillator();
  gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
}

export function stopTone() {
  if (oscillator && gainNode) {
    const ctx = getAudioContext();
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    oscillator.stop(ctx.currentTime + 0.1);
    oscillator = null;
    gainNode = null;
  }
}

// --- Metronome ---
let metronomeInterval: number | null = null;
let nextNoteTime = 0.0;
const lookahead = 25.0; // How frequently to call scheduling function (ms)
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

function nextNote(bpm: number) {
  const secondsPerBeat = 60.0 / bpm;
  nextNoteTime += secondsPerBeat;
}

function scheduleNote(time: number) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();

  osc.frequency.value = 880;
  envelope.gain.value = 0.5;
  envelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  osc.connect(envelope);
  envelope.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.1);
}

function scheduler(bpm: number) {
  const ctx = getAudioContext();
  while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
    scheduleNote(nextNoteTime);
    nextNote(bpm);
  }
}

export function startMetronome(bpm: number) {
  const ctx = getAudioContext();
  if (metronomeInterval) return;

  if (ctx.state === 'suspended') ctx.resume();

  nextNoteTime = ctx.currentTime + 0.05;
  metronomeInterval = window.setInterval(() => scheduler(bpm), lookahead);
}

export function stopMetronome() {
  if (metronomeInterval) {
    window.clearInterval(metronomeInterval);
    metronomeInterval = null;
  }
}
