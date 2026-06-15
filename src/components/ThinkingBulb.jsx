import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/* idea (lightbulb) → "thinking" sparkle → loop
   A nod to AI "thinking" indicators, drawn from scratch — no trademarked marks. */

const SEQ = [
  ['bulb', 1500],   // dim idea
  ['lit',  750],    // filament lights up
  ['think', 2900],  // dissolves into thinking sparkle
]

export default function ThinkingBulb() {
  const reduced = prefersReducedMotion()
  const [phase, setPhase] = useState(reduced ? 'think' : 'bulb')

  useEffect(() => {
    if (reduced) return
    let i = 0, t
    const run = () => {
      setPhase(SEQ[i][0])
      t = setTimeout(() => { i = (i + 1) % SEQ.length; run() }, SEQ[i][1])
    }
    run()
    return () => clearTimeout(t)
  }, [reduced])

  const lit = phase === 'lit' || phase === 'think'
  const thinking = phase === 'think'

  return (
    <svg viewBox="0 0 200 200" width="100%" aria-hidden="true" className="tb-svg">
      <defs>
        <linearGradient id="tb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--prussian)" />
        </linearGradient>
        <radialGradient id="tb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Lightbulb (idea) ── */}
      <g className="tb-bulb" style={{ opacity: thinking ? 0 : 1 }}>
        <circle cx="100" cy="82" r="30"
          fill={lit ? 'color-mix(in srgb, var(--accent) 14%, var(--paper))' : 'none'}
          stroke="var(--ink)" strokeWidth="2.4"
          style={{ transition: 'fill 0.4s' }} />
        {/* screw base */}
        <path d="M88,113 q12,7 24,0" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M90,119 h20 M93,125 h14" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
        {/* filament */}
        <path d="M91,84 q4,-13 9,0 q5,13 9,0"
          fill="none"
          stroke={lit ? 'var(--accent)' : 'var(--sepia)'}
          strokeWidth={lit ? 2.6 : 2}
          strokeLinecap="round"
          className={lit ? 'tb-filament-lit' : ''}
          style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }} />
        {/* spark rays when lit */}
        {lit && [0, 60, 120, 180, 240, 300].map(a => {
          const r1 = 36, r2 = 44
          const rad = (a * Math.PI) / 180
          return (
            <line key={a}
              x1={100 + r1 * Math.cos(rad)} y1={82 + r1 * Math.sin(rad)}
              x2={100 + r2 * Math.cos(rad)} y2={82 + r2 * Math.sin(rad)}
              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
              className="tb-ray" style={{ animationDelay: `${a / 360 * 0.4}s` }} />
          )
        })}
      </g>

      {/* ── Thinking sparkle ── */}
      <g className="tb-think" style={{ opacity: thinking ? 1 : 0 }}>
        {/* soft glow */}
        <circle cx="100" cy="86" r="58" fill="url(#tb-glow)" className="tb-glow" />
        {/* main 4-point sparkle, rotates */}
        <g className="tb-rot">
          <g className="tb-breathe">
            <path d="M100,50 Q105,81 136,86 Q105,91 100,122 Q95,91 64,86 Q95,81 100,50 Z"
              fill="url(#tb-grad)" />
          </g>
        </g>
        {/* small twinkle top-right */}
        <g className="tb-twinkle" style={{ transformOrigin: '134px 58px' }}>
          <path d="M134,46 Q136,55 145,58 Q136,61 134,70 Q132,61 123,58 Q132,55 134,46 Z"
            fill="var(--accent)" />
        </g>
        {/* thinking dots */}
        {[84, 100, 116].map((x, i) => (
          <circle key={x} cx={x} cy="150" r="4.5"
            fill="var(--prussian)" className="tb-dot"
            style={{ animationDelay: `${i * 0.22}s` }} />
        ))}
      </g>
    </svg>
  )
}
