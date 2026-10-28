import type { GameDefinition } from '../core/game'
import { dutchBlitz } from './dutch-blitz/score'
import { playerLook } from './dutch-blitz/players'
import { fiveHundred } from './five-hundred/score'
import { teamLooks } from './five-hundred/teams'

// How a side shows up outside its own game, like on the home screen's continue card:
// a suit for 500 teams, a colored chip for Blitz players.
export type SideLook = { glyph?: string; red?: boolean; chip?: string; bar: string }

export type GameEntry = {
  id: string
  name: string
  blurb: string
  definition?: GameDefinition<any, any>
  look?: (index: number) => SideLook
}

// One line per game. A game without a definition shows on the home screen as coming soon.
export const games: GameEntry[] = [
  {
    id: '500',
    name: '500',
    blurb: 'Teams of two',
    definition: fiveHundred,
    look: (i) => {
      const team = teamLooks[i] ?? teamLooks[0]
      return { glyph: team.suit, red: team.red, bar: team.bar }
    },
  },
  {
    id: 'blitz',
    name: 'Dutch Blitz',
    blurb: '2–6 players',
    definition: dutchBlitz,
    look: (i) => ({ chip: playerLook(i).color, bar: playerLook(i).bar }),
  },
]

export function gameFor(type: string) {
  return games.find((game) => game.id === type)
}

export function definitionFor(type: string) {
  return gameFor(type)?.definition
}
