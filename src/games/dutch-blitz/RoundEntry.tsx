import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { num, replay, signed } from '../../core/game'
import { useGames } from '../../core/store'
import type { Game } from '../../core/types'
import { iconButton, primaryButton } from '../../ui/controls'
import { entryPage, entryPanel } from '../../ui/entry'
import { playerLook } from './players'
import { Rules } from './Rules'
import {
  countScore,
  dutchBlitz,
  MAX_MIDDLE,
  PILE_SIZE,
  TARGET,
  type Count,
  type Round,
  type Settings,
} from './score'

type Props = {
  game: Game<Settings, Round>
  // set when fixing a round that's already saved
  roundId?: string
  // shown beside the scoreboard on a wide screen
  docked?: boolean
}

// a count while it's being filled in; blank until someone taps or types
type Draft = { middle?: number; left?: number }

const complete = (draft: Draft | undefined): draft is Count =>
  draft?.middle !== undefined && draft.left !== undefined

export function RoundEntry({ game, roundId, docked = false }: Props) {
  const navigate = useNavigate()
  const { addRound, editRound } = useGames()
  const editing = game.rounds.find((round) => round.id === roundId)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => editing?.input ?? {})

  const index = editing ? game.rounds.indexOf(editing) : game.rounds.length
  const before = replay(dutchBlitz, { ...game, rounds: game.rounds.slice(0, index) }).totals
  const roundNumber = String(index + 1).padStart(2, '0')

  const set = (id: string, key: keyof Count, value: number | undefined) =>
    setDrafts({ ...drafts, [id]: { ...drafts[id], [key]: value } })

  const waiting = game.sides.filter((side) => !complete(drafts[side.id]))
  const ready = waiting.length === 0

  const after = game.sides.map((side) => {
    const draft = drafts[side.id]
    return { side, total: before[side.id] + (complete(draft) ? countScore(draft) : 0) }
  })
  const top = after.reduce((x, y) => (y.total > x.total ? y : x))

  const save = () => {
    if (!ready) return
    const round = Object.fromEntries(
      game.sides.map((side) => [side.id, drafts[side.id] as Count]),
    ) as Round
    if (editing) editRound(game.id, editing.id, round)
    else addRound(game.id, round)
    navigate(`/game/${game.id}`, { replace: true })
  }

  return (
    <div className={entryPage(docked)}>
      <div className={entryPanel(docked)}>
        {!docked && (
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line" />
        )}
        <header className="flex items-center gap-3 px-4 pt-2 pb-1 pl-5">
          <div className="flex flex-col leading-tight">
            <h1 className="text-[22px] font-bold tracking-tight">
              {editing ? `Fix round ${roundNumber}` : `Round ${roundNumber}`}
            </h1>
            <span className="font-mono text-[11px] text-muted">first to {TARGET}</span>
          </div>
          <button
            type="button"
            aria-label="How scoring works"
            onClick={() => setRulesOpen(true)}
            className={`${iconButton} ml-auto size-10 font-mono text-base font-semibold`}
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

        <p className="px-5 pt-1 pb-3 text-[15px] leading-snug text-muted">
          Count each player's cards in the middle and what's left in their Blitz pile.
        </p>

        <ol className="flex flex-col gap-2 px-3">
          {game.sides.map((side, i) => {
            const draft = drafts[side.id] ?? {}
            const done = complete(draft)
            const score = done ? countScore(draft) : undefined
            return (
              <li
                key={side.id}
                aria-label={side.name}
                style={{ animationDelay: `${i * 60}ms` }}
                className="flex animate-rise flex-col gap-1.5 rounded-2xl border border-line bg-well px-3 pt-2 pb-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`h-[26px] w-[19px] shrink-0 -rotate-6 rounded-[4px] ${playerLook(i).color}`}
                  />
                  <span className="min-w-0 truncate text-[17px] font-semibold">{side.name}</span>
                  {draft.left === 0 && (
                    <span className="shrink-0 animate-stamp rounded-md border-2 border-accent px-1.5 font-mono text-[11px] font-semibold tracking-wider text-accent-text">
                      BLITZ!
                    </span>
                  )}
                  <span className="ml-auto flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-muted">
                      {num(before[side.id])} →{' '}
                      {score === undefined ? '?' : num(before[side.id] + score)}
                    </span>
                    <span
                      key={score ?? 'none'}
                      className={`w-12 animate-flash text-right text-[22px] font-semibold tabular-nums ${score !== undefined && score < 0 ? 'text-minus' : ''}`}
                    >
                      {score === undefined ? '' : signed(score)}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Counter
                    label="In the middle"
                    each="+1"
                    who={side.name}
                    value={draft.middle}
                    max={MAX_MIDDLE}
                    onChange={(v) => set(side.id, 'middle', v)}
                  />
                  <Counter
                    label="Left in Blitz pile"
                    each="−2"
                    who={side.name}
                    value={draft.left}
                    max={PILE_SIZE}
                    onChange={(v) => set(side.id, 'left', v)}
                  />
                </div>
              </li>
            )
          })}
        </ol>

        <footer className="sticky bottom-0 mt-auto flex flex-col gap-3 border-t border-line bg-surface px-4 pt-3.5 pb-5">
          <p aria-live="polite" className="text-[15px] text-muted">
            {ready ? (
              top.total >= TARGET ? (
                <>
                  <span className="font-semibold text-ink">{top.side.name}</span> passes {TARGET}{' '}
                  with {top.total}
                </>
              ) : (
                <>
                  <span className="font-semibold text-ink">{top.side.name}</span> leads with{' '}
                  {top.total} · {TARGET - top.total} to go
                </>
              )
            ) : (
              `Still counting: ${waiting.map((side) => side.name).join(', ')}`
            )}
          </p>
          <button type="button" disabled={!ready} onClick={save} className={primaryButton}>
            {editing ? 'Save changes' : 'Save round'} <span aria-hidden="true">✓</span>
          </button>
        </footer>
      </div>
      <Rules open={rulesOpen} onClose={() => setRulesOpen(false)} sides={game.sides} />
    </div>
  )
}

