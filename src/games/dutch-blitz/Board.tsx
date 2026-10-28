import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { num, replay, signed, type ReplayedRound, type Totals } from '../../core/game'
import type { Game, Side } from '../../core/types'
import { BoardFooter } from '../../ui/BoardFooter'
import { TopBar } from '../../ui/controls'
import { useCountUp } from '../../ui/useCountUp'
import { explainCount } from './explain'
import { playerLook } from './players'
import { dutchBlitz, TARGET, type Round, type Settings } from './score'

const calm = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// highest total first; ties keep seat order
function rank(sides: Side[], totals: Totals) {
  return sides.map((side) => side.id).sort((a, b) => totals[b] - totals[a])
}

export function Board({ game }: { game: Game<Settings, Round> }) {
  const { totals, rounds } = replay(dutchBlitz, game)
  const next = String(rounds.length + 1).padStart(2, '0')

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar
        back="/"
        backLabel="Back to home"
        title="Dutch Blitz"
        subtitle={`round ${next} next · first to ${TARGET}`}
      />
      <Standings sides={game.sides} totals={totals} last={rounds.at(-1)} />
      <History gameId={game.id} sides={game.sides} rounds={rounds} />
      <BoardFooter game={game} roundName="round" />
    </div>
  )
}

type StandingsProps = {
  sides: Side[]
  totals: Totals
  last?: ReplayedRound<Round>
}

function Standings({ sides, totals, last }: StandingsProps) {
  const ranked = rank(sides, totals)
  const before = last
    ? rank(sides, Object.fromEntries(sides.map((s) => [s.id, totals[s.id] - last.delta[s.id]])))
    : ranked

  // show the order from before the last round first, then let the rows slide into place
  const key = ranked.join()
  const [order, setOrder] = useState(() => (calm() ? ranked : before))
  useEffect(() => {
    const timer = setTimeout(() => setOrder(key.split(',')), calm() ? 0 : 900)
    return () => clearTimeout(timer)
  }, [key])

  // slide each row from where it was to where it is now
  const rows = useRef(new Map<string, HTMLLIElement>())
  const tops = useRef(new Map<string, number>())
  useLayoutEffect(() => {
    rows.current.forEach((row, id) => {
      const top = row.offsetTop
      const was = tops.current.get(id)
      if (was !== undefined && was !== top && !calm()) {
        row.animate([{ transform: `translateY(${was - top}px)` }, { transform: 'none' }], {
          duration: 550,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        })
      }
      tops.current.set(id, top)
    })
  }, [order])

  const [first, second] = ranked
  const leader = totals[first] > (second ? totals[second] : -Infinity) ? first : undefined

  return (
    <ol aria-label="Totals" className="relative flex flex-col gap-2 px-5 pt-2">
      {order.map((id, place) => {
        const seat = sides.findIndex((side) => side.id === id)
        return (
          <li
            key={id}
            ref={(row) => {
              if (row) rows.current.set(id, row)
              else rows.current.delete(id)
            }}
            style={{ animationDelay: `${seat * 60}ms` }}
            className="animate-rise"
          >
            <PlayerRow
              place={place + 1}
              seat={seat}
              name={sides[seat].name}
              total={totals[id]}
              change={last?.delta[id]}
              round={last?.id}
              leading={id === leader}
            />
          </li>
        )
      })}
    </ol>
  )
}

type RowProps = {
  place: number
  seat: number
  name: string
  total: number
  change?: number
  round?: string
  leading: boolean
}

