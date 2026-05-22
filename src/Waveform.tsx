import { useEffect, useRef } from 'react';

interface WaveformProps {
  analyser: AnalyserNode | null;
}

export function Waveform({ analyser }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) {
      // clear canvas when stopped
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const buffer = new Float32Array(analyser.fftSize);

    const draw = () => {
      analyser.getFloatTimeDomainData(buffer);

      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // center line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // waveform glow
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.beginPath();

      const step = W / buffer.length;
      for (let i = 0; i < buffer.length; i++) {
        const x = i * step;
        const y = H / 2 + buffer[i] * H * 0.45;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={100}
      style={{
        width: '100%',
        height: 80,
        borderRadius: 10,
        background: '#0f172a',
        border: '1px solid #1e293b',
      }}
    />
  );
}
