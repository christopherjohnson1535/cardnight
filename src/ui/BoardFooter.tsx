import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useGames } from '../core/store'
import type { Game, Round } from '../core/types'
import { iconButton, primaryButton } from './controls'

type Props = {
  game: Game
  // "hand" or "round"
  roundName: string
}

const pad = (n: number) => String(n).padStart(2, '0')

// The bar at the bottom of a scoreboard: undo the last round, or enter the next one.
export function BoardFooter({ game, roundName }: Props) {
  const { undoRound, addRound } = useGames()
  const next = pad(game.rounds.length + 1)
  const label = roundName[0].toUpperCase() + roundName.slice(1)

  // the round that was just undone, so it can be put back for a few seconds
  const [undone, setUndone] = useState<Round>()
  useEffect(() => {
    if (!undone) return
    const timer = setTimeout(() => setUndone(undefined), 6000)
    return () => clearTimeout(timer)
  }, [undone])

  const undo = () => {
    const round = game.rounds.at(-1)
    if (!round) return
    undoRound(game.id)
    setUndone(round)
  }

  return (
    <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-table from-70% to-transparent px-5 pt-6 pb-6">
      {undone && (
        <div
          role="status"
          className="mb-3 flex animate-rise items-center justify-between rounded-2xl bg-pick px-4 py-3 text-pick-ink"
        >
          <span>
            {label} {next} removed
          </span>
          <button
            type="button"
            onClick={() => {
              addRound(game.id, undone.input)
              setUndone(undefined)
            }}
            className="font-semibold underline underline-offset-4"
          >
            Put it back
          </button>
        </div>
      )}
      <div className="flex gap-2.5">
        {game.rounds.length > 0 && (
          <button
            type="button"
            aria-label={`Undo last ${roundName}`}
            onClick={undo}
            className={`${iconButton} size-14 rounded-2xl`}
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
        )}
        <Link to={`/game/${game.id}/round`} className={primaryButton}>
          Enter {roundName} {next}{' '}
          <span aria-hidden="true" className="text-[22px]">
            +
          </span>
        </Link>
      </div>
    </div>
  )
}
