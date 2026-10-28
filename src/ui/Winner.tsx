import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { primaryButton, secondaryButton } from './controls'

export type Place = {
  id: string
  name: string
  total: number
  suit: string
  red: boolean
}

type Props = {
  // "GAME OVER · 500 · 8 HANDS"
  kicker: string
  headline: string
  // first place first
  places: Place[]
  children?: ReactNode
  onRematch: () => void
  rematchLabel: string
  onUndo: () => void
  undoLabel: string
}

const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th']

export function Winner({
  kicker,
  headline,
  places,
  children,
  onRematch,
  rematchLabel,
  onUndo,
  undoLabel,
}: Props) {
  const [first, second, ...rest] = places

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden px-5 pt-14 pb-6">
      <Rain />

      <div className="relative flex flex-col items-center text-center">
        <p className="label animate-rise">{kicker}</p>
        <h1 className="mt-2 animate-rise text-[44px] leading-none font-bold tracking-tight [animation-delay:120ms]">
          {headline}
        </h1>
      </div>

      <div className="relative mt-9 flex justify-center">
        <PlaceCard place={first} index={0} className="z-10 animate-deal-left -rotate-6" />
        {second && (
          <PlaceCard
            place={second}
            index={1}
            className="-ml-3 translate-y-3.5 animate-deal-right rotate-[7deg]"
          />
        )}
      </div>

      {rest.length > 0 && (
        <ol className="relative mt-8 rounded-2xl border border-line bg-surface">
          {rest.map((place, i) => (
            <li
              key={place.id}
              className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <span className="label w-8">{ordinals[i + 2]}</span>
              <span className="flex-1 truncate font-medium">{place.name}</span>
              <span className="font-semibold tabular-nums">{place.total}</span>
            </li>
          ))}
        </ol>
      )}

      {children && (
        <div className="relative mt-9 animate-rise rounded-2xl border border-line bg-surface/90 px-4 py-3.5 text-[15px] leading-snug text-muted [animation-delay:900ms]">
          {children}
        </div>
      )}

      <div className="relative mt-auto flex flex-col gap-2.5 pt-8">
        <button type="button" onClick={onRematch} className={primaryButton}>
          {rematchLabel} <span aria-hidden="true">↻</span>
        </button>
        <Link to="/" className={`${secondaryButton} bg-surface`}>
          Back to home
        </Link>
        <button
          type="button"
          onClick={onUndo}
          className="mt-1 self-center text-sm text-muted underline-offset-4 hover:underline"
        >
          {undoLabel}
        </button>
      </div>
    </div>
  )
}

function PlaceCard({
  place,
  index,
  className,
}: {
  place: Place
  index: number
  className: string
}) {
  const corner = (
    <span
      className={`flex flex-col items-center leading-none font-bold ${place.red ? 'text-suit-red' : ''}`}
    >
      {index + 1}
      <span className="text-[13px]">{place.suit}</span>
    </span>
  )
  const big = index === 0
  return (
    <div
      className={`paper relative flex shrink-0 flex-col rounded-2xl ${
        big ? 'h-[210px] w-[156px] ring-[3px] ring-accent' : 'h-[188px] w-[140px]'
      } pt-3.5 pr-4 pb-4 pl-[34px] ${className}`}
    >
      <span aria-hidden="true" className="absolute top-3 left-[11px] text-sm">
        {corner}
      </span>
      <span aria-hidden="true" className="absolute right-3 bottom-3 rotate-180 text-sm">
        {corner}
      </span>
      <span className="font-mono text-[11px] tracking-wider text-card-muted uppercase">
        {ordinals[index]}
      </span>
      <span className="truncate font-semibold">{place.name}</span>
      <span
        className={`mt-auto leading-none font-semibold tracking-tight tabular-nums ${big ? 'text-[52px]' : 'text-[42px]'}`}
      >
        {place.total < 0 ? `−${Math.abs(place.total)}` : place.total}
      </span>
    </div>
  )
}

// Cards drifting down behind everything. Fixed positions so it looks the same every time.
const drops = [
  { left: 4, suit: '♥', time: 6.2, delay: -1.2, spin: -320 },
  { left: 14, suit: '♠', time: 7.4, delay: -4.8, spin: 380 },
  { left: 24, suit: '♦', time: 5.6, delay: -2.6, spin: 300 },
  { left: 34, suit: '♣', time: 6.8, delay: -0.4, spin: -360 },
  { left: 46, suit: '♥', time: 7.9, delay: -5.9, spin: 340 },
  { left: 56, suit: '♠', time: 5.9, delay: -3.3, spin: -300 },
  { left: 66, suit: '♦', time: 6.6, delay: -1.8, spin: 400 },
  { left: 76, suit: '♣', time: 7.1, delay: -6.4, spin: -380 },
  { left: 86, suit: '♥', time: 5.4, delay: -2.1, spin: 320 },
  { left: 92, suit: '♠', time: 6.9, delay: -4.1, spin: -340 },
]

function Rain() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {drops.map((drop, i) => (
        <span
          key={i}
          className={`paper absolute -top-14 grid h-[46px] w-[34px] animate-fall place-items-center rounded-[5px] text-lg opacity-80 ${
            drop.suit === '♥' || drop.suit === '♦' ? 'text-suit-red' : ''
          }`}
          style={
            {
              left: `${drop.left}%`,
              animationDuration: `${drop.time}s`,
              animationDelay: `${drop.delay}s`,
              '--spin': `${drop.spin}deg`,
            } as CSSProperties
          }
        >
          {drop.suit}
        </span>
      ))}
    </div>
  )
}
