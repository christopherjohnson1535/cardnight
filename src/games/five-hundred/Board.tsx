import { useState } from 'react'
import { useNavigate } from 'react-router'
import { replay, signed } from '../../core/game'
import { useGames, useKeepFinished } from '../../core/store'
import type { Game } from '../../core/types'
import { BoardFooter } from '../../ui/BoardFooter'
import { EndGame } from '../../ui/EndGame'
import { iconButton, TopBar } from '../../ui/controls'
import { useCountUp } from '../../ui/useCountUp'
import { Winner } from '../../ui/Winner'
import { explainHand } from './explain'
import { History } from './History'
import { Rules } from './Rules'
import { fiveHundred, TARGET, type Hand, type Settings } from './score'
import { teamLooks } from './teams'

export function Board({ game, docked }: { game: Game<Settings, Hand>; docked?: boolean }) {
  const { outcome } = replay(fiveHundred, game)
  useKeepFinished(game, outcome !== null)

  return outcome ? <Finished game={game} /> : <Scores game={game} docked={docked} />
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

function Scores({ game, docked }: { game: Game<Settings, Hand>; docked?: boolean }) {
  const { totals, rounds } = replay(fiveHundred, game)
  const next = String(rounds.length + 1).padStart(2, '0')
  const last = rounds.at(-1)

  const [a, b] = game.sides
  const leader =
    totals[a.id] === totals[b.id] ? undefined : totals[a.id] > totals[b.id] ? a.id : b.id
  const [rulesOpen, setRulesOpen] = useState(false)

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
            hand={rounds.length}
            leading={side.id === leader}
          />
        ))}
      </section>

      <History gameId={game.id} sides={game.sides} rounds={rounds} />
      <EndGame gameId={game.id} />

      <BoardFooter game={game} roundName="hand" docked={docked} />
    </div>
  )
}

type CardProps = {
  index: number
  name: string
  total: number
  change?: number
  // which hand the change came from, so the chip pops again after each one
  hand: number
  leading: boolean
}

function ScoreCard({ index, name, total, change, hand, leading }: CardProps) {
  const look = teamLooks[index]
  // roll up from the total before the last hand
  const shown = useCountUp(total, total - (change ?? 0), { delay: 500 })
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
        index === 0
          ? '-rotate-2 animate-deal'
          : 'rotate-[1.5deg] animate-deal [animation-delay:120ms]'
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
          <span className="shrink-0 animate-chip rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] tracking-wider text-accent-ink">
            LEADING
          </span>
        )}
      </span>
      <span className="mt-auto text-[54px] leading-none font-semibold tracking-tight tabular-nums">
        <span aria-hidden="true">{shown < 0 ? `−${Math.abs(shown)}` : shown}</span>
        <span className="sr-only">{total}</span>
      </span>
      {change !== undefined && (
        <span
          key={hand}
          className="mt-1.5 animate-chip self-start rounded-full bg-card-ink px-2 py-0.5 font-mono text-xs text-card"
        >
          {signed(change)}
        </span>
      )}
      <div className="mt-2.5 mr-[18px] h-[5px] overflow-hidden rounded-full bg-card-track">
        <div
          className={`h-full origin-left animate-fill transition-[width] duration-700 ${look.bar}`}
          style={{ width: `${share * 100}%` }}
        />
      </div>
      <span className="mt-1 font-mono text-[11px] text-card-muted">{toGo} to go</span>
    </div>
  )
}
