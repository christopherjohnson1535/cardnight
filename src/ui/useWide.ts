import { useSyncExternalStore } from 'react'

// Tailwind's lg breakpoint: iPads held sideways and desktop browsers
const query = '(min-width: 1024px)'

function subscribe(onChange: () => void) {
  const list = window.matchMedia(query)
  list.addEventListener('change', onChange)
  return () => list.removeEventListener('change', onChange)
}

// true when there's room for the scoreboard and round entry side by side
export function useWide() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
