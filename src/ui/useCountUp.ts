import { useEffect, useRef, useState } from 'react'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// Rolls a number from `from` to `to`, and from wherever it is to any new `to` after that.
export function useCountUp(to: number, from = to, { duration = 900, delay = 0 } = {}) {
  const [value, setValue] = useState(() => (calm() ? to : from))
  const shown = useRef(value)

  useEffect(() => {
    const start = shown.current
    if (start === to || calm()) {
      shown.current = to
      setValue(to)
      return
    }
    const begin = performance.now() + delay
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - begin) / duration))
      const eased = 1 - (1 - t) ** 3
      shown.current = Math.round(start + (to - start) * eased)
      setValue(shown.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [to, duration, delay])

  return value
}
