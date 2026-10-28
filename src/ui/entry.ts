// The page and panel around hand or round entry. On a phone it's a sheet over the table; on a
// wide screen it's docked next to the scoreboard.
export function entryPage(docked: boolean) {
  return docked
    ? 'sticky top-0 flex h-dvh flex-col py-6'
    : 'mx-auto flex min-h-dvh max-w-md flex-col pt-7 md:py-10'
}

export function entryPanel(docked: boolean) {
  return docked
    ? 'flex min-h-0 flex-1 animate-sheet flex-col overflow-y-auto rounded-[26px] border border-line bg-surface'
    : 'flex flex-1 animate-sheet flex-col rounded-t-[26px] border-t border-line bg-surface shadow-[0_-20px_50px_rgb(0_0_0/0.35)] md:flex-none md:rounded-[26px] md:border'
}
