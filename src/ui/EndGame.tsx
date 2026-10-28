import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useGames } from '../core/store'
import { Sheet } from './Sheet'

type ConfirmProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
}

// Asks before something that can't be undone.
export function Confirm({ open, onClose, title, children, confirmLabel, onConfirm }: ConfirmProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="leading-snug text-muted">{children}</div>
      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onConfirm}
          className="h-13 w-full rounded-2xl bg-accent text-base font-semibold text-accent-ink transition active:scale-[0.98]"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-13 w-full rounded-2xl border border-line text-base font-semibold transition active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </Sheet>
  )
}

// A quiet button under the scoreboard for walking away from a game.
export function EndGame({ gameId }: { gameId: string }) {
  const navigate = useNavigate()
  const removeGame = useGames((state) => state.removeGame)
  const [asking, setAsking] = useState(false)

  return (
    <div className="flex justify-center px-5 pt-5">
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="px-3 py-2 text-sm text-muted underline-offset-4 hover:underline"
      >
        End this game
      </button>
      <Confirm
        open={asking}
        onClose={() => setAsking(false)}
        title="End this game?"
        confirmLabel="End game"
        onConfirm={() => {
          navigate('/', { replace: true })
          removeGame(gameId)
        }}
      >
        Nobody wins and the scores are deleted from this phone. There's no getting them back.
      </Confirm>
    </div>
  )
}