function PlayerRow({ place, seat, name, total, change, round, leading }: RowProps) {
  const shown = useCountUp(total, total - (change ?? 0), { delay: 400 })
  const share = Math.max(0, Math.min(1, total / TARGET))
  const look = playerLook(seat)

  return (
    <div
      className={`relative flex h-[66px] items-center gap-3 overflow-hidden rounded-2xl pr-3.5 pl-3 transition-colors duration-500 ${
        leading ? 'paper ring-[3px] ring-accent' : 'border border-line bg-surface'
      }`}
    >
      <span
        className={`w-4 text-center font-mono text-xs ${leading ? 'text-card-muted' : 'text-muted'}`}
      >
        {place}
      </span>
      <span
        aria-hidden="true"
        className={`h-8 w-6 shrink-0 -rotate-6 rounded-[5px] ${look.color}`}
      />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="flex items-center gap-2">
          <span className="truncate text-[18px] font-semibold">{name}</span>
          {leading && (
            <span className="shrink-0 animate-chip rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-ink">
              LEADING
            </span>
          )}
        </span>
        <span className={`font-mono text-[11px] ${leading ? 'text-card-muted' : 'text-muted'}`}>
          {total >= TARGET ? 'past 75' : `${TARGET - total} to go`}
        </span>
      </span>
      {change !== undefined && (
        <span
          key={round}
          className={`shrink-0 animate-chip rounded-full px-2 py-0.5 font-mono text-xs ${
            leading ? 'bg-card-ink text-card' : 'bg-raised'
          } ${change < 0 && !leading ? 'text-minus' : ''}`}
        >
          {signed(change)}
        </span>
      )}
      <span className="w-12 text-right text-[28px] leading-none font-semibold tracking-tight tabular-nums">
        <span aria-hidden="true">{num(shown)}</span>
        <span className="sr-only">{total}</span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 h-[3px] origin-left animate-fill transition-[width] duration-700 ${look.bar}`}
        style={{ width: `${share * 100}%` }}
      />
    </div>
  )
}

type HistoryProps = {
  gameId: string
  sides: Side[]
  rounds: ReplayedRound<Round>[]
}

function History({ gameId, sides, rounds }: HistoryProps) {
  const [open, setOpen] = useState<string>()
  if (rounds.length === 0) return null

  return (
    <section aria-label="History" className="animate-rise px-5 pt-6 [animation-delay:250ms]">
      <div className="flex justify-between pb-2.5">
        <h2 className="label">Rounds</h2>
        <span className="font-mono text-xs text-muted">tap one to see why</span>
      </div>
      <ol className="overflow-hidden rounded-2xl border border-line bg-surface">
        {rounds
          .map((round, i) => ({ round, number: i + 1 }))
          .reverse()
          .map(({ round, number }) => {
            const expanded = open === round.id
            const callers = sides.filter((side) => round.input[side.id]?.left === 0)
            return (
              <li key={round.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? undefined : round.id)}
                  className="flex min-h-[54px] w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-raised"
                >
                  <span className="flex w-[100px] shrink-0 flex-col leading-tight">
                    <span className="font-medium">Round {String(number).padStart(2, '0')}</span>
                    <span className="truncate text-[13px] text-muted">
                      {callers.length > 0
                        ? `${callers.map((side) => side.name).join(' & ')} blitzed`
                        : 'no Blitz'}
                    </span>
                  </span>
                  <span className="flex flex-1 justify-end">
                    {sides.map((side, seat) => {
                      const change = round.delta[side.id]
                      return (
                        <span
                          key={side.id}
                          aria-label={`${side.name} ${signed(change)}`}
                          className="flex w-8 flex-col items-center gap-1"
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1 w-4 rounded-full ${playerLook(seat).color}`}
                          />
                          <span
                            aria-hidden="true"
                            className={`text-[13px] font-medium tabular-nums ${change < 0 ? 'text-minus' : ''}`}
                          >
                            {signed(change)}
                          </span>
                        </span>
                      )
                    })}
                  </span>
                </button>
                {expanded && (
                  <div className="flex flex-col gap-2 px-3 pt-1 pb-3.5">
                    <ul className="flex flex-col gap-1 text-[15px] leading-snug text-muted">
                      {sides.map((side) => (
                        <li key={side.id}>{explainCount(side.name, round.input[side.id])}</li>
                      ))}
                    </ul>
                    <Link
                      to={`/game/${gameId}/round/${round.id}`}
                      className="self-start text-sm font-semibold text-accent-text underline-offset-4 hover:underline"
                    >
                      Fix this round
                    </Link>
                  </div>
                )}
              </li>
            )
          })}
      </ol>
    </section>
  )
}
