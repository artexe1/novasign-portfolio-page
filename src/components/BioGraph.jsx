import { useEffect, useRef, useState } from 'react'
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide
} from 'd3-force'
import { prefersReducedMotion } from '../lib/motion'

const W = 260, H = 170

const INIT_NODES = [
  { id: 'c',   r: 12, kind: 'hub' },
  { id: 'n1',  r: 7,  kind: 'mid', label: 'Genomics' },
  { id: 'n2',  r: 8,  kind: 'mid', label: 'Gene editing' },
  { id: 'n3',  r: 7,  kind: 'mid', label: 'Metagenomics' },
  { id: 'n4',  r: 6,  kind: 'mid', label: 'Bioinformatics' },
  { id: 'n5',  r: 7,  kind: 'mid', label: 'Proteins' },
  { id: 'n6',  r: 3,  kind: 'leaf' },
  { id: 'n7',  r: 3,  kind: 'leaf' },
  { id: 'n8',  r: 3,  kind: 'leaf' },
  { id: 'n9',  r: 2,  kind: 'leaf' },
]
const INIT_LINKS = [
  { source: 'c',  target: 'n1' }, { source: 'c',  target: 'n2' },
  { source: 'c',  target: 'n3' }, { source: 'c',  target: 'n4' },
  { source: 'c',  target: 'n5' }, { source: 'n1', target: 'n6' },
  { source: 'n3', target: 'n7' }, { source: 'n5', target: 'n8' },
  { source: 'n2', target: 'n9' },
]

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export default function BioGraph() {
  const nodesRef   = useRef(INIT_NODES.map(n => ({ ...n })))
  const linksRef   = useRef(INIT_LINKS.map(l => ({ ...l })))
  const simRef     = useRef(null)
  const draggingRef = useRef(null)
  const svgRef     = useRef(null)
  const frameRef   = useRef(null)
  const [, tick]   = useState(0)
  const [hint, setHint] = useState(true)

  useEffect(() => {
    nodesRef.current = INIT_NODES.map(n => ({ ...n }))
    linksRef.current = INIT_LINKS.map(l => ({ ...l }))

    const reduced = prefersReducedMotion()

    // Seed nodes in a ring so the layout starts spread out, not collapsed.
    const mids = nodesRef.current.filter(n => n.kind === 'mid')
    nodesRef.current.forEach(n => {
      if (n.kind === 'hub') { n.x = W / 2; n.y = H / 2 }
      else {
        const i = n.kind === 'mid' ? mids.indexOf(n) : Math.random() * mids.length
        const a = (i / mids.length) * Math.PI * 2
        const r = n.kind === 'mid' ? 52 : 72
        n.x = W / 2 + r * Math.cos(a)
        n.y = H / 2 + r * Math.sin(a)
      }
    })

    // Build the simulation but drive it manually (stop the internal timer) so
    // ticking is reliable in every environment.
    const sim = forceSimulation(nodesRef.current)
      .force('link', forceLink(linksRef.current).id(d => d.id).distance(d =>
        (d.source.kind === 'hub' || d.target.kind === 'hub') ? 44 : 26))
      .force('charge', forceManyBody().strength(-85))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide().radius(d => d.r + 6))
      .velocityDecay(0.35)
      .alphaDecay(0)            // keep forces alive indefinitely
      .alpha(0.16)
      .stop()
    simRef.current = sim

    // Gentle tangential push: the whole constellation slowly swirls while every
    // node stays physics-driven and draggable. The dragged node is skipped.
    const SWIRL = 0.0016
    const applySwirl = () => {
      const cx = W / 2, cy = H / 2
      for (const n of nodesRef.current) {
        if (n.id === draggingRef.current) continue
        n.vx = (n.vx || 0) - (n.y - cy) * SWIRL
        n.vy = (n.vy || 0) + (n.x - cx) * SWIRL
      }
    }

    if (reduced) {
      for (let i = 0; i < 160; i++) sim.tick()   // settle once, statically
      tick(n => n + 1)
    } else {
      const loop = () => {
        applySwirl()
        sim.tick()
        tick(n => n + 1)
        frameRef.current = requestAnimationFrame(loop)
      }
      frameRef.current = requestAnimationFrame(loop)
    }

    return () => {
      sim.stop()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const getSVGCoords = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    }
  }

  const onNodeDown = (e, nodeId) => {
    e.preventDefault()
    setHint(false)
    draggingRef.current = nodeId
    const node = nodesRef.current.find(n => n.id === nodeId)
    if (node) { node.fx = node.x; node.fy = node.y }
  }

  const onSVGMove = (e) => {
    if (!draggingRef.current) return
    const { x, y } = getSVGCoords(e)
    const node = nodesRef.current.find(n => n.id === draggingRef.current)
    if (node) { node.fx = x; node.fy = y }
  }

  const onSVGUp = () => {
    if (!draggingRef.current) return
    const node = nodesRef.current.find(n => n.id === draggingRef.current)
    // Release the node so it springs back into the swirling system with inertia.
    if (node) { node.fx = null; node.fy = null }
    draggingRef.current = null
  }

  const nodes = nodesRef.current
  const links = linksRef.current

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true" className="card-graph"
      onMouseMove={onSVGMove}
      onMouseUp={onSVGUp}
      onMouseLeave={onSVGUp}
      onMouseDown={e => e.preventDefault()}
    >
      {links.map((l, i) => {
        const sx = typeof l.source === 'object' ? l.source.x : W / 2
        const sy = typeof l.source === 'object' ? l.source.y : H / 2
        const tx = typeof l.target === 'object' ? l.target.x : W / 2
        const ty = typeof l.target === 'object' ? l.target.y : H / 2
        return (
          <line key={i}
            x1={clamp(sx, 2, W - 2)} y1={clamp(sy, 2, H - 2)}
            x2={clamp(tx, 2, W - 2)} y2={clamp(ty, 2, H - 2)}
            stroke="var(--sepia)" strokeWidth="1" opacity="0.45" />
        )
      })}
      {nodes.map(n => {
        const cx = clamp(n.x ?? W / 2, n.r + 4, W - n.r - 4)
        const cy = clamp(n.y ?? H / 2, n.r + 4, H - n.r - 4)
        return (
          <g key={n.id} onMouseDown={e => onNodeDown(e, n.id)}
            style={{ cursor: draggingRef.current === n.id ? 'grabbing' : 'grab' }}>
            <circle cx={cx} cy={cy} r={n.r}
              fill={
                n.kind === 'hub'  ? 'color-mix(in srgb, var(--verdigris) 22%, var(--paper))' :
                n.kind === 'mid'  ? 'color-mix(in srgb, var(--prussian) 22%, var(--paper))' :
                'var(--prussian)'
              }
              stroke={n.kind === 'hub' ? 'var(--verdigris)' : n.kind === 'mid' ? 'var(--prussian)' : 'none'}
              strokeWidth={n.kind === 'leaf' ? 0 : 1.5}
              opacity={n.kind === 'leaf' ? 0.5 : 1}
            />
            {/* Larger invisible hit target for small nodes */}
            <circle cx={cx} cy={cy} r={Math.max(n.r, 10)} fill="transparent" />
            {n.label && (
              <text x={cx} y={cy + n.r + 14} textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="12" fontStyle="italic"
                fill="var(--prussian)" opacity="0.85"
                style={{ pointerEvents: 'none' }}>
                {n.label}
              </text>
            )}
          </g>
        )
      })}

      {/* First-time affordance: hint that the nodes are draggable */}
      <text x={W / 2} y={H - 4} textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="1.5"
        fill="var(--verdigris)"
        style={{ pointerEvents: 'none', opacity: hint ? 0.6 : 0, transition: 'opacity 0.5s ease' }}>
        ↔ drag the nodes
      </text>
    </svg>
  )
}

