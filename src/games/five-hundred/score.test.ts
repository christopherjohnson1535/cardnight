import { describe, expect, test } from 'vitest'
import { replay } from '../../core/game'
import type { Game } from '../../core/types'
import {
  bidValue,
  defaultSettings,
  fiveHundred,
  scoreHand,
  type Hand,
  type Settings,
  type Suit,
} from './score'

const sides = [
  { id: 'a', name: 'Mom & Dad', players: ['Mom', 'Dad'] },
  { id: 'b', name: 'Kids', players: ['Ava', 'Sam'] },
]

const ctx = (settings: Settings = defaultSettings, totals = { a: 0, b: 0 }) => ({
  sides,
  settings,
  totals,
})

const played = (bidder: string, tricks: number, suit: Suit, took: number): Hand => ({
  kind: 'played',
  bidder,
  bid: { tricks, suit },
  tricks: took,
})

function game(hands: Hand[], settings = defaultSettings): Game<Settings, Hand> {
  return {
    id: 'g',
    type: '500',
    sides,
    settings,
    rounds: hands.map((input, i) => ({ id: String(i), input, at: i })),
    createdAt: 0,
  }
}

describe('bid table', () => {
  // straight from the Avondale schedule
  const table: Record<number, number[]> = {
    6: [40, 60, 80, 100, 120],
    7: [140, 160, 180, 200, 220],
    8: [240, 260, 280, 300, 320],
    9: [340, 360, 380, 400, 420],
    10: [440, 460, 480, 500, 520],
  }
  const suits: Suit[] = ['s', 'c', 'd', 'h', 'n']

  for (const [tricks, values] of Object.entries(table)) {
    suits.forEach((suit, i) => {
      test(`${tricks}${suit} is worth ${values[i]}`, () => {
        expect(bidValue({ tricks: Number(tricks), suit })).toBe(values[i])
      })
    })
  }
})

describe('scoring a hand', () => {
  test('making the bid scores it, and the other team gets 10 a trick', () => {
    expect(scoreHand(played('a', 8, 'h', 8), ctx())).toEqual({ a: 300, b: 20 })
  })

  test('extra tricks earn nothing extra', () => {
    expect(scoreHand(played('a', 7, 'd', 9), ctx())).toEqual({ a: 180, b: 10 })
  })

  test('going set loses the bid', () => {
    expect(scoreHand(played('b', 7, 'c', 6), ctx())).toEqual({ a: 40, b: -160 })
  })

  test('all ten tricks scores the bid when the slam bonus is off', () => {
    expect(scoreHand(played('b', 7, 'd', 10), ctx())).toEqual({ a: 0, b: 180 })
  })

  test('all ten tricks scores 250 when the slam bonus is on', () => {
    expect(scoreHand(played('b', 7, 'd', 10), ctx({ slamBonus: true }))).toEqual({ a: 0, b: 250 })
  })

  test('the slam bonus never lowers a big bid', () => {
    expect(scoreHand(played('b', 8, 'c', 10), ctx({ slamBonus: true }))).toEqual({ a: 0, b: 260 })
  })

  test('a redeal scores nothing', () => {
    expect(scoreHand({ kind: 'passed' }, ctx())).toEqual({ a: 0, b: 0 })
  })
})

describe('winning', () => {
  test('the sample game from the mockups adds up', () => {
    const result = replay(
      fiveHundred,
      game([
        played('a', 6, 's', 7),
        played('b', 7, 'c', 6),
        played('a', 7, 'd', 8),
        played('b', 8, 'h', 8),
        played('a', 6, 'n', 5),
        played('b', 7, 'h', 7),
      ]),
    )
    expect(result.totals).toEqual({ a: 190, b: 440 })
    expect(result.outcome).toBeNull()
  })

  test('the bidders win by reaching 500', () => {
    const result = replay(fiveHundred, game([played('a', 10, 'n', 10)]))
    expect(result.outcome).toEqual({ winner: 'a' })
  })

  test('the other team can win on trick points', () => {
    // b gets to 480, then takes 2 tricks against a's bid
    const result = replay(fiveHundred, game([played('b', 10, 'd', 10), played('a', 6, 's', 8)]))
    expect(result.totals).toEqual({ a: 40, b: 500 })
    expect(result.outcome).toEqual({ winner: 'b' })
  })

  test('if both teams pass 500 on one hand, the bidders win', () => {
    const hands = [
      played('a', 9, 'h', 10), // a 400, b 0
      played('b', 9, 'h', 9), // a 410, b 400
      played('a', 6, 's', 6), // a 450, b 440
      played('a', 6, 's', 6), // a 490, b 480
    ]
    expect(replay(fiveHundred, game(hands)).outcome).toBeNull()

    // b bids 7 diamonds and takes 8: b gets 180, a gets 20 and also passes 500
    const result = replay(fiveHundred, game([...hands, played('b', 7, 'd', 8)]))
    expect(result.totals).toEqual({ a: 510, b: 660 })
    expect(result.outcome).toEqual({
      winner: 'b',
      note: 'Both teams passed 500 on the same hand, so the bidders win.',
    })
  })

  test('falling to −500 loses', () => {
    const result = replay(fiveHundred, game([played('a', 6, 's', 6), played('a', 10, 'n', 9)]))
    expect(result.totals).toEqual({ a: -480, b: 50 })
    expect(result.outcome).toBeNull()

    const out = replay(fiveHundred, game([played('a', 10, 'h', 9)]))
    expect(out.totals).toEqual({ a: -500, b: 10 })
    expect(out.outcome).toEqual({ winner: 'b', note: 'Mom & Dad fell to −500.' })
  })

  test('rounds after the win are ignored', () => {
    const result = replay(fiveHundred, game([played('a', 10, 'n', 10), played('b', 10, 'n', 10)]))
    expect(result.rounds).toHaveLength(1)
    expect(result.totals).toEqual({ a: 520, b: 0 })
  })
})
