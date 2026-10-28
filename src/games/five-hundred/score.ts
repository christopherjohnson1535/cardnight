import type { GameDefinition, Outcome, ScoreContext, Totals } from '../../core/game'

// Bids rank low to high in this order. Each step up a suit is worth 20.
export const SUITS = ['s', 'c', 'd', 'h', 'n'] as const
export type Suit = (typeof SUITS)[number]

export const TRICK_COUNTS = [6, 7, 8, 9, 10] as const

export type Bid = { tricks: number; suit: Suit }

export type Hand =
  | { kind: 'played'; bidder: string; bid: Bid; tricks: number } // tricks the bidders took
  | { kind: 'passed' } // everyone passed and the cards were redealt

export type Settings = {
  // American 500 usually doesn't give one; some tables score all ten tricks as at least 250
  slamBonus: boolean
}

export const defaultSettings: Settings = { slamBonus: false }

export const TARGET = 500

// The Avondale table: 40 for six spades, +20 per suit, +100 per extra trick.
export function bidValue(bid: Bid): number {
  return 40 + 20 * SUITS.indexOf(bid.suit) + 100 * (bid.tricks - 6)
}

function otherSide(ctx: ScoreContext<Settings>, id: string) {
  return ctx.sides.find((side) => side.id !== id)!.id
}

export function scoreHand(hand: Hand, ctx: ScoreContext<Settings>): Totals {
  const totals: Totals = Object.fromEntries(ctx.sides.map((side) => [side.id, 0]))
  if (hand.kind === 'passed') return totals

  const value = bidValue(hand.bid)
  const made = hand.tricks >= hand.bid.tricks
  const slam = ctx.settings.slamBonus && made && hand.tricks === 10 && value < 250

  totals[hand.bidder] = made ? (slam ? 250 : value) : -value
  // the other team always gets 10 for each trick it took, made or not
  totals[otherSide(ctx, hand.bidder)] = (10 - hand.tricks) * 10
  return totals
}

export function handOutcome(hand: Hand, ctx: ScoreContext<Settings>): Outcome | null {
  const reached = ctx.sides.filter((side) => ctx.totals[side.id] >= TARGET)

  if (reached.length === 2 && hand.kind === 'played') {
    return {
      winner: hand.bidder,
      note: 'Both teams passed 500 on the same hand, so the bidders win.',
    }
  }
  if (reached.length === 1) return { winner: reached[0].id }

  const out = ctx.sides.find((side) => ctx.totals[side.id] <= -TARGET)
  if (out) {
    return {
      winner: otherSide(ctx, out.id),
      note: `${out.name} fell to −500.`,
    }
  }
  return null
}

export const fiveHundred: GameDefinition<Settings, Hand> = {
  id: '500',
  name: '500',
  target: TARGET,
  roundName: 'hand',
  score: scoreHand,
  outcome: handOutcome,
}
