import { Navigate, useParams } from 'react-router'
import { useGames } from '../core/store'
import type { Game } from '../core/types'
import { Board as BlitzBoard } from '../games/dutch-blitz/Board'
import { RoundEntry as BlitzRound } from '../games/dutch-blitz/RoundEntry'
import type { Round, Settings as BlitzSettings } from '../games/dutch-blitz/score'
import { Board as FiveHundredBoard } from '../games/five-hundred/Board'
import { HandEntry as FiveHundredHand } from '../games/five-hundred/HandEntry'
import type { Hand, Settings } from '../games/five-hundred/score'

type View = 'board' | 'round'

export function GameRoute({ view }: { view: View }) {
  const { id = '', roundId } = useParams()
  const game = useGames((state) => state.games[id])

  // an old link to a game that was cleared out
  if (!game) return <Navigate to="/" replace />

  if (game.type === '500') {
    const typed = game as Game<Settings, Hand>
    return view === 'round' ? (
      <FiveHundredHand key={roundId ?? 'new'} game={typed} roundId={roundId} />
    ) : (
      <FiveHundredBoard game={typed} />
    )
  }

  if (game.type === 'blitz') {
    const typed = game as Game<BlitzSettings, Round>
    return view === 'round' ? (
      <BlitzRound key={roundId ?? 'new'} game={typed} roundId={roundId} />
    ) : (
      <BlitzBoard game={typed} />
    )
  }

  return <Navigate to="/" replace />
}
