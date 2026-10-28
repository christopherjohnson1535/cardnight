import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { replay, signed } from '../../core/game'
import { useGames } from '../../core/store'
import type { Game, Round } from '../../core/types'
import { iconButton, primaryButton, TopBar } from '../../ui/controls'
import { Winner } from '../../ui/Winner'
import { explainHand } from './explain'
import { History } from './History'
import { Rules } from './Rules'
import { fiveHundred, TARGET, type Hand, type Settings } from './score'
import { teamLooks } from './teams'

export function Board({ game }: { game: Game<Settings, Hand> }) {
  const { outcome } = replay(fiveHundred, game)
  const { finishGame, reopenGame } = useGames()
  const finished = game.finishedAt !== undefined

  // keep finishedAt in step with the scores, so a fixed or undone hand reopens the game
  useEffect(() => {
    if (outcome && !finished) finishGame(game.id)
    if (!outcome && finished) reopenGame(game.id)
  }, [outcome, finished, game.id, finishGame, reopenGame])

  return outcome ? <Finished game={game} /> : <Scores game={game} />
}

function Finished({ game }: { game: Game<Settings, Hand> }) {
  const navigate = useNavigate()
  const { startGame, undoRound } = useGames()
  const { totals, rounds, outcome } = replay(fiveHundred, game)
  const last = rounds.at(-1)!

  const places = game.sides
    .map((side, i) => ({
      id: side.id,
      name: side.name,
      total: totals[side.id],
      suit: teamLooks[i].suit,
      red: teamLooks[i].red,
    }))
    .sort((x, y) => (x.id === outcome?.winner ? -1 : y.id === outcome?.winner ? 1 : 0))
  const winner = places[0]

  return (
    <Winner
      kicker={`Game over · 500 · ${rounds.length} ${rounds.length === 1 ? 'hand' : 'hands'}`}
      headline={`${winner.name} win.`}
      places={places}
      rematchLabel="Rematch, same teams"
      onRematch={() => {
        const id = startGame('500', game.sides, game.settings)
        navigate(`/game/${id}`, { replace: true })
      }}
      undoLabel="Last hand was wrong? Undo it"
      onUndo={() => undoRound(game.id)}
    >
      <p>Last hand: {explainHand(last.input, game.sides, last.delta)}</p>
      {outcome?.note && <p className="mt-1.5 text-ink">{outcome.note}</p>}
    </Winner>
  )
}

function Scores({ game }: { game: Game<Settings, Hand> }) {
  const { undoRound, addRound } = useGames()
  const { totals, rounds } = replay(fiveHundred, game)
  const next = String(rounds.length + 1).padStart(2, '0')
  const last = rounds.at(-1)

  const [a, b] = game.sides
  const leader =
    totals[a.id] === totals[b.id] ? undefined : totals[a.id] > totals[b.id] ? a.id : b.id

  // the hand that was just undone, so it can be put back for a few seconds
  const [rulesOpen, setRulesOpen] = useState(false)
  const [undone, setUndone] = useState<Round<Hand>>()
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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar
        back="/"
        backLabel="Back to home"
        title="500"
        subtitle={`hand ${next} next`}
        right={
          <button
            type="button"
            aria-label="How scoring works"
            onClick={() => setRulesOpen(true)}
            className={`${iconButton} font-mono text-base font-semibold`}
          >
            ?
          </button>
        }
      />
      <Rules
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        sides={game.sides}
        settings={game.settings}
      />

      <section aria-label="Totals" className="grid grid-cols-2 gap-3 px-5 pt-2">
        {game.sides.map((side, i) => (
          <ScoreCard
            key={side.id}
            index={i}
            name={side.name}
            total={totals[side.id]}
            change={last?.delta[side.id]}
            leading={side.id === leader}
          />
        ))}
      </section>

      <History gameId={game.id} sides={game.sides} rounds={rounds} />

      <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-table from-70% to-transparent px-5 pt-6 pb-6">
        {undone && (
          <div
            role="status"
            className="mb-3 flex items-center justify-between rounded-2xl bg-pick px-4 py-3 text-pick-ink"
          >
            <span>Hand {String(game.rounds.length + 1).padStart(2, '0')} removed</span>
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
              aria-label="Undo last hand"
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
            Enter hand {next}{' '}
            <span aria-hidden="true" className="text-[22px]">
              +
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

type CardProps = {
  index: number
  name: string
  total: number
  change?: number
  leading: boolean
}

function ScoreCard({ index, name, total, change, leading }: CardProps) {
  const look = teamLooks[index]
  const toGo = TARGET - total
  const share = Math.max(0, Math.min(1, total / TARGET))
  const corner = (
    <span
      className={`flex flex-col items-center leading-none font-bold ${look.red ? 'text-suit-red' : ''}`}
    >
      {index + 1}
      <span className="text-[13px]">{look.suit}</span>
    </span>
  )

  return (
    <div
      className={`paper relative flex h-[196px] flex-col rounded-2xl py-3.5 pr-3.5 pl-[34px] ${
        index === 0 ? '-rotate-2' : 'rotate-[1.5deg]'
      } ${leading ? 'ring-[3px] ring-accent' : ''}`}
    >
      <span aria-hidden="true" className="absolute top-3 left-[11px] text-sm">
        {corner}
      </span>
      <span aria-hidden="true" className="absolute right-3 bottom-3 rotate-180 text-sm">
        {corner}
      </span>

      <span className="flex items-center justify-between gap-1.5 font-semibold">
        <span className="truncate">{name}</span>
        {leading && (
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-ink">
            LEADING
          </span>
        )}
      </span>
      <span className="mt-auto text-[54px] leading-none font-semibold tracking-tight tabular-nums">
        {total < 0 ? `−${Math.abs(total)}` : total}
      </span>
      {change !== undefined && (
        <span className="mt-1.5 self-start rounded-full bg-card-ink px-2 py-0.5 font-mono text-xs text-card">
          {signed(change)}
        </span>
      )}
      <div className="mt-2.5 mr-[18px] h-[5px] overflow-hidden rounded-full bg-card-track">
        <div className={`h-full ${look.bar}`} style={{ width: `${share * 100}%` }} />
      </div>
      <span className="mt-1 font-mono text-[11px] text-card-muted">{toGo} to go</span>
    </div>
  )
}
