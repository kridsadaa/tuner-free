interface StabilityChartProps {
  history: number[];
}

export function StabilityChart({ history }: StabilityChartProps) {
  if (history.length < 2) return null;

  const width = 300;
  const height = 60;
  const padding = 5;

  // Map -50..50 to height..0
  const mapY = (cents: number) => {
    const clamped = Math.max(-50, Math.min(50, cents));
    return ((50 - clamped) / 100) * (height - 2 * padding) + padding;
  };

  const points = history
    .map((cents, i) => {
      const x = (i / 99) * width;
      const y = mapY(cents);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="stability-chart-wrap">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Zero line */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4"
        />
        {/* Stability line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
      <div className="chart-label">Stability History (Last 3s)</div>
    </div>
  );
}
