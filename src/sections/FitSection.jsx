import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import CountUp from '../components/CountUp'

/* ── Fig. 01 — chaos → DNA double helix ── */
const N_RUNGS = 11
const RUNG_X = Array.from({ length: N_RUNGS }, (_, i) => 14 + i * (252 / (N_RUNGS - 1)))
const HELIX_CY = 60
const HELIX_AMP = 30
const HELIX_TURNS = 4.5   // total angle across width in radians × (1/π)

/* Grid layout for chaos state — 4 rows × 6 cols, 22 of 24 used */
const N_COLS = 6
const CHAOS_POS = Array.from({ length: N_RUNGS * 2 }, (_, i) => ({
  x: 18 + (i % N_COLS) * 49,
  y: 14 + Math.floor(i / N_COLS) * 32,
}))

function getHelixY(x, phase, strand) {
  const angle = (x / 280) * Math.PI * HELIX_TURNS + phase
  return HELIX_CY + HELIX_AMP * Math.sin(angle + (strand === 2 ? Math.PI : 0))
}

function BridgeSVG() {
  const [dnaState, setDnaState] = useState('chaos') // chaos | settling | rotating
  const [phase, setPhase]       = useState(0)
  const frameRef = useRef(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion()) { setDnaState('settling'); return }
    let t1, t2, t3
    const goChaos = () => {
      if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
      phaseRef.current = 0
      setPhase(0)
      setDnaState('chaos')
      t1 = setTimeout(goSettling, 1000)
    }
    const goSettling = () => {
      setDnaState('settling')
      t2 = setTimeout(goRotating, 750)
    }
    const goRotating = () => {
      setDnaState('rotating')
      const tick = () => {
        phaseRef.current += 0.038
        setPhase(phaseRef.current)
        frameRef.current = requestAnimationFrame(tick)
      }
      frameRef.current = requestAnimationFrame(tick)
      t3 = setTimeout(goChaos, 3200)
    }
    t1 = setTimeout(goSettling, 500)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const ordered = dnaState !== 'chaos'

  return (
    <svg viewBox="0 0 280 120" width="100%" aria-hidden="true" className="fit-diagram">

      {/* Backbone strand 1 — prussian */}
      {ordered && RUNG_X.slice(0, -1).map((x, i) => {
        const xNext = RUNG_X[i + 1]
        const y1 = getHelixY(x,    phase, 1)
        const y2 = getHelixY(xNext, phase, 1)
        const front = Math.cos((x / 280) * Math.PI * HELIX_TURNS + phase) > 0
        return <line key={`b1-${i}`} x1={x} y1={y1} x2={xNext} y2={y2}
          stroke="#fff" strokeWidth="1.6"
          opacity={front ? 0.85 : 0.3} />
      })}

      {/* Backbone strand 2 — verdigris */}
      {ordered && RUNG_X.slice(0, -1).map((x, i) => {
        const xNext = RUNG_X[i + 1]
        const y1 = getHelixY(x,    phase, 2)
        const y2 = getHelixY(xNext, phase, 2)
        const front = Math.cos((x / 280) * Math.PI * HELIX_TURNS + phase) < 0
        return <line key={`b2-${i}`} x1={x} y1={y1} x2={xNext} y2={y2}
          stroke="var(--accent)" strokeWidth="1.6"
          opacity={front ? 0.85 : 0.3} />
      })}

      {/* Rungs (base pairs) — gold */}
      {ordered && RUNG_X.map((x, i) => {
        const y1 = getHelixY(x, phase, 1)
        const y2 = getHelixY(x, phase, 2)
        const depth = Math.cos((x / 280) * Math.PI * HELIX_TURNS + phase)
        return <line key={`rung-${i}`} x1={x} y1={y1} x2={x} y2={y2}
          stroke="rgba(255,255,255,0.4)" strokeWidth="1"
          opacity={Math.abs(depth) * 0.7}
          strokeDasharray={depth < 0 ? '3 2' : undefined} />
      })}

      {/* Particles — strand 1 (prussian) and strand 2 (verdigris) */}
      {RUNG_X.flatMap((x, i) => {
        const y1h = getHelixY(x, phase, 1)
        const y2h = getHelixY(x, phase, 2)
        const cp1 = CHAOS_POS[i * 2]
        const cp2 = CHAOS_POS[i * 2 + 1]
        const depth = Math.cos((x / 280) * Math.PI * HELIX_TURNS + phase)

        const tx1 = ordered ? x    : cp1.x
        const ty1 = ordered ? y1h  : cp1.y
        const tx2 = ordered ? x    : cp2.x
        const ty2 = ordered ? y2h  : cp2.y

        const settleTr = (delay) =>
          `transform ${0.55 + i * 0.035}s cubic-bezier(0.34,1.15,0.64,1) ${delay}s, opacity 0.4s ease`

        const tr1 = dnaState === 'settling' ? settleTr(i * 0.04)
                  : dnaState === 'chaos'    ? 'transform 0.35s ease-out, opacity 0.4s ease'
                  : 'none'
        const tr2 = dnaState === 'settling' ? settleTr(i * 0.04 + 0.05)
                  : dnaState === 'chaos'    ? 'transform 0.35s ease-out, opacity 0.4s ease'
                  : 'none'

        return [
          <circle key={`s1-${i}`} r="4"
            fill="#fff"
            style={{
              opacity: ordered ? (depth > 0 ? 0.9 : 0.38) : 0.45,
              transform: `translate(${tx1}px,${ty1}px)`,
              transition: tr1,
            }} />,
          <circle key={`s2-${i}`} r="4"
            fill="var(--accent)"
            style={{
              opacity: ordered ? (depth < 0 ? 0.9 : 0.38) : 0.45,
              transform: `translate(${tx2}px,${ty2}px)`,
              transition: tr2,
            }} />,
        ]
      })}

    </svg>
  )
}

