import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useGames } from '../../core/store'
import type { Game } from '../../core/types'
import { primaryButton, Segmented, TopBar } from '../../ui/controls'
import { defaultSettings, type Settings } from './score'
import { defaultTeamNames, teamLooks } from './teams'

type Team = { name: string; players: [string, string] }

const blank: Team[] = [
  { name: '', players: ['', ''] },
  { name: '', players: ['', ''] },
]

// Start from the last 500 game's names, since it's usually the same people.
function lastTeams(games: Record<string, Game>): { teams: Team[]; settings: Settings } {
  const last = Object.values(games)
    .filter((game) => game.type === '500')
    .sort((a, b) => b.createdAt - a.createdAt)[0]
  if (!last) return { teams: blank, settings: defaultSettings }
  return {
    teams: last.sides.map((side) => ({
      name: side.name,
      players: [side.players[0] ?? '', side.players[1] ?? ''],
    })),
    settings: { ...defaultSettings, ...(last.settings as Settings) },
  }
}

export function Setup() {
  const navigate = useNavigate()
  const startGame = useGames((state) => state.startGame)
  const [initial] = useState(() => lastTeams(useGames.getState().games))
  const [teams, setTeams] = useState(initial.teams)
  const [settings, setSettings] = useState(initial.settings)

  const setName = (i: number, name: string) =>
    setTeams(teams.map((team, j) => (j === i ? { ...team, name } : team)))
  const setPlayer = (i: number, p: number, value: string) =>
    setTeams(
      teams.map((team, j) =>
        j === i
          ? {
              ...team,
              players: team.players.map((v, k) => (k === p ? value : v)) as Team['players'],
            }
          : team,
      ),
    )

  const start = () => {
    const sides = teams.map((team, i) => ({
      id: i === 0 ? 'a' : 'b',
      name: team.name.trim() || defaultTeamNames[i],
      players: team.players.map((p) => p.trim()).filter(Boolean),
    }))
    const id = startGame('500', sides, settings)
    navigate(`/game/${id}`, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar
        back="/"
        title="New game"
        right={
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-muted">
            500
          </span>
        }
      />

      <p className="label px-5 pt-1.5 pb-2.5">Who's playing</p>
      <div className="flex flex-col gap-2.5 px-5">
        {teams.map((team, i) => {
          const look = teamLooks[i]
          const which = i === 0 ? 'one' : 'two'
          return (
            <div
              key={i}
              className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={`grid h-10 w-[30px] shrink-0 place-items-center rounded-md bg-card text-lg ${look.red ? 'text-suit-red' : 'text-card-ink'}`}
                >
                  {look.suit}
                </span>
                <input
                  aria-label={`Team ${which} name`}
                  placeholder={defaultTeamNames[i]}
                  value={team.name}
                  onChange={(e) => setName(i, e.target.value)}
                  className="h-10 min-w-0 flex-1 border-b border-line bg-transparent text-[22px] font-semibold placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {team.players.map((player, p) => (
                  <input
                    key={p}
                    aria-label={`Team ${which}, player ${p + 1}`}
                    placeholder={`Player ${p + 1}`}
                    value={player}
                    onChange={(e) => setPlayer(i, p, e.target.value)}
                    className="h-[42px] min-w-0 rounded-xl border border-line bg-well px-3.5 placeholder:text-muted/60 focus:border-accent focus:outline-none"
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between px-5 pt-6 pb-2.5">
        <span className="label">How your table plays</span>
        <span className="font-mono text-xs text-muted">american rules</span>
      </div>
      <div className="mx-5 rounded-2xl border border-line bg-surface px-3.5">
        <div className="flex min-h-[68px] items-center gap-3 border-b border-line">
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="leading-tight">All ten tricks scores 250?</span>
            <span className="text-[13px] text-muted">Only for bids worth less</span>
          </span>
          <Segmented
            label="All ten tricks scores 250"
            value={settings.slamBonus ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            onChange={(v) => setSettings({ ...settings, slamBonus: v === 'yes' })}
          />
        </div>
        <div className="flex min-h-[56px] items-center border-b border-line">
          <span className="flex-1">If everyone passes</span>
          <span className="text-muted">Redeal</span>
        </div>
        <div className="flex min-h-[56px] items-center">
          <span className="flex-1">Play to</span>
          <span className="text-2xl font-semibold tabular-nums">500</span>
        </div>
      </div>

      <div className="mt-auto px-5 pt-6 pb-6">
        <button type="button" onClick={start} className={primaryButton}>
          Shuffle up and deal <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
