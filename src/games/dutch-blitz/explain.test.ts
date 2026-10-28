import { expect, test } from 'vitest'
import { explainCount } from './explain'

test('the player who called Blitz', () => {
  expect(explainCount('Grandpa', { middle: 18, left: 0 })).toBe(
    'Grandpa: 18 in the middle, none left, so they called Blitz. +18.',
  )
})

test('cards left count against them', () => {
  expect(explainCount('Ava', { middle: 15, left: 3 })).toBe(
    'Ava: 15 in the middle, 3 left in the Blitz pile (−6). +9.',
  )
})

test('a negative round', () => {
  expect(explainCount('Dad', { middle: 4, left: 7 })).toBe(
    'Dad: 4 in the middle, 7 left in the Blitz pile (−14). −10.',
  )
})
