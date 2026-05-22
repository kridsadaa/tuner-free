import { useEffect, useRef, useState, useCallback } from 'react';
import { detectPitch, frequencyToNote, type NoteInfo } from './pitchDetector';

const FFT_SIZE = 2048;
const BUFFER_SIZE = 2048;

export function useMicrophone() {
  const [note, setNote] = useState<NoteInfo | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(BUFFER_SIZE));

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    streamRef.current = null;
    setListening(false);
    setNote(null);
    setVolume(0);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setListening(true);

      const tick = () => {
        analyser.getFloatTimeDomainData(bufferRef.current);

        // RMS volume
        let rms = 0;
        for (const s of bufferRef.current) rms += s * s;
        const vol = Math.sqrt(rms / bufferRef.current.length);
        setVolume(vol);

        if (vol > 0.01) {
          const freq = detectPitch(bufferRef.current, ctx.sampleRate);
          if (freq !== null && freq > 60 && freq < 2000) {
            setNote(frequencyToNote(freq));
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError('Microphone access denied. Please allow microphone permission.');
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { note, listening, error, volume, start, stop };
}
