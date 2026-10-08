'use client'
import { useEffect } from 'react'

/**
 * Efek scroll landing page (tidak merender apa pun). Dirancang agar ringan:
 * 1. Reveal sekali per elemen [data-reveal] lewat IntersectionObserver (CSS hanya opacity + transform).
 * 2. Header kaca: IntersectionObserver pada penanda 24px di puncak halaman, tanpa listener scroll.
 * 3. Animasi ambient hanya berjalan di bagian yang sedang terlihat (kelas .is-in-view).
 * 4. Progres halaman dan hero memudar dijalankan CSS scroll-driven animation (di compositor).
 *    JavaScript hanya cadangan untuk browser tanpa dukungan, dan menulis langsung ke elemennya;
 *    tidak lagi mengubah variabel CSS di elemen akar yang memaksa hitung ulang gaya seluruh halaman.
 */
export function ScrollEffects() {
  useEffect(() => {
    const root = document.querySelector('[data-lp-root]')
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasIO = 'IntersectionObserver' in window
    const cleanups = []

    // 1. Reveal
    const targets = root.querySelectorAll('[data-reveal]')
    if (reduce || !hasIO) {
      targets.forEach((el) => el.classList.add('is-visible'))
    } else {
      const reveal = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-visible')
            reveal.unobserve(entry.target)
          })
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      )
      targets.forEach((el) => reveal.observe(el))
      cleanups.push(() => reveal.disconnect())
    }

    // 2. Header kaca: penanda di puncak halaman menggantikan listener scroll
    if (hasIO) {
      const sentinel = document.createElement('div')
      sentinel.setAttribute('aria-hidden', 'true')
      Object.assign(sentinel.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '1px',
        height: '24px',
        pointerEvents: 'none',
      })
      root.prepend(sentinel)
      const header = new IntersectionObserver(([entry]) => {
        root.toggleAttribute('data-scrolled', !entry.isIntersecting)
      })
      header.observe(sentinel)
      cleanups.push(() => {
        header.disconnect()
        sentinel.remove()
      })
    }

    // 3. Ambient hanya untuk bagian yang terlihat
    if (hasIO && !reduce) {
      const sections = root.querySelectorAll('.lp-section')
      const ambient = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.target.classList.toggle('is-in-view', e.isIntersecting)),
        { rootMargin: '10% 0px' },
      )
      sections.forEach((el) => ambient.observe(el))
      cleanups.push(() => ambient.disconnect())
    }

    // 4. Cadangan untuk browser tanpa CSS scroll-driven animation
    const supportsTimeline = typeof CSS !== 'undefined' && CSS.supports('(animation-timeline: scroll())')
    if (!supportsTimeline && !reduce) {
      const bar = root.querySelector('.lp-progress')
      const heroInner = root.querySelector('.lp-hero-inner')
      const hero = root.querySelector('[data-lp-hero]')
      let heroHeight = 0
      let maxScroll = 0
      let ticking = false

      // Ukuran dibaca sekali dan saat berubah saja, bukan di setiap frame scroll
      const measure = () => {
        heroHeight = hero ? hero.offsetHeight : 0
        maxScroll = document.documentElement.scrollHeight - window.innerHeight
      }
      const apply = () => {
        ticking = false
        const y = window.scrollY
        if (bar) bar.style.transform = `scaleX(${maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0})`
        if (heroInner && heroHeight) {
          const p = Math.min(y / (heroHeight * 0.7), 1)
          heroInner.style.opacity = String(1 - p * 0.85)
          heroInner.style.transform = `translate3d(0, ${p * -48}px, 0)`
        }
      }
      const onScroll = () => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(apply)
      }

      measure()
      apply()
      window.addEventListener('scroll', onScroll, { passive: true })
      const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { measure(); onScroll() }) : null
      resize?.observe(root)
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll)
        resize?.disconnect()
      })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])
  return null
}
