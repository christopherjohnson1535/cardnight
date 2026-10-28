import { replay } from '../../core/game'
import type { Game } from '../../core/types'
import { TopBar } from '../../ui/controls'
import { fiveHundred, type Hand, type Settings } from './score'
import { teamLooks } from './teams'

export function Board({ game }: { game: Game<Settings, Hand> }) {
  const { totals, rounds } = replay(fiveHundred, game)
  const next = String(rounds.length + 1).padStart(2, '0')

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar back="/" backLabel="Back to home" title="500" subtitle={`hand ${next} next`} />
      <section aria-label="Totals" className="grid grid-cols-2 gap-3 px-5 pt-2">
        {game.sides.map((side, i) => {
          const look = teamLooks[i]
          return (
            <div key={side.id} className="paper flex h-[196px] flex-col rounded-2xl p-3.5">
              <span className="flex items-center gap-2 font-semibold">
                <span aria-hidden="true" className={look.red ? 'text-suit-red' : ''}>
                  {look.suit}
                </span>
                {side.name}
              </span>
              <span className="mt-auto text-[54px] leading-none font-semibold tracking-tight tabular-nums">
                {totals[side.id]}
              </span>
            </div>
          )
        })}
      </section>
    </div>
  )
}
