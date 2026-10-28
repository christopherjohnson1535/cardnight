import type { ReactNode } from 'react'
import { Navigate, useParams } from 'react-router'
import { replay } from '../core/game'
import { useGames } from '../core/store'
import type { Game } from '../core/types'
import { Board as BlitzBoard } from '../games/dutch-blitz/Board'
import { RoundEntry as BlitzRound } from '../games/dutch-blitz/RoundEntry'
import { dutchBlitz, type Round, type Settings as BlitzSettings } from '../games/dutch-blitz/score'
import { Board as FiveHundredBoard } from '../games/five-hundred/Board'
import { HandEntry as FiveHundredHand } from '../games/five-hundred/HandEntry'
import { fiveHundred, type Hand, type Settings } from '../games/five-hundred/score'
import { useWide } from '../ui/useWide'

type View = 'board' | 'round'

export function GameRoute({ view }: { view: View }) {
  const { id = '', roundId } = useParams()
  const game = useGames((state) => state.games[id])
  const wide = useWide()

  // an old link to a game that was cleared out
  if (!game) return <Navigate to="/" replace />

  // a fresh key after each save, so the docked entry panel starts blank again
  const entryKey = roundId ?? `new-${game.rounds.length}`

  if (game.type === '500') {
    const typed = game as Game<Settings, Hand>
    const over = replay(fiveHundred, typed).outcome !== null
    if (wide && !over) {
      return (
        <Split
          board={<FiveHundredBoard game={typed} docked />}
          entry={<FiveHundredHand key={entryKey} game={typed} roundId={roundId} docked />}
        />
      )
    }
    return view === 'round' && !over ? (
      <FiveHundredHand key={entryKey} game={typed} roundId={roundId} />
    ) : (
      <FiveHundredBoard game={typed} />
    )
  }

  if (game.type === 'blitz') {
    const typed = game as Game<BlitzSettings, Round>
    const over = replay(dutchBlitz, typed).outcome !== null
    if (wide && !over) {
      return (
        <Split
          board={<BlitzBoard game={typed} docked />}
          entry={<BlitzRound key={entryKey} game={typed} roundId={roundId} docked />}
        />
      )
    }
    return view === 'round' && !over ? (
      <BlitzRound key={entryKey} game={typed} roundId={roundId} />
    ) : (
      <BlitzBoard game={typed} />
    )
  }

  return <Navigate to="/" replace />
}

// The scoreboard and round entry side by side, for iPads held sideways and desktop browsers.
function Split({ board, entry }: { board: ReactNode; entry: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1000px] grid-cols-2 items-start gap-6 px-6">
      <div className="min-w-0">{board}</div>
      <div className="min-w-0">{entry}</div>
    </div>
  )
}
