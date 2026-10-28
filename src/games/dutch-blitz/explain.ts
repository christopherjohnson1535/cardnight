import { signed } from '../../core/game'
import { countScore, type Count } from './score'

// One player's line under a round in the history.
export function explainCount(name: string, count: Count): string {
  const middle = `${count.middle} in the middle`
  const left =
    count.left === 0
      ? 'none left, so they called Blitz'
      : `${count.left} left in the Blitz pile (${signed(-2 * count.left)})`
  return `${name}: ${middle}, ${left}. ${signed(countScore(count))}.`
}
