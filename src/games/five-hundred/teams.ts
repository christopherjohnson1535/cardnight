// Team one plays as hearts and team two as spades, on every screen.
export const teamLooks = [
  { suit: '♥', red: true, bar: 'bg-team-a' },
  { suit: '♠', red: false, bar: 'bg-team-b' },
] as const

export const defaultTeamNames = ['Hearts', 'Spades']
