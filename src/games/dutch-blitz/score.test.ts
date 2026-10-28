import { describe, expect, test } from 'vitest'
import { replay } from '../../core/game'
import type { Game } from '../../core/types'
import { countScore, dutchBlitz, type Round, type Settings } from './score'

const sides = ['grandpa', 'ava', 'sam'].map((id) => ({ id, name: id, players: [] }))

function game(...rounds: Round[]): Game<Settings, Round> {
  return {
    id: 'g',
    type: 'blitz',
    sides,
    settings: {},
    rounds: rounds.map((input, i) => ({ id: String(i), input, at: i })),
    createdAt: 0,
  }
}

const round = (g: [number, number], a: [number, number], s: [number, number]): Round => ({
  grandpa: { middle: g[0], left: g[1] },
  ava: { middle: a[0], left: a[1] },
  sam: { middle: s[0], left: s[1] },
})

describe('round scores', () => {
  test('cards in the middle count one each', () => {
    expect(countScore({ middle: 18, left: 0 })).toBe(18)
  })

  test('cards left in the Blitz pile cost two each', () => {
    expect(countScore({ middle: 15, left: 3 })).toBe(9)
  })

  test('a round can go negative', () => {
    expect(countScore({ middle: 4, left: 7 })).toBe(-10)
  })

  test('a normal round adds up for everyone', () => {
    const { totals, outcome } = replay(dutchBlitz, game(round([18, 0], [15, 3], [4, 7])))
    expect(totals).toEqual({ grandpa: 18, ava: 9, sam: -10 })
    expect(outcome).toBeNull()
  })
})

describe('winning', () => {
  // grandpa 60, ava 70, sam 10 after these
  const opening = [round([30, 0], [30, 0], [10, 0]), round([30, 0], [40, 0], [0, 0])]

  test('the first to 75 wins', () => {
    const { outcome } = replay(dutchBlitz, game(...opening, round([20, 0], [2, 0], [0, 0])))
    expect(outcome).toEqual({ winner: 'grandpa' })
  })

  test('two passing 75 together: the higher total wins', () => {
    const { totals, outcome } = replay(dutchBlitz, game(...opening, round([20, 0], [8, 0], [0, 0])))
    expect(totals).toMatchObject({ grandpa: 80, ava: 78 })
    expect(outcome?.winner).toBe('grandpa')
    expect(outcome?.note).toBe(
      'Two players passed 75 in the same round, so the highest total wins.',
    )
  })

  test('a tie at the top past 75 means another round', () => {
    const tied = game(...opening, round([20, 0], [10, 0], [0, 0]))
    expect(replay(dutchBlitz, tied).outcome).toBeNull()

    const { outcome } = replay(
      dutchBlitz,
      game(...tied.rounds.map((r) => r.input), round([0, 1], [3, 0], [0, 0])),
    )
    expect(outcome?.winner).toBe('ava')
  })

  test('landing exactly on 75 wins', () => {
    const { outcome } = replay(dutchBlitz, game(...opening, round([0, 0], [5, 0], [0, 0])))
    expect(outcome).toEqual({ winner: 'ava' })
  })
})
