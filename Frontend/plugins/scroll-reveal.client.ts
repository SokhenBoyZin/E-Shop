export default defineNuxtPlugin((nuxtApp) => {
  const SELECTOR =
    '.reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-blur'

  let observer: IntersectionObserver | null = null

  const ensureObserver = () => {
    if (observer) return observer
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    )

    return observer
  }

  const scan = () => {
    const obs = ensureObserver()
    const nodes = document.querySelectorAll(SELECTOR)

    if (!obs) {
      nodes.forEach((el) => el.classList.add('revealed'))
      return
    }

    nodes.forEach((el) => {
      if (!el.classList.contains('revealed')) obs.observe(el)
    })
  }

  const schedule = () => {
    requestAnimationFrame(() => {
      setTimeout(scan, 40)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule)
  } else {
    schedule()
  }

  nuxtApp.hook('page:finish', schedule)
  nuxtApp.hook('app:mounted', schedule)
})
