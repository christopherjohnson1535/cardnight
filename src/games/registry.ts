import type { GameDefinition } from '../core/game'
import { fiveHundred } from './five-hundred/score'

export type GameEntry = {
  id: string
  name: string
  blurb: string
  definition?: GameDefinition<any, any>
}

// One line per game. A game without a definition shows on the home screen as coming soon.
export const games: GameEntry[] = [
  { id: '500', name: '500', blurb: 'Teams of two', definition: fiveHundred },
  { id: 'blitz', name: 'Dutch Blitz', blurb: '2–6 players' },
]

export function definitionFor(type: string) {
  return games.find((game) => game.id === type)?.definition
}
