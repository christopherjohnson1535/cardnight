import { useEffect, useRef, useState, type ReactNode } from 'react'
import { iconButton } from './controls'

type SheetProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

// A bottom sheet on top of the current screen. The native dialog handles focus and Escape.
export function Sheet({ open, onClose, title, subtitle, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="mx-auto mt-auto mb-0 max-h-[92dvh] animate-sheet w-full max-w-md overflow-hidden rounded-t-[26px] border-t border-line bg-surface text-ink backdrop:bg-black/60"
    >
      <div className="flex max-h-[92dvh] flex-col">
        <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line" />
        <header className="flex shrink-0 items-center gap-3 px-4 pt-2 pb-3 pl-5">
          <div className="flex flex-col leading-tight">
            <h2 className="text-[22px] font-bold tracking-tight">{title}</h2>
            {subtitle && <span className="font-mono text-[11px] text-muted">{subtitle}</span>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={`${iconButton} ml-auto size-10`}
          >
            <span aria-hidden="true" className="text-xl">
              ×
            </span>
          </button>
        </header>
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </dialog>
  )
}

type QuestionProps = {
  title: ReactNode
  help: string
  aside?: ReactNode
}

// A question heading with a small "?" that shows one line of help underneath.
export function Question({ title, help, aside }: QuestionProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <h2 className="font-medium">{title}</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Hide help' : 'What does this mean?'}
          onClick={() => setOpen(!open)}
          className={`grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold transition-colors ${
            open ? 'border-pick bg-pick text-pick-ink' : 'border-line text-muted'
          }`}
        >
          ?
        </button>
        {aside && <span className="ml-auto">{aside}</span>}
      </div>
      {open && <p className="mt-1.5 text-sm leading-snug text-muted">{help}</p>}
    </div>
  )
}