/* ── Fig. 02 — square forms from 4 project elements ── */
const SQ_CORNERS = [
  { id: 'tl', cx: 74,  cy: 26, label: 'People',    lx: 54,  ly: 13,  anchor: 'end'   },
  { id: 'tr', cx: 206, cy: 26, label: 'Budget',     lx: 226, ly: 13,  anchor: 'start' },
  { id: 'br', cx: 206, cy: 84, label: 'Deadlines',  lx: 226, ly: 98,  anchor: 'start' },
  { id: 'bl', cx: 74,  cy: 84, label: 'Results',    lx: 54,  ly: 98,  anchor: 'end'   },
]
// [fromIdx, toIdx, edgeLength]
const SQ_EDGES = [
  [0, 1, 132], // top   People → Budget
  [1, 2, 58],  // right Budget → Deadlines
  [2, 3, 132], // bottom Deadlines → Results
  [3, 0, 58],  // left  Results → People  (closes)
]

function ConvergeSVG() {
  const [phase, setPhase] = useState(prefersReducedMotion() ? 8 : 0)

  useEffect(() => {
    if (prefersReducedMotion()) { setPhase(8); return }
    const id = setInterval(() => setPhase(p => (p + 1) % 9), 520)
    return () => clearInterval(id)
  }, [])

  const isComplete = phase >= 4

  return (
    <svg viewBox="0 0 280 110" width="100%" aria-hidden="true" className="fit-diagram">
      {/* Fill appears when square closes */}
      <rect x={74} y={26} width={132} height={58} rx="1"
        fill="color-mix(in srgb, var(--accent) 16%, transparent)"
        style={{ opacity: isComplete ? 1 : 0, transition: 'opacity 0.5s ease' }}
      />

      {/* Edges drawn one by one via stroke-dashoffset */}
      {SQ_EDGES.map(([fi, ti, len], i) => {
        const f = SQ_CORNERS[fi], t = SQ_CORNERS[ti]
        const visible = phase > i
        return (
          <line key={i}
            x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
            stroke={isComplete ? 'var(--accent)' : 'rgba(255,255,255,0.55)'}
            strokeWidth="1.3"
            style={{
              strokeDasharray: len,
              strokeDashoffset: visible ? 0 : len,
              opacity: visible ? 0.8 : 0.1,
              transition: 'stroke-dashoffset 0.44s cubic-bezier(0.4,0,0.2,1), stroke 0.4s, opacity 0.25s',
            }}
          />
        )
      })}

      {/* Corner nodes */}
      {SQ_CORNERS.map(c => (
        <g key={c.id}>
          <circle cx={c.cx} cy={c.cy} r={9}
            fill={isComplete
              ? 'color-mix(in srgb, var(--accent) 25%, #0A0A0B)'
              : '#161618'}
            stroke={isComplete ? 'var(--accent)' : 'rgba(255,255,255,0.55)'}
            strokeWidth="1"
            style={{ transition: 'all 0.45s ease' }}
          />
          <text x={c.lx} y={c.ly} textAnchor={c.anchor}
            fontFamily="Inter, sans-serif"
            fontSize="11" fontStyle="italic"
            fill="#fff"
            opacity="0.92"
            style={{ transition: 'fill 0.4s' }}>
            {c.label}
          </text>
        </g>
      ))}

      {/* Centre label when complete */}
      <text x="140" y="56" textAnchor="middle" dominantBaseline="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="10" letterSpacing="2"
        fill="var(--accent)"
        style={{ opacity: isComplete ? 0.85 : 0, transition: 'opacity 0.5s ease' }}>
        COMPLETE
      </text>
    </svg>
  )
}

