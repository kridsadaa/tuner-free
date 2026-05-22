import { useEffect, useRef, useState, useCallback } from 'react';
import { detectPitch, frequencyToNote, type NoteInfo } from './pitchDetector';

const FFT_SIZE = 4096;
const MEDIAN_SIZE = 9;   // median window
const LOCK_FRAMES = 4;   // frames of same note before switching
const EMA_ALPHA = 0.25;  // cents smoothing (lower = smoother needle)

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function useMicrophone() {
  const [note, setNote] = useState<NoteInfo | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(FFT_SIZE));

  // stability state
  const pitchHistoryRef = useRef<number[]>([]);
  const smoothCentsRef = useRef<number>(0);
  const currentNoteKeyRef = useRef<string>('');          // "C4", "D#3" etc
  const pendingRef = useRef<{ key: string; count: number } | null>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    streamRef.current = null;
    pitchHistoryRef.current = [];
    smoothCentsRef.current = 0;
    currentNoteKeyRef.current = '';
    pendingRef.current = null;
    setAnalyserNode(null);
    setListening(false);
    setNote(null);
    setVolume(0);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.5;

      ctx.createMediaStreamSource(stream).connect(analyser);
      setAnalyserNode(analyser);
      setListening(true);

      const tick = () => {
        analyser.getFloatTimeDomainData(bufferRef.current);

        // RMS volume
        let rms = 0;
        for (const s of bufferRef.current) rms += s * s;
        const vol = Math.sqrt(rms / bufferRef.current.length);
        setVolume(vol);

        if (vol > 0.012) {
          const freq = detectPitch(bufferRef.current, ctx.sampleRate);
          if (freq !== null) {
            // median smoothing on frequency
            const hist = pitchHistoryRef.current;
            hist.push(freq);
            if (hist.length > MEDIAN_SIZE) hist.shift();
            const smoothHz = median(hist);
            const detected = frequencyToNote(smoothHz);
            const key = `${detected.note}${detected.octave}`;

            if (key === currentNoteKeyRef.current) {
              // same note — smooth the cents with EMA
              smoothCentsRef.current =
                EMA_ALPHA * detected.cents + (1 - EMA_ALPHA) * smoothCentsRef.current;
              setNote({ ...detected, cents: smoothCentsRef.current });
              pendingRef.current = null;
            } else {
              // different note — require LOCK_FRAMES consecutive detections
              if (pendingRef.current?.key === key) {
                pendingRef.current.count++;
                if (pendingRef.current.count >= LOCK_FRAMES) {
                  smoothCentsRef.current = detected.cents;
                  currentNoteKeyRef.current = key;
                  setNote({ ...detected, cents: smoothCentsRef.current });
                  pendingRef.current = null;
                }
              } else {
                pendingRef.current = { key, count: 1 };
              }
            }
          }
        } else {
          // silence — reset
          pitchHistoryRef.current = [];
          pendingRef.current = null;
          currentNoteKeyRef.current = '';
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError('Microphone access denied. Please allow microphone permission.');
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { note, listening, error, volume, analyserNode, start, stop };
}
