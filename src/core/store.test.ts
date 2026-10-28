// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from 'vitest'
import { createGameStore, latestOpenGame } from './store'

const sides = [
  { id: 'a', name: 'Mom & Dad', players: ['Mom', 'Dad'] },
  { id: 'b', name: 'Kids', players: ['Ava', 'Sam'] },
]

beforeEach(() => localStorage.clear())

describe('game store', () => {
  test('a game survives a reload', async () => {
    const first = createGameStore()
    const gameId = first.getState().startGame('500', sides, {})
    first.getState().addRound(gameId, { bid: '8h' })

    // a new store reading the same storage is what a refresh looks like
    const second = createGameStore()
    await second.persist.rehydrate()
    const game = second.getState().games[gameId]

    expect(game.sides).toEqual(sides)
    expect(game.rounds.map((r) => r.input)).toEqual([{ bid: '8h' }])
  })

  test('undo drops the last round only', () => {
    const store = createGameStore()
    const gameId = store.getState().startGame('500', sides, {})
    store.getState().addRound(gameId, 1)
    store.getState().addRound(gameId, 2)
    store.getState().undoRound(gameId)

    expect(store.getState().games[gameId].rounds.map((r) => r.input)).toEqual([1])
  })

  test('editing a round keeps its place', () => {
    const store = createGameStore()
    const gameId = store.getState().startGame('500', sides, {})
    store.getState().addRound(gameId, 1)
    store.getState().addRound(gameId, 2)
    const [first] = store.getState().games[gameId].rounds
    store.getState().editRound(gameId, first.id, 10)

    expect(store.getState().games[gameId].rounds.map((r) => r.input)).toEqual([10, 2])
  })

  test('clearing games keeps the theme', async () => {
    localStorage.setItem('cardnight:theme', 'light')
    const store = createGameStore()
    store.getState().startGame('500', sides, {})
    store.getState().startGame('blitz', sides, {})
    store.getState().clearGames()

    const reloaded = createGameStore()
    await reloaded.persist.rehydrate()
    expect(reloaded.getState().games).toEqual({})
    expect(localStorage.getItem('cardnight:theme')).toBe('light')
  })

  test('latestOpenGame skips finished games', () => {
    const store = createGameStore()
    const older = store.getState().startGame('500', sides, {})
    const newer = store.getState().startGame('blitz', sides, {})
    store.getState().finishGame(newer)

    expect(latestOpenGame(store.getState().games)?.id).toBe(older)
  })
})