/* ── Fig. 03 — engagement counter animation ── */
const METRICS = [
  { icon: '♥', label: 'Likes',  target: 2847, color: 'var(--crimson)'  },
  { icon: '↑', label: 'Shares', target: 341,  color: 'var(--prussian)' },
  { icon: '◎', label: 'Views',  target: 18420, color: 'var(--verdigris)' },
]
const FRAMES = 52
const fmt = (n) => n >= 1000
  ? `${Math.floor(n / 1000)},${String(Math.floor(n % 1000)).padStart(3, '0')}`
  : String(Math.floor(n))

function PipelineSVG() {
  const [frame, setFrame] = useState(prefersReducedMotion() ? FRAMES : 0)

  useEffect(() => {
    if (prefersReducedMotion()) { setFrame(FRAMES); return }
    let f = 0
    const tick = () => {
      f = (f + 1) % (FRAMES + 40)
      setFrame(f)
    }
    const id = setInterval(tick, 38)
    return () => clearInterval(id)
  }, [])

  const t = Math.min(frame / FRAMES, 1)
  const ease = t < 1 ? 1 - Math.pow(1 - t, 3) : 1

  return (
    <svg viewBox="0 0 280 110" width="100%" aria-hidden="true" className="fit-diagram">
      {METRICS.map((m, i) => {
        const y = 22 + i * 30
        const val = Math.floor(m.target * ease)

        return (
          <g key={m.label}>
            {/* Icon */}
            <text x="14" y={y} dominantBaseline="middle"
              fontFamily="Inter, sans-serif" fontSize="17"
              fill="var(--accent)" opacity="0.95">{m.icon}</text>

            {/* Label */}
            <text x="36" y={y} dominantBaseline="middle"
              fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="0.05em"
              fill="#fff" opacity="0.88">{m.label}</text>

            {/* Count, right aligned, counting up */}
            <text x="266" y={y} textAnchor="end" dominantBaseline="middle"
              fontFamily="IBM Plex Mono, monospace" fontSize="15" fontWeight="500"
              fill="#fff" opacity="0.95">
              +{fmt(val)}
            </text>

            {/* Thin baseline tick that grows with the count, no filled track */}
            <line x1="36" y1={y + 11} x2={36 + 230 * ease} y2={y + 11}
              stroke="var(--accent)" strokeWidth="1" opacity="0.45" />
          </g>
        )
      })}
    </svg>
  )
}

/* ── Section ── */
const FIGURES = [
  {
    num: '01',
    tag: 'bridge from bench → general public',
    title: 'Making science understandable',
    body: 'Organized science festivals, educational events, and public outreach for audiences ranging from dozens to 15,000+ participants.',
    stats: [{ value: '15,000+', label: 'visitors confirmed attendance' }],
    Diagram: BridgeSVG,
  },
  {
    num: '02',
    tag: 'convergent coordination',
    title: 'Managing complex projects',
    body: 'Research administration, grant reporting, international events, suppliers, stakeholders, and budgets, across a wide range of event formats:',
    tools: ['Hackathons', 'City festivals', 'International conferences', 'VIP events', 'C-level meetups'],
    Diagram: ConvergeSVG,
  },
  {
    num: '03',
    tag: 'idea → finished product',
    title: 'Content people actually engage with',
    body: 'Presentations, event branding, websites, communications, promotional materials, and digital content.',
    tools: ['WordPress', 'Tilda', 'Notion', 'AI Tools', 'PowerPoint'],
    Diagram: PipelineSVG,
  },
]

export default function FitSection() {
  return (
    <section className="fit" aria-labelledby="fit-heading">
      <div className="container">
        <span className="section-eyebrow" data-reveal>Track Record</span>
        <h2 className="section-heading" id="fit-heading" data-reveal>Why I Think We Fit</h2>
        <p className="section-sub" data-reveal>What I&apos;ve already been doing.</p>

        <div className="fit-grid">
          {FIGURES.map(({ num, tag, title, body, stats, tools, Diagram }) => (
            <article key={num} className="fit-card" data-reveal>
              <span className="fit-fig">Fig.&thinsp;{num}</span>
              <div className="fit-diagram-wrap">
                <Diagram />
              </div>
              <h3 className="fit-title">{title}</h3>
              <p className="fit-body">{body}</p>
              {stats && (
                <dl className="fit-stats">
                  {stats.map(s => (
                    <div key={s.label} className="fit-stat">
                      <dt className="fit-stat-value"><CountUp value={s.value} /></dt>
                      <dd className="fit-stat-label">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tools && (
                <ul className="fit-tools">
                  {tools.map(t => <li key={t}>{t}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

