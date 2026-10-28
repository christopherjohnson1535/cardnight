import { signed } from '../../core/game'
import type { Side } from '../../core/types'
import { Sheet } from '../../ui/Sheet'
import { playerLook } from './players'
import { countScore, TARGET, type Count } from './score'

type Props = {
  open: boolean
  onClose: () => void
  sides: Side[]
}

const examples: Count[] = [
  { middle: 18, left: 0 },
  { middle: 15, left: 3 },
  { middle: 4, left: 7 },
]

export function Rules({ open, onClose, sides }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="How scoring works" subtitle="Dutch Blitz">
      <p className="leading-snug text-muted">
        A round ends when someone empties their Blitz pile and calls “Blitz!” Then everyone counts
        two things.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tile value="+1" label="for each of your cards in the middle" />
        <Tile value="−2" label="for each card left in your Blitz pile" minus />
      </div>

      <h3 className="label mt-6 mb-1">For example</h3>
      <ul>
        {examples.slice(0, Math.max(2, Math.min(3, sides.length))).map((count, i) => (
          <li
            key={i}
            className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className={`h-7 w-5 shrink-0 -rotate-6 rounded-[4px] ${playerLook(i).color}`}
            />
            <span className="flex-1 leading-snug">
              <span className="font-semibold">{sides[i]?.name ?? `Player ${i + 1}`}</span>{' '}
              <span className="text-muted">
                {count.middle} in the middle,{' '}
                {count.left === 0
                  ? 'none left'
                  : `${count.left} left: ${count.middle} − ${count.left * 2}`}
              </span>
            </span>
            <span
              className={`text-xl font-semibold tabular-nums ${countScore(count) < 0 ? 'text-minus' : ''}`}
            >
              {signed(countScore(count))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm leading-snug text-muted">
        A round can go below zero when lots of cards are stuck in the Blitz pile.
      </p>

      <h3 className="label mt-6 mb-1">Winning</h3>
      <p className="leading-snug text-muted">
        First to {TARGET} wins. If more than one player passes {TARGET} in the same round, the
        highest total wins. If they're tied, play another round.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 h-13 w-full rounded-2xl bg-pick text-base font-semibold text-pick-ink transition active:scale-[0.98]"
      >
        Got it
      </button>
    </Sheet>
  )
}

function Tile({ value, label, minus }: { value: string; label: string; minus?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-well p-3.5">
      <span className={`text-[34px] leading-none font-semibold ${minus ? 'text-minus' : ''}`}>
        {value}
      </span>
      <span className="text-sm leading-snug text-muted">{label}</span>
    </div>
  )
}
