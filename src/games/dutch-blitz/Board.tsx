import { Link } from 'react-router'
import { replay } from '../../core/game'
import type { Game } from '../../core/types'
import { primaryButton, TopBar } from '../../ui/controls'
import { playerLook } from './players'
import { dutchBlitz, TARGET, type Round, type Settings } from './score'

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

      <ol aria-label="Totals" className="flex flex-col gap-2 px-5 pt-2">
        {game.sides.map((side, i) => (
          <li
            key={side.id}
            className="flex h-[58px] items-center gap-3 rounded-2xl border border-line bg-surface px-3.5"
          >
            <span aria-hidden="true" className={`h-8 w-6 rounded-[5px] ${playerLook(i).color}`} />
            <span className="flex-1 truncate text-[19px] font-medium">{side.name}</span>
            <span className="text-2xl font-semibold tabular-nums">{totals[side.id]}</span>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-table from-70% to-transparent px-5 pt-6 pb-6">
        <Link to={`/game/${game.id}/round`} className={primaryButton}>
          Enter round {next}{' '}
          <span aria-hidden="true" className="text-[22px]">
            +
          </span>
        </Link>
      </div>
    </div>
  )
}
