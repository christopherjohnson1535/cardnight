import type { ReactNode } from 'react'
import type { Side } from '../../core/types'
import { Sheet } from '../../ui/Sheet'
import { bidValue, SUITS, TARGET, TRICK_COUNTS, type Settings } from './score'
import { suitLook } from './suits'

type Props = {
  open: boolean
  onClose: () => void
  sides: Side[]
  settings: Settings
}

// The example in "Made it" is highlighted in the table
const example = { tricks: 8, suit: 'h' } as const

export function Rules({ open, onClose, sides, settings }: Props) {
  const [a, b] = sides.map((side) => side.name)

  return (
    <Sheet open={open} onClose={onClose} title="How scoring works" subtitle="500 · american rules">
      <div className="flex items-baseline justify-between pb-2">
        <h3 className="font-semibold">The bid sets the stakes</h3>
        <span className="font-mono text-xs text-muted">+100 per trick</span>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-[3px] text-center tabular-nums">
        <thead>
          <tr className="font-mono text-[11px] text-muted">
            <th scope="col" className="w-[42px] text-left font-normal">
              tricks
            </th>
            {SUITS.map((suit) => (
              <th
                key={suit}
                scope="col"
                aria-label={suitLook[suit].name}
                className={`font-semibold ${suit === 'n' ? 'text-xs' : 'text-base'} ${suitLook[suit].red ? 'text-suit-red' : 'text-ink'}`}
              >
                {suitLook[suit].glyph}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRICK_COUNTS.map((tricks) => (
            <tr key={tricks}>
              <th scope="row" className="text-left font-mono text-xs font-normal text-muted">
                {tricks}
              </th>
              {SUITS.map((suit) => {
                const on = tricks === example.tricks && suit === example.suit
                return (
                  <td
                    key={suit}
                    className={`h-8 rounded-md text-sm ${on ? 'animate-highlight bg-accent font-bold text-accent-ink' : 'bg-well'}`}
                  >
                    {bidValue({ tricks, suit })}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="label mt-6 mb-1">After each hand</h3>
      <dl>
        <Rule term="Made it">
          {a} bid 8♥ and took 8 tricks: +{bidValue(example)}. Extra tricks don't add more.
        </Rule>
        <Rule term="Went set">
          {b} bid 7♣ and only took 6: −{bidValue({ tricks: 7, suit: 'c' })}.
        </Rule>
        <Rule term="The other team">Always 10 a trick. {b} took 2: +20.</Rule>
        <Rule term="All ten tricks">
          {settings.slamBonus
            ? 'Worth at least 250 at this table. A 7♦ bid that takes all ten scores 250.'
            : `No bonus at this table. A 7♦ bid still scores ${bidValue({ tricks: 7, suit: 'd' })}.`}
        </Rule>
        <Rule term="Everyone passed">Nobody scores. Shuffle and deal again.</Rule>
      </dl>

      <h3 className="label mt-6 mb-1">Winning</h3>
      <p className="leading-snug text-muted">
        First team to {TARGET} wins, even on trick points. If both pass {TARGET} on the same hand,
        the bidders win. Fall to −{TARGET} and you're out.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 h-13 w-full rounded-2xl bg-pick text-base font-semibold text-pick-ink transition active:scale-[0.98]"
      >
        Got it
      </button>
    </Sheet>
  )
}

function Rule({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_1fr] gap-3 border-b border-line py-2.5 last:border-b-0">
      <dt className="font-semibold">{term}</dt>
      <dd className="leading-snug text-muted">{children}</dd>
    </div>
  )
}
