import type { GameDefinition, Outcome, ScoreContext, Totals } from '../../core/game'

export const TARGET = 75
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
// a Blitz pile starts with ten cards
export const PILE_SIZE = 10

// What one player counts at the end of a round
export type Count = {
  // their cards in the Dutch piles in the middle, +1 each
  middle: number
  // cards still in their Blitz pile, −2 each
  left: number
}

// one Count per player, by side id
export type Round = Record<string, Count>

// nothing to choose yet, but games carry settings so it has a place
export type Settings = Record<string, never>
export const defaultSettings: Settings = {}

export function countScore(count: Count): number {
  return count.middle - 2 * count.left
}

export function scoreRound(round: Round, ctx: ScoreContext<Settings>): Totals {
  return Object.fromEntries(
    ctx.sides.map((side) => {
      const count = round[side.id]
      return [side.id, count ? countScore(count) : 0]
    }),
  )
}

export function roundOutcome(_round: Round, ctx: ScoreContext<Settings>): Outcome | null {
  const ranked = [...ctx.sides].sort((a, b) => ctx.totals[b.id] - ctx.totals[a.id])
  const [first, second] = ranked
  if (ctx.totals[first.id] < TARGET) return null

  const passed = ranked.filter((side) => ctx.totals[side.id] >= TARGET)
  if (second && ctx.totals[second.id] === ctx.totals[first.id]) {
    // tied at the top: nobody wins yet
    return null
  }
  if (passed.length > 1) {
    return {
      winner: first.id,
      note: `${passed.length === 2 ? 'Two players' : `${passed.length} players`} passed 75 in the same round, so the highest total wins.`,
    }
  }
  return { winner: first.id }
}

export const dutchBlitz: GameDefinition<Settings, Round> = {
  id: 'blitz',
  name: 'Dutch Blitz',
  target: TARGET,
  roundName: 'round',
  score: scoreRound,
  outcome: roundOutcome,
}
