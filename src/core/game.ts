import type { Game, Side } from './types'

export type Totals = Record<string, number>

export type Outcome = {
  winner: string
  // one line for the winner screen, like "Both teams passed 500, so the bidders win."
  note?: string
}

export type ScoreContext<Settings> = {
  sides: Side[]
  settings: Settings
  totals: Totals
}

// Everything the app needs to know about one game's scoring. Screens live next to it in
// src/games/<id>, but nothing in here touches the UI, so it's all easy to test.
export type GameDefinition<Settings, Input> = {
  id: string
  name: string
  target: number
  // what one round is called at the table: a "hand" in 500, a "round" in Dutch Blitz
  roundName: string
  score: (input: Input, ctx: ScoreContext<Settings>) => Totals
  // runs after each round with the new totals; null means keep playing
  outcome: (input: Input, ctx: ScoreContext<Settings>) => Outcome | null
}

export type ReplayedRound<Input> = {
  id: string
  input: Input
  delta: Totals
  totals: Totals
}

export type Replay<Input> = {
  rounds: ReplayedRound<Input>[]
  totals: Totals
  outcome: Outcome | null
}

export function replay<Settings, Input>(
  definition: GameDefinition<Settings, Input>,
  game: Game<Settings, Input>,
): Replay<Input> {
  let totals: Totals = Object.fromEntries(game.sides.map((side) => [side.id, 0]))
  let outcome: Outcome | null = null
  const rounds: ReplayedRound<Input>[] = []

  for (const round of game.rounds) {
    const ctx = { sides: game.sides, settings: game.settings, totals }
    const delta = definition.score(round.input, ctx)
    totals = Object.fromEntries(
      game.sides.map((side) => [side.id, totals[side.id] + (delta[side.id] ?? 0)]),
    )
    rounds.push({ id: round.id, input: round.input, delta, totals })
    outcome = definition.outcome(round.input, { ...ctx, totals })
    if (outcome) break
  }

  return { rounds, totals, outcome }
}

export function signed(n: number) {
  if (n > 0) return `+${n}`
  if (n < 0) return `−${Math.abs(n)}`
  return '0'
}
