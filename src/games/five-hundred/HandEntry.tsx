import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { replay, signed } from '../../core/game'
import { useGames } from '../../core/store'
import type { Game } from '../../core/types'
import { iconButton, primaryButton } from '../../ui/controls'
import { entryPage, entryPanel } from '../../ui/entry'
import { Question } from '../../ui/Sheet'
import {
  bidValue,
  fiveHundred,
  scoreHand,
  SUITS,
  TRICK_COUNTS,
  type Bid,
  type Hand,
  type Settings,
} from './score'
import { Rules } from './Rules'
import { suitLook } from './suits'
import { teamLooks } from './teams'

type Props = {
  game: Game<Settings, Hand>
  // set when fixing a hand that's already saved
  roundId?: string
  // shown beside the scoreboard on a wide screen
  docked?: boolean
}

export function HandEntry({ game, roundId, docked = false }: Props) {
  const navigate = useNavigate()
  const { addRound, editRound } = useGames()
  const editing = game.rounds.find((round) => round.id === roundId)
  const start = editing?.input.kind === 'played' ? editing.input : undefined

  const [bidder, setBidder] = useState<string | undefined>(start?.bidder)
  const [bid, setBid] = useState<Bid | undefined>(start?.bid)
  const [tricks, setTricks] = useState<number | undefined>(start?.tricks)
  const [rulesOpen, setRulesOpen] = useState(false)

  // totals before this hand, so the preview can show where each team lands
  const index = editing ? game.rounds.indexOf(editing) : game.rounds.length
  const before = replay(fiveHundred, { ...game, rounds: game.rounds.slice(0, index) }).totals
  const handNumber = String(index + 1).padStart(2, '0')

  const took = tricks ?? bid?.tricks
  const hand: Hand | undefined =
    bidder && bid && took !== undefined ? { kind: 'played', bidder, bid, tricks: took } : undefined
  const delta = hand
    ? scoreHand(hand, { sides: game.sides, settings: game.settings, totals: before })
    : undefined
  const made = hand?.kind === 'played' && hand.tricks >= hand.bid.tricks

  const save = (input: Hand) => {
    if (editing) editRound(game.id, editing.id, input)
    else addRound(game.id, input)
    navigate(`/game/${game.id}`, { replace: true })
  }

  const bidderSide = game.sides.find((side) => side.id === bidder)
  const otherSide = game.sides.find((side) => side.id !== bidder)

  return (
    <div className={entryPage(docked)}>
      <div className={entryPanel(docked)}>
        {!docked && (
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line" />
        )}
        <header className="flex items-center gap-3 px-4 pt-2 pb-1 pl-5">
          <h1 className="text-[22px] font-bold tracking-tight">
            {editing ? `Fix hand ${handNumber}` : `Hand ${handNumber}`}
          </h1>
          {!editing && (
            <button
              type="button"
              onClick={() => save({ kind: 'passed' })}
              className="ml-auto text-sm text-muted underline-offset-4 hover:underline"
            >
              Everyone passed
            </button>
          )}
          <button
            type="button"
            aria-label="How scoring works"
            onClick={() => setRulesOpen(true)}
            className={`${iconButton} size-10 font-mono text-base font-semibold ${editing ? 'ml-auto' : ''}`}
          >
            ?
          </button>
          {(!docked || editing) && (
            <Link
              to={`/game/${game.id}`}
              replace
              aria-label="Close without saving"
              className={`${iconButton} size-10`}
            >
              <span aria-hidden="true" className="text-xl">
                ×
              </span>
            </Link>
          )}
        </header>

        <div className="flex flex-1 flex-col gap-[18px] px-4 pt-3">
          <section>
            <Question
              title="Who won the bid?"
              help="The team that called the highest bid. They have to take at least that many tricks."
            />
            <div className="grid grid-cols-2 gap-2">
              {game.sides.map((side, i) => {
                const look = teamLooks[i]
                const on = side.id === bidder
                return (
                  <button
                    key={side.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setBidder(side.id)}
                    className={`flex h-[54px] items-center gap-2.5 rounded-[14px] border px-3.5 text-left text-[17px] transition-colors ${
                      on
                        ? 'border-pick bg-pick font-semibold text-pick-ink'
                        : 'border-line bg-well font-medium text-muted'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid h-8 w-6 shrink-0 place-items-center rounded-[5px] border border-line bg-card text-[15px] ${look.red ? 'text-suit-red' : 'text-card-ink'}`}
                    >
                      {look.suit}
                    </span>
                    <span className="truncate">{side.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <Question
              title="What did they bid?"
              help="Tap the number of tricks and the trump suit. Each box shows what that bid is worth."
              aside={<span className="font-mono text-[11px] text-muted">points shown</span>}
            />
            <div className="grid grid-cols-[26px_repeat(5,minmax(0,1fr))] items-center gap-[5px]">
              <span />
              {SUITS.map((suit) => (
                <span
                  key={suit}
                  aria-hidden="true"
                  className={`text-center font-semibold ${suit === 'n' ? 'font-mono text-xs' : 'text-[19px]'} ${
                    suitLook[suit].red ? 'text-suit-red' : ''
                  }`}
                >
                  {suitLook[suit].glyph}
                </span>
              ))}
              {TRICK_COUNTS.map((count) => (
                <BidRow
                  key={count}
                  count={count}
                  bid={bid}
                  onPick={(next) => {
                    setBid(next)
                    // assume they made it exactly; the stepper is right there if not
                    setTricks(next.tricks)
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <Question
              title={`How many tricks did ${bidderSide?.name ?? 'the bidders'} take?`}
              help="Count the bidders' tricks. The other team gets the rest, at 10 points each."
            />
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-1.5 rounded-full border border-line bg-well p-[5px]">
                <button
                  type="button"
                  aria-label="One fewer trick"
                  disabled={took === undefined || took <= 0}
                  onClick={() => setTricks((took ?? 0) - 1)}
                  className="size-12 rounded-full bg-raised text-2xl transition active:scale-90 disabled:opacity-40"
                >
                  −
                </button>
                <output
                  aria-live="polite"
                  className="w-14 text-center text-[34px] font-semibold tabular-nums"
                >
                  {took ?? '–'}
                </output>
                <button
                  type="button"
                  aria-label="One more trick"
                  disabled={took === undefined || took >= 10}
                  onClick={() => setTricks((took ?? 0) + 1)}
                  className="size-12 rounded-full bg-raised text-2xl transition active:scale-90 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              {took !== undefined && otherSide && bidder && (
                <span className="text-sm text-muted">
                  {otherSide.name} took {10 - took}
                </span>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-4 flex flex-col gap-3 border-t border-line px-4 pt-3.5 pb-5">
          <div className="flex items-center justify-between">
            <span className="label text-[11px]">This hand</span>
            {hand && (
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-medium tracking-wider uppercase ${
                  made ? 'bg-pick text-pick-ink' : 'bg-accent text-accent-ink'
                }`}
              >
                {made ? 'made it' : 'went set'}
              </span>
            )}
          </div>
          <div aria-live="polite" className="grid grid-cols-2 gap-2">
            {game.sides.map((side, i) => {
              const change = delta?.[side.id]
              return (
                <div key={side.id} className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm text-muted">
                    {teamLooks[i].suit} {side.name}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span
                      key={change ?? 'none'}
                      className={`animate-flash text-[26px] font-semibold tabular-nums ${change !== undefined && change < 0 ? 'text-minus' : ''}`}
                    >
                      {change === undefined ? '–' : signed(change)}
                    </span>
                    {change !== undefined && (
                      <span className="font-mono text-xs text-muted">
                        → {before[side.id] + change}
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
          <button
            type="button"
            disabled={!hand}
            onClick={() => hand && save(hand)}
            className={primaryButton}
          >
            {editing ? 'Save changes' : 'Save hand'} <span aria-hidden="true">✓</span>
          </button>
        </footer>
      </div>
      <Rules
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        sides={game.sides}
        settings={game.settings}
      />
    </div>
  )
}

function BidRow({
  count,
  bid,
  onPick,
}: {
  count: number
  bid: Bid | undefined
  onPick: (bid: Bid) => void
}) {
  return (
    <>
      <span className="font-mono text-xs text-muted">{count}</span>
      {SUITS.map((suit) => {
        const on = bid?.tricks === count && bid.suit === suit
        const value = bidValue({ tricks: count, suit })
        return (
          <button
            key={suit}
            type="button"
            aria-pressed={on}
            aria-label={`${count} ${suitLook[suit].name}, ${value} points`}
            onClick={() => onPick({ tricks: count, suit })}
            className={`h-[46px] rounded-[10px] border text-[15px] tabular-nums transition ${
              on
                ? 'z-10 -rotate-2 scale-105 animate-pop border-pick bg-pick font-bold text-pick-ink shadow-[0_8px_20px_rgb(0_0_0/0.35)]'
                : 'border-line bg-well font-medium text-ink/85'
            }`}
          >
            {value}
          </button>
        )
      })}
    </>
  )
}
