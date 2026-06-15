// Shared reduced-motion guard. Animations gate on this so the page
// collapses to a calm static state for users who ask for less motion.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
