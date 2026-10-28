import { useState } from 'react'
import { Link } from 'react-router'
import { replay } from '../core/game'
import { latestOpenGame, useGames } from '../core/store'
import { useTheme } from '../core/theme'
import { gameFor, games } from '../games/registry'
import { Confirm } from '../ui/EndGame'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Home() {
  const { theme, toggle } = useTheme()
  const allGames = useGames((state) => state.games)
  const open = latestOpenGame(allGames)
  const saved = Object.keys(allGames).length
  const clearGames = useGames((state) => state.clearGames)
  const [asking, setAsking] = useState(false)

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-4">
      <header className="flex h-16 items-center gap-2.5 pr-4 pl-5">
        <span
          aria-hidden="true"
          className="grid h-[27px] w-5 -rotate-8 place-items-center rounded bg-accent text-[13px] text-card"
        >
          ♥
        </span>
        <span className="text-[21px] font-bold tracking-tight">Card Night</span>
        <div className="ml-auto">
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <div className="animate-rise px-5 pt-3 pb-5">
        <p className="label">The family scorekeeper</p>
        <h1 className="mt-2.5 text-[42px] leading-[1.02] font-bold tracking-tight">
          Deal 'em.
          <br />
          <span className="text-accent-text">We'll do the math.</span>
        </h1>
      </div>

      {open && <ContinueCard gameId={open.id} />}

      <div className="flex justify-between px-5 pt-6 pb-3">
        <span className="label">New game</span>
        <span className="font-mono text-xs text-muted">pick a card</span>
      </div>
      <nav aria-label="Games" className="flex justify-center gap-2.5 px-5 pt-2">
        {games.map((game, i) => {
          const tilt =
            i === 0 ? '-rotate-5 translate-y-1.5' : i === 2 ? 'rotate-5 translate-y-1.5' : ''
          const hot = i === 1
          const look = hot
            ? 'border-accent bg-accent text-accent-ink'
            : 'border-line bg-surface text-ink'
          const content = (
            <>
              <span className="font-mono text-[11px] opacity-70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`mt-auto leading-none font-bold tracking-tight ${game.name.length > 4 ? 'text-[22px]' : 'text-[34px]'}`}
              >
                {game.name}
              </span>
              <span className="mt-1.5 text-[13px] opacity-75">
                {game.definition ? game.blurb : 'Coming soon'}
              </span>
            </>
          )
          const deal = ['', '[animation-delay:90ms]', '[animation-delay:180ms]'][i] ?? ''
          const shape = `flex h-[150px] w-[108px] animate-deal flex-col rounded-[14px] border p-3 transition ${deal} ${tilt} ${look}`
          return game.definition ? (
            <Link
              key={game.id}
              to={`/new/${game.id}`}
              className={`${shape} hover:-translate-y-2.5 hover:rotate-0 active:scale-95`}
            >
              {content}
            </Link>
          ) : (
            <div key={game.id} className={`${shape} opacity-60`}>
              {content}
            </div>
          )
        })}
        {games.length < 3 && (
          <div className="flex h-[150px] w-[108px] translate-y-1.5 rotate-5 animate-deal flex-col rounded-[14px] border border-dashed [animation-delay:270ms] border-line p-3 text-muted">
            <span className="font-mono text-[11px]">0{games.length + 1}</span>
            <span className="mt-auto text-xl leading-[1.05] font-semibold tracking-tight">
              More after Christmas
            </span>
          </div>
        )}
      </nav>

      <footer className="mt-auto flex items-center justify-between px-5 pt-8 font-mono text-[11px] text-muted">
        <span>saved on this phone</span>
        {saved > 0 && (
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="py-2 underline-offset-4 hover:underline"
          >
            clear saved games
          </button>
        )}
      </footer>
      <Confirm
        open={asking}
        onClose={() => setAsking(false)}
        title="Clear saved games?"
        confirmLabel={`Clear ${saved === 1 ? 'the saved game' : `all ${saved} games`}`}
        onConfirm={() => {
          clearGames()
          setAsking(false)
        }}
      >
        Every game on this phone is deleted, including any in progress, and the names you typed
        won't be filled in next time. Light or dark mode stays the way you set it.
      </Confirm>
    </div>
  )
}

function ContinueCard({ gameId }: { gameId: string }) {
  const game = useGames((state) => state.games[gameId])
  const entry = gameFor(game.type)
  const definition = entry?.definition
  if (!entry || !definition) return null

  const { totals, rounds } = replay(definition, game)
  const next = String(rounds.length + 1).padStart(2, '0')

  return (
    <section
      aria-label="Game in progress"
      className="paper relative mx-5 -rotate-[1.2deg] animate-rise rounded-[18px] p-[18px] pb-4 [animation-delay:120ms]"
    >
      <p className="font-mono text-[11px] tracking-wider text-card-muted uppercase">
        In progress · {definition.roundName} {next}
      </p>
      <p className="mt-0.5 mb-3.5 text-[30px] font-bold tracking-tight">{definition.name}</p>
      <div className="flex flex-col gap-3">
        {game.sides.map((side, i) => {
          const look = entry.look?.(i) ?? { bar: 'bg-accent' }
          const share = Math.max(0, Math.min(1, totals[side.id] / definition.target))
          return (
            <div key={side.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-2 font-medium">
                  {look.glyph ? (
                    <span aria-hidden="true" className={look.red ? 'text-suit-red' : ''}>
                      {look.glyph}
                    </span>
                  ) : (
                    <span aria-hidden="true" className={`h-3.5 w-2.5 rounded-[3px] ${look.chip}`} />
                  )}
                  {side.name}
                </span>
                <span className="text-2xl font-semibold tabular-nums">{totals[side.id]}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-card-track">
                <div
                  className={`h-full origin-left animate-fill rounded-full ${look.bar}`}
                  style={{ width: `${share * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <Link
        to={`/game/${game.id}`}
        className="mt-4 flex h-13 items-center justify-between rounded-[14px] bg-card-ink px-[18px] text-[17px] font-semibold text-card"
      >
        Continue game <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
