import type { ReactNode } from 'react'
import { Link } from 'react-router'

export const iconButton =
  'grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink transition active:scale-95'

export const primaryButton =
  'flex h-14 w-full items-center justify-between rounded-2xl bg-accent px-5 text-lg font-bold text-accent-ink transition active:scale-[0.98] disabled:opacity-40'

export const secondaryButton =
  'flex h-13 w-full items-center justify-center rounded-2xl border border-line text-base font-semibold text-ink transition active:scale-[0.98]'

type TopBarProps = {
  back?: string
  backLabel?: string
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
}

export function TopBar({ back, backLabel = 'Back', title, subtitle, right }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 px-4">
      {back && (
        <Link to={back} aria-label={backLabel} className={iconButton}>
          <span aria-hidden="true" className="text-lg">
            ←
          </span>
        </Link>
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[19px] font-semibold">{title}</span>
        {subtitle && <span className="font-mono text-[11px] text-muted">{subtitle}</span>}
      </div>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </header>
  )
}

type SegmentedProps<T extends string> = {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex shrink-0 rounded-full border border-line bg-well p-[3px]"
    >
      {options.map((option) => {
        const on = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={`h-[34px] rounded-full px-3 text-sm transition-colors ${
              on ? 'bg-pick font-semibold text-pick-ink' : 'font-medium text-muted'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