type CounterProps = {
  label: string
  each: string
  who: string
  value: number | undefined
  max: number
  onChange: (value: number | undefined) => void
}

// − [number] +, where the number can also be typed
function Counter({ label, each, who, value, max, onChange }: CounterProps) {
  const clamp = (n: number) => Math.min(max, Math.max(0, n))
  const step =
    'grid size-8 shrink-0 place-items-center rounded-full bg-raised text-xl transition active:scale-90 disabled:opacity-40'
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex justify-between px-1 text-[12px] text-muted">
        <span className="truncate">{label}</span>
        <span className="font-mono">{each}</span>
      </span>
      <div className="flex items-center justify-between rounded-full border border-line bg-surface p-1">
        <button
          type="button"
          aria-label={`${who}, one fewer ${label === 'In the middle' ? 'card in the middle' : 'card left'}`}
          disabled={value === 0}
          onClick={() => onChange(clamp((value ?? 1) - 1))}
          className={step}
        >
          −
        </button>
        <input
          aria-label={`${who}, ${label.toLowerCase()}`}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="?"
          value={value ?? ''}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '')
            onChange(digits === '' ? undefined : clamp(Number(digits)))
          }}
          className="w-10 bg-transparent text-center text-[20px] font-semibold tabular-nums placeholder:text-muted focus:outline-none"
        />
        <button
          type="button"
          aria-label={`${who}, one more ${label === 'In the middle' ? 'card in the middle' : 'card left'}`}
          disabled={value === max}
          onClick={() => onChange(clamp((value ?? 0) + 1))}
          className={step}
        >
          +
        </button>
      </div>
    </div>
  )
}
