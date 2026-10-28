import { expect, test } from 'vitest'
import { explainHand } from './explain'

const sides = [
  { id: 'a', name: 'Mom & Dad', players: [] },
  { id: 'b', name: 'Kids', players: [] },
]

test('a made bid', () => {
  const hand = { kind: 'played', bidder: 'a', bid: { tricks: 8, suit: 'h' }, tricks: 8 } as const
  expect(explainHand(hand, sides, { a: 300, b: 20 })).toBe(
    'Mom & Dad bid 8♥ for 300 and took 8, so +300. Kids took 2 tricks, +20.',
  )
})

test('going set', () => {
  const hand = { kind: 'played', bidder: 'b', bid: { tricks: 7, suit: 'c' }, tricks: 6 } as const
  expect(explainHand(hand, sides, { a: 40, b: -160 })).toBe(
    'Kids bid 7♣ for 160 but took 6, so −160. Mom & Dad took 4 tricks, +40.',
  )
})

test('a slam with the bonus on', () => {
  const hand = { kind: 'played', bidder: 'b', bid: { tricks: 7, suit: 'd' }, tricks: 10 } as const
  expect(explainHand(hand, sides, { a: 0, b: 250 })).toBe(
    'Kids bid 7♦ for 180 and took all ten, which scores 250. Mom & Dad took no tricks.',
  )
})

test('one trick reads as one trick', () => {
  const hand = { kind: 'played', bidder: 'b', bid: { tricks: 9, suit: 'n' }, tricks: 9 } as const
  expect(explainHand(hand, sides, { a: 10, b: 420 })).toBe(
    'Kids bid 9NT for 420 and took 9, so +420. Mom & Dad took 1 trick, +10.',
  )
})

test('a redeal', () => {
  expect(explainHand({ kind: 'passed' }, sides, { a: 0, b: 0 })).toBe(
    'Everyone passed, so the cards were redealt.',
  )
})
