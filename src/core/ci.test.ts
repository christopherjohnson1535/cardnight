import { expect, test } from 'vitest'

test('ci catches a failing test', () => {
  expect(1 + 1).toBe(3)
})
