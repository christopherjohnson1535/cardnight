import { useState } from 'react'
import { Link } from 'react-router'
import { signed, type ReplayedRound } from '../../core/game'
import type { Side } from '../../core/types'
import { explainHand } from './explain'
import type { Hand } from './score'
import { suitLook } from './suits'
import { teamLooks } from './teams'

type Props = {
  gameId: string
  sides: Side[]
  rounds: ReplayedRound<Hand>[]
}

const columns = 'grid grid-cols-[44px_minmax(0,1fr)_64px_64px] items-center gap-x-1'

export function History({ gameId, sides, rounds }: Props) {
  const [open, setOpen] = useState<string>()
  if (rounds.length === 0) return null

  return (
    <section aria-label="History" className="animate-rise px-5 pt-6 [animation-delay:250ms]">
      <div className="flex justify-between pb-2.5">
        <h2 className="label">History</h2>
        <span className="font-mono text-xs text-muted">tap a hand to see why</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div
          className={`${columns} h-[30px] border-b border-line px-3 font-mono text-[11px] text-muted`}
        >
          <span>bid</span>
          <span />
          {sides.map((side, i) => (
            <span key={side.id} className="truncate text-right">
              {teamLooks[i].suit} {side.name}
            </span>
          ))}
        </div>
        <ol>
          {[...rounds].reverse().map((round) => {
            const number = rounds.indexOf(round) + 1
            const expanded = open === round.id
            return (
              <li key={round.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? undefined : round.id)}
                  className={`${columns} h-[50px] w-full px-3 text-left transition-colors hover:bg-raised`}
                >
                  <BidChip hand={round.input} />
                  <Summary hand={round.input} sides={sides} />
                  {sides.map((side) => {
                    const change = round.delta[side.id]
                    return (
                      <span
                        key={side.id}
                        className={`text-right text-[17px] font-medium tabular-nums ${change < 0 ? 'text-minus' : ''}`}
                      >
                        {signed(change)}
                      </span>
                    )
                  })}
                </button>
                {expanded && (
                  <div className="flex flex-col gap-2 px-3 pt-1 pb-3.5">
                    <p className="text-[15px] leading-snug text-muted">
                      <span className="font-mono text-xs">#{String(number).padStart(2, '0')} </span>
                      {explainHand(round.input, sides, round.delta)}
                    </p>
                    <Link
                      to={`/game/${gameId}/round/${round.id}`}
                      className="self-start text-sm font-semibold text-accent-text underline-offset-4 hover:underline"
                    >
                      Fix this hand
                    </Link>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function BidChip({ hand }: { hand: Hand }) {
  const base =
    'flex h-[38px] w-[30px] flex-col items-center justify-center rounded-[5px] bg-card leading-none font-bold text-card-ink shadow-sm'
  if (hand.kind === 'passed') {
    return <span className={`${base} font-mono text-[9px] text-card-muted`}>pass</span>
  }
  const suit = suitLook[hand.bid.suit]
  return (
    <span className={`${base} text-sm`}>
      {hand.bid.tricks}
      <span
        className={`${hand.bid.suit === 'n' ? 'mt-0.5 text-[9px]' : 'text-xs'} ${suit.red ? 'text-suit-red' : ''}`}
      >
        {suit.glyph}
      </span>
    </span>
  )
}

function Summary({ hand, sides }: { hand: Hand; sides: Side[] }) {
  if (hand.kind === 'passed') {
    return (
      <span className="flex flex-col leading-tight">
        <span className="font-medium">Everyone passed</span>
        <span className="text-[13px] text-muted">redeal</span>
      </span>
    )
  }
  const made = hand.tricks >= hand.bid.tricks
  return (
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="truncate font-medium">{sides.find((s) => s.id === hand.bidder)?.name}</span>
      <span className="text-[13px] text-muted">
        {made ? 'made it' : 'went set'} · took {hand.tricks}
      </span>
    </span>
  )
}
