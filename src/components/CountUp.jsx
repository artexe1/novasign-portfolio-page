import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/* Animates the numeric part of a label (e.g. "15,000+", "€1M", "50+")
   from 0 to its value when it scrolls into view. Prefix/suffix preserved. */
export default function CountUp({ value, duration = 1100 }) {
  const m = String(value).match(/^(\D*)([\d,.]+)(.*)$/)
  const prefix = m ? m[1] : ''
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : 0
  const suffix = m ? m[3] : ''
  const hadComma = m ? m[2].includes(',') : false

  const ref = useRef(null)
  const [n, setN] = useState(prefersReducedMotion() ? target : 0)
  const done = useRef(false)

  const fmt = (x) => {
    const v = Math.round(x)
    return hadComma ? v.toLocaleString('en-US') : String(v)
  }

  useEffect(() => {
    if (!m || prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !done.current) {
        done.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - t, 3)
          setN(target * ease)
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [m, target, duration])

  return <span ref={ref}>{prefix}{fmt(n)}{suffix}</span>
}
