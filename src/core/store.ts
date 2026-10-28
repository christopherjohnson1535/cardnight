import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Game, Side } from './types'

type State = {
  games: Record<string, Game>
}

type Actions = {
  startGame: (type: string, sides: Side[], settings: unknown) => string
  addRound: (gameId: string, input: unknown) => void
  editRound: (gameId: string, roundId: string, input: unknown) => void
  undoRound: (gameId: string) => void
  finishGame: (gameId: string) => void
  reopenGame: (gameId: string) => void
  removeGame: (gameId: string) => void
  clearGames: () => void
}

export type GameStore = State & Actions

// Bump when the saved shape changes, and add a step to migrate().
const VERSION = 1

const id = () => crypto.randomUUID()

function update(state: State, gameId: string, change: (game: Game) => Game): State {
  const game = state.games[gameId]
  if (!game) return state
  return { games: { ...state.games, [gameId]: change(game) } }
}

export const createGameStore = () =>
  create<GameStore>()(
    persist(
      (set) => ({
        games: {},

        startGame: (type, sides, settings) => {
          const game: Game = { id: id(), type, sides, settings, rounds: [], createdAt: Date.now() }
          set((state) => ({ games: { ...state.games, [game.id]: game } }))
          return game.id
        },

        addRound: (gameId, input) =>
          set((state) =>
            update(state, gameId, (game) => ({
              ...game,
              rounds: [...game.rounds, { id: id(), input, at: Date.now() }],
            })),
          ),

        editRound: (gameId, roundId, input) =>
          set((state) =>
            update(state, gameId, (game) => ({
              ...game,
              rounds: game.rounds.map((round) =>
                round.id === roundId ? { ...round, input } : round,
              ),
            })),
          ),

        undoRound: (gameId) =>
          set((state) =>
            update(state, gameId, (game) => ({
              ...game,
              rounds: game.rounds.slice(0, -1),
              finishedAt: undefined,
            })),
          ),

        finishGame: (gameId) =>
          set((state) => update(state, gameId, (game) => ({ ...game, finishedAt: Date.now() }))),

        reopenGame: (gameId) =>
          set((state) => update(state, gameId, (game) => ({ ...game, finishedAt: undefined }))),

        removeGame: (gameId) =>
          set((state) => {
            const games = { ...state.games }
            delete games[gameId]
            return { games }
          }),

        clearGames: () => set({ games: {} }),
      }),
      {
        name: 'cardnight:games',
        version: VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ games: state.games }),
        migrate: (saved) => saved as State,
      },
    ),
  )

export const useGames = createGameStore()

// The most recent game nobody has finished, for the "continue" card on the home screen.
export function latestOpenGame(games: Record<string, Game>): Game | undefined {
  return Object.values(games)
    .filter((game) => !game.finishedAt)
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

// Browsers can clear site data when space runs low. Asking once makes that much less likely.
export function askToKeepStorage() {
  navigator.storage?.persist?.().catch(() => {})
}

// Keep finishedAt in step with the scores, so fixing or undoing the winning round reopens the game.
export function useKeepFinished(game: Game, over: boolean) {
  const finishGame = useGames((state) => state.finishGame)
  const reopenGame = useGames((state) => state.reopenGame)
  const finished = game.finishedAt !== undefined
  useEffect(() => {
    if (over && !finished) finishGame(game.id)
    if (!over && finished) reopenGame(game.id)
  }, [over, finished, game.id, finishGame, reopenGame])
}
