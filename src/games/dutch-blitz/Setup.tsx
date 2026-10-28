import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useGames } from '../../core/store'
import type { Game } from '../../core/types'
import { iconButton, primaryButton, TopBar } from '../../ui/controls'
import { playerLook } from './players'
import { defaultSettings, MAX_PLAYERS, MIN_PLAYERS, TARGET } from './score'

// Start from the last Blitz game's players, since it's usually the same people.
function lastPlayers(games: Record<string, Game>): string[] {
  const last = Object.values(games)
    .filter((game) => game.type === 'blitz')
    .sort((a, b) => b.createdAt - a.createdAt)[0]
  return last ? last.sides.map((side) => side.name) : ['', '']
}

export function Setup() {
  const navigate = useNavigate()
  const startGame = useGames((state) => state.startGame)
  const [names, setNames] = useState(() => lastPlayers(useGames.getState().games))

  const full = names.length >= MAX_PLAYERS

  const start = () => {
    const sides = names.map((name, i) => ({
      id: `p${i + 1}`,
      name: name.trim() || `Player ${i + 1}`,
      players: [],
    }))
    const id = startGame('blitz', sides, defaultSettings)
    navigate(`/game/${id}`, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar
        back="/"
        title="New game"
        right={
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-muted">
            Dutch Blitz
          </span>
        }
      />

      <div className="flex justify-between px-5 pt-1.5 pb-2.5">
        <span className="label">Who's playing</span>
        <span className="font-mono text-xs text-muted">
          {MIN_PLAYERS}–{MAX_PLAYERS} players
        </span>
      </div>
      <ol className="flex flex-col gap-2 px-5">
        {names.map((name, i) => (
          <li
            key={i}
            style={{ animationDelay: `${i * 60}ms` }}
            className="flex h-[58px] animate-rise items-center gap-3 rounded-2xl border border-line bg-surface pr-2 pl-3.5"
          >
            <span
              aria-hidden="true"
              className={`h-8 w-6 shrink-0 rounded-[5px] ${playerLook(i).color}`}
            />
            <input
              aria-label={`Player ${i + 1}`}
              placeholder={`Player ${i + 1}`}
              value={name}
              onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))}
              className="h-10 min-w-0 flex-1 bg-transparent text-[19px] font-medium placeholder:text-muted/60 focus:outline-none"
            />
            {names.length > MIN_PLAYERS && (
              <button
                type="button"
                aria-label={`Remove player ${i + 1}`}
                onClick={() => setNames(names.filter((_, j) => j !== i))}
                className={`${iconButton} size-10 border-transparent bg-transparent text-muted`}
              >
                <span aria-hidden="true" className="text-xl">
                  ×
                </span>
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="px-5 pt-2">
        {full ? (
          <p className="py-3 text-center text-sm text-muted">Six is the most one box plays.</p>
        ) : (
          <button
            type="button"
            onClick={() => setNames([...names, ''])}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line font-medium text-muted transition active:scale-[0.98]"
          >
            <span aria-hidden="true" className="text-xl">
              +
            </span>
            Add a player
          </button>
        )}
      </div>

      <div className="flex justify-between px-5 pt-6 pb-2.5">
        <span className="label">How it's scored</span>
      </div>
      <div className="mx-5 rounded-2xl border border-line bg-surface px-3.5">
        <div className="flex min-h-[56px] items-center border-b border-line">
          <span className="flex-1">Cards in the middle</span>
          <span className="font-semibold tabular-nums">+1 each</span>
        </div>
        <div className="flex min-h-[56px] items-center border-b border-line">
          <span className="flex-1">Left in your Blitz pile</span>
          <span className="font-semibold text-minus tabular-nums">−2 each</span>
        </div>
        <div className="flex min-h-[56px] items-center">
          <span className="flex-1">Play to</span>
          <span className="text-2xl font-semibold tabular-nums">{TARGET}</span>
        </div>
      </div>

      <div className="mt-auto px-5 pt-6 pb-6">
        <button type="button" onClick={start} className={primaryButton}>
          Shuffle up and deal <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
