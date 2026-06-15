import { useState } from 'react'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 30 30" fill="none" aria-hidden="true" className="btn-arrow-svg">
      <path
        d="M21.3484 15.6243H6.875C6.69708 15.6243 6.54844 15.5646 6.42906 15.4452C6.30969 15.3258 6.25 15.1772 6.25 14.9993C6.25 14.8214 6.30969 14.6727 6.42906 14.5533C6.54844 14.434 6.69708 14.3743 6.875 14.3743H21.3484L14.5506 7.57615C14.4288 7.45448 14.365 7.31105 14.3594 7.14584C14.3538 6.98084 14.4199 6.82938 14.5578 6.69146C14.6955 6.55855 14.8429 6.49084 15 6.48834C15.1571 6.48605 15.3045 6.55375 15.4422 6.69146L23.0431 14.2924C23.1523 14.4016 23.2289 14.513 23.2728 14.6268C23.317 14.7405 23.3391 14.8647 23.3391 14.9993C23.3391 15.1339 23.317 15.258 23.2728 15.3718C23.2289 15.4855 23.1523 15.597 23.0431 15.7061L15.4422 23.3071C15.3253 23.424 15.1831 23.4865 15.0156 23.4946C14.8481 23.5025 14.6955 23.44 14.5578 23.3071C14.4199 23.1692 14.3509 23.0205 14.3509 22.8611C14.3509 22.7016 14.4199 22.5529 14.5578 22.4152L21.3484 15.6243Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Portrait() {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className="portrait-wrap">
      {!failed && (
        <img
          src={`${import.meta.env.BASE_URL}assets/portrait.jpg`}
          alt="Elizaveta Zezyulya"
          className={`portrait-photo${loaded ? ' loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {(!loaded || failed) && (
        <svg
          viewBox="0 0 400 500"
          xmlns="http://www.w3.org/2000/svg"
          className="portrait-placeholder"
          aria-label="Portrait placeholder"
        >
          <rect x="1" y="1" width="398" height="498" fill="none" stroke="#6B5638" strokeWidth="1" />
          <rect x="8" y="8" width="384" height="484" fill="none" stroke="#6B5638" strokeWidth="0.4" strokeDasharray="4 4" />
          <ellipse cx="200" cy="168" rx="72" ry="86" fill="none" stroke="#6B5638" strokeWidth="1" />
          <path d="M80,500 Q78,370 128,336 Q164,316 200,312 Q236,316 272,336 Q322,370 320,500" fill="none" stroke="#6B5638" strokeWidth="1" />
          <text x="200" y="456" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontStyle="italic" letterSpacing="2" fill="#6B5638" opacity="0.75">[ PORTRAIT ]</text>
          {[[12,12],[388,12],[12,488],[388,488]].map(([x,y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#6B5638" strokeWidth="0.8" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#6B5638" strokeWidth="0.8" />
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-name">
      <div className="container">
        <div className="hero-text" data-reveal>
          <p className="hero-salutation" aria-label="Addressed to Novasign">
            Hi, Novasign<span className="hero-caret" aria-hidden="true">▌</span>
          </p>
          <div className="hero-name-block">
            <div>
              <h1 className="hero-name" id="hero-name">Elizaveta Zezyulya</h1>
              <p className="hero-role">Science Communication &amp; Content, Biotech / Life Sciences</p>
            </div>
          </div>

          <p className="hero-intro">
            I turn bioprocessing, genomics, and life-science topics into{' '}
            <span className="accent-key">clear, accurate content</span>. MSc in Biotechnology
            (Bioinformatics), now based in Vienna with a work permit and focused on{' '}
            <span className="accent-key">B2B SaaS marketing for biotech</span>.
            I work across the full stack: brief, copy, deck, post, one-pager.
          </p>

          <div className="hero-ctas">
            <a href="mailto:liza.zez1@hotmail.com" className="btn btn-accent">
              <span className="btn-label">Contact</span>
              <span className="btn-arrow"><ArrowIcon /></span>
            </a>
            <a href={`${import.meta.env.BASE_URL}assets/CV Zezyulya_Junior Marketing Manager.pdf`}
              className="btn btn-outline" download="CV Zezyulya - Junior Marketing Manager.pdf">
              <span className="btn-label">Download CV</span>
              <span className="btn-arrow"><ArrowIcon /></span>
            </a>
          </div>

          <div className="hero-contact">
            <span>+43 676 595 1997</span><br />
            <span>Vienna, Austria</span>
          </div>
        </div>

        <aside className="portrait-frame" aria-label="Portrait of Elizaveta Zezyulya" data-reveal>
          <Portrait />
        </aside>
      </div>
    </section>
  )
}

