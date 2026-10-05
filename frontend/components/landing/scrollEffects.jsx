'use client'
import { useEffect } from 'react'
/**
 * Efek scroll untuk landing page (tidak merender apa pun):
 * 1. Reveal fade + blur sekali saat elemen [data-reveal] masuk layar (IntersectionObserver).
 * 2. Variabel CSS --page-p (progres halaman) dan --hero-p (hero memudar + blur saat di-scroll).
 * 3. Atribut data-scrolled untuk header kaca.
 * Hanya mengubah variabel CSS; animasinya memakai transform/opacity/filter di CSS.
 */
export function ScrollEffects() {
  useEffect(() => {
    const root = document.querySelector('[data-lp-root]')
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = root.querySelectorAll('[data-reveal]')
    let observer
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          })
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      )
      targets.forEach((el) => io.observe(el))
      observer = io
    }
    const hero = root.querySelector('[data-lp-hero]')
    let ticking = false
    const update = () => {
      ticking = false
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      root.style.setProperty('--page-p', String(max > 0 ? Math.min(y / max, 1) : 0))
      root.toggleAttribute('data-scrolled', y > 24)
      if (hero && !reduce)
        hero.style.setProperty('--hero-p', String(Math.min(y / (hero.offsetHeight * 0.7), 1)))
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return null
}
