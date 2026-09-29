import { onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Lightweight scroll-reveal using IntersectionObserver.
 * Elements with class "reveal", "reveal-scale", "reveal-left", "reveal-right"
 * will receive the "revealed" class when they enter the viewport.
 */
export function useScrollReveal(options?: {
  rootMargin?: string
  threshold?: number
  once?: boolean
}) {
  const {
    rootMargin = '0px 0px -8% 0px',
    threshold = 0.12,
    once = true
  } = options || {}

  let observer: IntersectionObserver | null = null

  const observe = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: show everything
      document
        .querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right')
        .forEach((el) => el.classList.add('revealed'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            if (once) observer?.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('revealed')
          }
        })
      },
      { rootMargin, threshold }
    )

    document
      .querySelectorAll(
        '.reveal:not(.revealed), .reveal-scale:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed)'
      )
      .forEach((el) => observer!.observe(el))
  }

  const refresh = async () => {
    await nextTick()
    // Disconnect previous
    observer?.disconnect()
    observe()
  }

  onMounted(() => {
    // Small delay so DOM is fully painted
    requestAnimationFrame(() => {
      setTimeout(observe, 50)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { refresh }
}
