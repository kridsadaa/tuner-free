interface NeedleProps {
  cents: number; // -50 to +50
}

export function Needle({ cents }: NeedleProps) {
  // clamp and map cents to angle: -50 → -60deg, 0 → 0, +50 → +60deg
  const clamped = Math.max(-50, Math.min(50, cents));
  const angle = (clamped / 50) * 60;

  const inTune = Math.abs(cents) < 5;
  const color = inTune ? '#22c55e' : Math.abs(cents) < 20 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Arc gauge */}
      <svg width="260" height="140" viewBox="0 0 260 140">
        {/* Background arc */}
        <path
          d="M 20 130 A 110 110 0 0 1 240 130"
          fill="none"
          stroke="#334155"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored zone: in-tune (center) */}
        <path
          d="M 107 35 A 110 110 0 0 1 153 35"
          fill="none"
          stroke="#22c55e"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Tick marks */}
        {[-50, -25, 0, 25, 50].map((v) => {
          const a = ((v / 50) * 60 - 90) * (Math.PI / 180);
          const r1 = 100, r2 = 112;
          const cx = 130, cy = 130;
          return (
            <line
              key={v}
              x1={cx + r1 * Math.cos(a)}
              y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)}
              y2={cy + r2 * Math.sin(a)}
              stroke={v === 0 ? '#22c55e' : '#64748b'}
              strokeWidth={v === 0 ? 3 : 1.5}
            />
          );
        })}
        {/* Needle */}
        <g transform={`rotate(${angle}, 130, 130)`}>
          <line x1="130" y1="130" x2="130" y2="32" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <circle cx="130" cy="130" r="6" fill={color} />
        </g>
        {/* Labels */}
        <text x="14" y="140" fill="#64748b" fontSize="11" textAnchor="middle">-50</text>
        <text x="246" y="140" fill="#64748b" fontSize="11" textAnchor="middle">+50</text>
        <text x="130" y="140" fill="#64748b" fontSize="11" textAnchor="middle">0</text>
      </svg>

      {/* Cents readout */}
      <div style={{ color, fontSize: 14, fontFamily: 'monospace' }}>
        {cents > 0 ? '+' : ''}{Math.round(cents)} cents
      </div>
    </div>
  );
}
