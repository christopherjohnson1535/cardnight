// A side is whoever scores together: a team in 500, one player in Dutch Blitz.
export type Side = {
  id: string
  name: string
  players: string[]
}

export type Round<Input = unknown> = {
  id: string
  input: Input
  at: number
}

// We keep what happened each round, never the totals. Totals come from replaying rounds,
// so undo and editing an old round can't leave a total out of sync.
export type Game<Settings = unknown, Input = unknown> = {
  id: string
  type: string
  sides: Side[]
  settings: Settings
  rounds: Round<Input>[]
  createdAt: number
  finishedAt?: number
}
