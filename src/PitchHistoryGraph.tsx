import { useRef, useEffect } from 'react';

interface PitchHistoryGraphProps {
  /** Cents deviation values. Null means silence (gap in line). */
  history: (number | null)[];
  height?: number;
}

const RANGE = 50; // ±50 cents displayed

export function PitchHistoryGraph({ history, height = 80 }: PitchHistoryGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD_LEFT = 28;
    const PAD_RIGHT = 6;
    const PAD_TOP = 6;
    const PAD_BOT = 6;
    const chartW = W - PAD_LEFT - PAD_RIGHT;
    const chartH = H - PAD_TOP - PAD_BOT;

    ctx.clearRect(0, 0, W, H);

    const mapY = (cents: number) =>
      PAD_TOP + ((RANGE - Math.max(-RANGE, Math.min(RANGE, cents))) / (2 * RANGE)) * chartH;

    // ── Background zones ──────────────────────────────────────
    const zones = [
      { lo: -RANGE, hi: -20, color: 'rgba(248,81,73,0.07)' },
      { lo: -20,   hi: -5,  color: 'rgba(210,153,34,0.07)' },
      { lo: -5,    hi:  5,  color: 'rgba(63,185,80,0.10)' },
      { lo:  5,    hi:  20, color: 'rgba(210,153,34,0.07)' },
      { lo:  20,   hi: RANGE, color: 'rgba(248,81,73,0.07)' },
    ];
    for (const z of zones) {
      ctx.fillStyle = z.color;
      ctx.fillRect(PAD_LEFT, mapY(z.hi), chartW, mapY(z.lo) - mapY(z.hi));
    }

    // ── Grid lines & axis labels ──────────────────────────────
    const gridCents = [-20, -5, 0, 5, 20];
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (const c of gridCents) {
      const y = mapY(c);
      ctx.strokeStyle = c === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = c === 0 ? 1.5 : 1;
      ctx.setLineDash(c === 0 ? [] : [3, 3]);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(PAD_LEFT + chartW, y);
      ctx.stroke();
      ctx.setLineDash([]);

      const label = c === 0 ? '0' : (c > 0 ? `+${c}` : `${c}`);
      ctx.fillStyle = c === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)';
      ctx.fillText(label, PAD_LEFT - 3, y + 3);
    }

    // ── Data line ─────────────────────────────────────────────
    const validPoints = history.filter((v) => v !== null).length;
    if (validPoints < 2) return;

    const N = history.length;

    // Build gradient based on cents value at each point
    // Draw segments colored by in-tune zone
    let prevX: number | null = null;
    let prevY: number | null = null;
    let prevCents: number | null = null;

    const segColor = (cents: number): string => {
      const abs = Math.abs(cents);
      if (abs <= 5)  return '#3fb950';   // green — in tune
      if (abs <= 20) return '#d29922';   // amber — close
      return '#f85149';                   // red — off
    };

    // Gradient fill under the line
    const fillPath = new Path2D();
    let firstX = -1;
    history.forEach((cents, i) => {
      if (cents === null) return;
      const x = PAD_LEFT + (i / (N - 1)) * chartW;
      const y = mapY(cents);
      if (firstX < 0) { fillPath.moveTo(x, y); firstX = x; }
      else fillPath.lineTo(x, y);
    });
    const zeroY = mapY(0);
    if (firstX >= 0) {
      let lastValidIdx = -1;
      for (let j = history.length - 1; j >= 0; j--) {
        if (history[j] !== null) {
          lastValidIdx = j;
          break;
        }
      }
      const lastX = PAD_LEFT + (lastValidIdx / (N - 1)) * chartW;
      fillPath.lineTo(lastX, zeroY);
      fillPath.lineTo(firstX, zeroY);
      fillPath.closePath();
      const grad = ctx.createLinearGradient(0, PAD_TOP, 0, PAD_TOP + chartH);
      grad.addColorStop(0, 'rgba(248,81,73,0.15)');
      grad.addColorStop(0.35, 'rgba(210,153,34,0.1)');
      grad.addColorStop(0.5, 'rgba(63,185,80,0.18)');
      grad.addColorStop(0.65, 'rgba(210,153,34,0.1)');
      grad.addColorStop(1, 'rgba(248,81,73,0.15)');
      ctx.fillStyle = grad;
      ctx.fill(fillPath);
    }

    // Draw colored line segments
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    history.forEach((cents, i) => {
      const x = PAD_LEFT + (i / (N - 1)) * chartW;
      if (cents === null) {
        prevX = null; prevY = null; prevCents = null;
        return;
      }
      const y = mapY(cents);
      if (prevX !== null && prevY !== null && prevCents !== null) {
        const grad = ctx.createLinearGradient(prevX, 0, x, 0);
        grad.addColorStop(0, segColor(prevCents));
        grad.addColorStop(1, segColor(cents));
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      prevX = x; prevY = y; prevCents = cents;
    });

    // Latest dot
    let lastIdx = -1;
    for (let j = history.length - 1; j >= 0; j--) {
      if (history[j] !== null) {
        lastIdx = j;
        break;
      }
    }
    if (lastIdx >= 0 && history[lastIdx] !== null) {
      const lx = PAD_LEFT + (lastIdx / (N - 1)) * chartW;
      const ly = mapY(history[lastIdx] as number);
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = segColor(history[lastIdx] as number);
      ctx.shadowColor = segColor(history[lastIdx] as number);
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [history, height]);

  if (history.filter((v) => v !== null).length < 2) return null;

  return (
    <div className="pitch-history-wrap">
      <canvas
        ref={canvasRef}
        width={560}
        height={height}
        className="pitch-history-canvas"
        aria-label="Pitch history graph"
        role="img"
      />
      <div className="pitch-history-legend">
        <span className="phl phl--green">In tune</span>
        <span className="phl phl--amber">±20¢</span>
        <span className="phl phl--red">Off</span>
        <span className="phl phl--time">~10s</span>
      </div>
    </div>
  );
}
