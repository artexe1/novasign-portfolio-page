import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

const STEPS = ['Brief', 'Copy', 'Design', 'Publish']
const W = 260, H = 90

export default function ProductionFlow() {
  const [active, setActive] = useState(prefersReducedMotion() ? STEPS.length - 1 : 0)

  useEffect(() => {
    if (prefersReducedMotion()) { setActive(STEPS.length - 1); return }
    const id = setInterval(() => setActive(a => (a + 1) % STEPS.length), 850)
    return () => clearInterval(id)
  }, [])

  const slotW = W / STEPS.length
  const bw = 46, bh = 28, cy = H / 2

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="card-graph">
      <defs>
        <marker id="pf-arrow-dim" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3z" fill="var(--sepia)" opacity="0.4" />
        </marker>
        <marker id="pf-arrow-hot" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3z" fill="var(--verdigris)" />
        </marker>
      </defs>

      {STEPS.map((step, i) => {
        const cx     = slotW * i + slotW / 2
        const x      = cx - bw / 2
        const y      = cy - bh / 2
        const nextCx = slotW * (i + 1) + slotW / 2
        const isActive = active === i
        const isPast   = i < active

        return (
          <g key={step}>
            <rect x={x} y={y} width={bw} height={bh} rx="2"
              fill={isActive
                ? 'color-mix(in srgb, var(--verdigris) 14%, var(--paper))'
                : isPast
                  ? 'color-mix(in srgb, var(--sepia) 9%, var(--paper))'
                  : 'transparent'}
              stroke={isActive ? 'var(--verdigris)' : 'var(--sepia)'}
              strokeWidth={isActive ? 1.8 : 1}
              opacity={isActive ? 1 : isPast ? 0.9 : 0.45}
              style={{ transition: 'fill 0.3s, stroke 0.3s, opacity 0.3s' }}
            />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
              fontFamily="Inter, sans-serif"
              fontSize="11" fontStyle="italic"
              fill={isActive ? 'var(--verdigris)' : isPast ? 'var(--sepia)' : 'var(--sepia)'}
              style={{ transition: 'fill 0.3s', pointerEvents: 'none' }}
              opacity={isActive ? 1 : isPast ? 0.8 : 0.45}>
              {step}
            </text>

            {i < STEPS.length - 1 && (
              <line
                x1={cx + bw / 2} y1={cy}
                x2={nextCx - bw / 2 - 1} y2={cy}
                stroke={isPast ? 'var(--verdigris)' : 'var(--sepia)'}
                strokeWidth={isPast ? 1.4 : 0.8}
                opacity={isPast ? 0.75 : 0.3}
                markerEnd={isPast ? 'url(#pf-arrow-hot)' : 'url(#pf-arrow-dim)'}
                style={{ transition: 'all 0.3s' }}
              />
            )}
          </g>
        )
      })}

      {/* traveling dot */}
      {(() => {
        const cx = slotW * active + slotW / 2
        return (
          <circle
            cx={cx} cy={cy - bh / 2 - 6} r="3"
            fill="var(--verdigris)" opacity="0.7"
            style={{ transition: 'cx 0.3s ease' }}
          />
        )
      })()}
    </svg>
  )
}

