import { useEffect } from 'react'
import Hero from './sections/Hero'
import Plates from './sections/Plates'
import FitSection from './sections/FitSection'
import WhyHer from './sections/WhyHer'
import Footer from './sections/Footer'
import { prefersReducedMotion } from './lib/motion'
import './App.css'

export default function App() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    if (prefersReducedMotion()) {
      els.forEach(el => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <Hero />
      <Plates />
      <FitSection />
      <WhyHer />
      <Footer />
    </>
  )
}
