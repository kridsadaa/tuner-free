interface NeedleProps {
  cents: number; // -50 to +50
}

export function Needle({ cents }: NeedleProps) {
  const clamped = Math.max(-50, Math.min(50, cents));
  const angle = (clamped / 50) * 58;

  const inTune = Math.abs(cents) < 5;
  const color = inTune ? '#3fb950' : Math.abs(cents) < 20 ? '#d29922' : '#f85149';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="240" height="128" viewBox="0 0 240 128" aria-hidden="true">
        {/* Background arc */}
        <path
          d="M 18 118 A 102 102 0 0 1 222 118"
          fill="none"
          stroke="#21293a"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Green zone (center ±5¢) */}
        <path
          d="M 108 26 A 102 102 0 0 1 132 26"
          fill="none"
          stroke="#3fb950"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Tick marks */}
        {[-50, -25, 0, 25, 50].map((v) => {
          const a = ((v / 50) * 58 - 90) * (Math.PI / 180);
          const r1 = 92, r2 = 103;
          const cx = 120, cy = 118;
          const isCenter = v === 0;
          return (
            <line
              key={v}
              x1={cx + r1 * Math.cos(a)}
              y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)}
              y2={cy + r2 * Math.sin(a)}
              stroke={isCenter ? '#3fb950' : '#30363d'}
              strokeWidth={isCenter ? 2.5 : 1.5}
              strokeLinecap="round"
            />
          );
        })}
        {/* Tick labels */}
        {[-50, -25, 0, 25, 50].map((v) => {
          const a = ((v / 50) * 58 - 90) * (Math.PI / 180);
          const r = 80;
          const cx = 120, cy = 118;
          return (
            <text
              key={`lbl-${v}`}
              x={cx + r * Math.cos(a)}
              y={cy + r * Math.sin(a) + 4}
              fill={v === 0 ? '#3fb950' : '#484f58'}
              fontSize="9"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
            >
              {v > 0 ? `+${v}` : v}
            </text>
          );
        })}
        {/* Needle */}
        <g transform={`rotate(${angle}, 120, 118)`} style={{ transition: 'transform 0.08s ease-out' }}>
          <line
            x1="120" y1="118" x2="120" y2="24"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
        {/* Pivot */}
        <circle cx="120" cy="118" r="4" fill={color} />
        <circle cx="120" cy="118" r="2" fill="#0d1117" />
      </svg>

      {/* Cents readout */}
      <div style={{
        color,
        fontSize: '0.72rem',
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.06em',
        fontWeight: 600,
        padding: '2px 10px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid #30363d',
        borderRadius: '4px',
      }}>
        {cents > 0 ? '+' : ''}{Math.round(cents)} ¢
      </div>
    </div>
  );
}
