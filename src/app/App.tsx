import { useTheme } from '../core/theme'
import { ThemeToggle } from '../ui/ThemeToggle'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
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

      <main className="px-5 pt-3">
        <p className="font-mono text-xs tracking-wider text-muted">THE FAMILY SCOREKEEPER</p>
        <h1 className="mt-2.5 text-[42px] leading-[1.02] font-bold tracking-tight">
          Deal 'em.
          <br />
          <span className="text-accent-text">We'll do the math.</span>
        </h1>
      </main>
    </div>
  )
}
