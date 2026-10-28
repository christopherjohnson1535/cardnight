import { Navigate, useParams } from 'react-router'
import { useGames } from '../core/store'
import type { Game } from '../core/types'
import { Board as FiveHundredBoard } from '../games/five-hundred/Board'
import type { Hand, Settings } from '../games/five-hundred/score'

export function GameRoute() {
  const { id = '' } = useParams()
  const game = useGames((state) => state.games[id])

  // an old link to a game that was cleared out
  if (!game) return <Navigate to="/" replace />

  switch (game.type) {
    case '500':
      return <FiveHundredBoard game={game as Game<Settings, Hand>} />
    default:
      return <Navigate to="/" replace />
  }
}
