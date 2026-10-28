import { signed, type Totals } from '../../core/game'
import type { Side } from '../../core/types'
import { bidValue, type Hand } from './score'
import { bidLabel } from './suits'

// The "why this score" line under a hand in the history.
export function explainHand(hand: Hand, sides: Side[], delta: Totals): string {
  if (hand.kind === 'passed') return 'Everyone passed, so the cards were redealt.'

  const bidders = sides.find((side) => side.id === hand.bidder)!
  const others = sides.find((side) => side.id !== hand.bidder)!
  const value = bidValue(hand.bid)
  const made = hand.tricks >= hand.bid.tricks
  const theirs = delta[bidders.id]

  const bid = `${bidders.name} bid ${bidLabel(hand.bid)} for ${value}`
  const result = !made
    ? `but took ${hand.tricks}, so ${signed(theirs)}.`
    : hand.tricks === 10 && theirs !== value
      ? `and took all ten, which scores ${theirs}.`
      : `and took ${hand.tricks}, so ${signed(theirs)}.`

  const otherTricks = 10 - hand.tricks
  const defence =
    otherTricks === 0
      ? `${others.name} took no tricks.`
      : `${others.name} took ${otherTricks} ${otherTricks === 1 ? 'trick' : 'tricks'}, ${signed(delta[others.id])}.`

  return `${bid} ${result} ${defence}`
}
