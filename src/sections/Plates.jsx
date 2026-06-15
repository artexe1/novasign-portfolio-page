import { useState } from 'react'

const PLATES = [
  {
    id: 3,
    eyebrow: 'Plate I',
    src: `${import.meta.env.BASE_URL}assets/plate-3.jpg`,
  },
  {
    id: 1,
    eyebrow: 'Plate II',
    src: `${import.meta.env.BASE_URL}assets/plate-1.jpg`,
  },
  {
    id: 2,
    eyebrow: 'Plate III',
    src: `${import.meta.env.BASE_URL}assets/plate-2.jpg`,
  },
]

function PlaceholderSVG({ n }) {
  return (
    <svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }} aria-hidden="true">
      <rect x="2" y="2" width="796" height="556" fill="none" stroke="#6B5638" strokeWidth="1" />
      <rect x="12" y="12" width="776" height="536" fill="none" stroke="#6B5638" strokeWidth="0.4" strokeDasharray="5 5" />
      <text x="400" y="288" textAnchor="middle"
        fontFamily="Inter, sans-serif" fontSize="16"
        fontStyle="italic" letterSpacing="3" fill="#6B5638" opacity="0.4">
        [ PLATE {n} ]
      </text>
    </svg>
  )
}

function SlideImage({ src, n, active }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="slide-image-wrap">
      {!failed ? (
        <img
          src={src}
          alt={`Plate ${n}`}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <PlaceholderSVG n={n} />
      )}
    </div>
  )
}

export default function Plates() {
  const [current, setCurrent] = useState(0)
  const total = PLATES.length

  const prev = () => setCurrent(i => (i - 1 + total) % total)
  const next = () => setCurrent(i => (i + 1) % total)

  const plate = PLATES[current]

  return (
    <section className="plates" aria-labelledby="plates-heading">
      <div className="container">
        <h2 className="section-heading" id="plates-heading" data-reveal>Selected Work</h2>
        <p className="section-sub" data-reveal>Science communication work, 2020–present.</p>
        <p className="plates-note" data-reveal>
          These pieces were built from scientific publications and research conducted at the
          genomic centre, for the website and as part of a science exhibition. I briefed the
          designer and explained the nuances of how the content should be presented, reframed the
          information into a form anyone (not just scientists) could understand, produced the
          printed materials, and published them on the site.
        </p>

        <div className="slider-wrap" data-reveal>
          {/* Main slide */}
          <div className="slider-stage">
            <button className="slider-btn slider-btn--prev" onClick={prev} aria-label="Previous plate">
              <span aria-hidden="true">←</span>
            </button>

            <article className="slider-plate" key={plate.id}>
              <div className="slider-eyebrow-row">
                <span className="plate-eyebrow">{plate.eyebrow}</span>
                <span className="slider-counter">{current + 1} / {total}</span>
              </div>
              <SlideImage src={plate.src} n={plate.id} active />
            </article>

            <button className="slider-btn slider-btn--next" onClick={next} aria-label="Next plate">
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Dot navigation */}
          <div className="slider-dots" role="tablist" aria-label="Select plate">
            {PLATES.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === current}
                aria-label={p.eyebrow}
                className={`slider-dot${i === current ? ' slider-dot--active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
