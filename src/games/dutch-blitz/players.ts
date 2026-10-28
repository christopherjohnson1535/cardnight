// Each seat gets a color, like the colored backs of the Blitz decks.
export const playerLooks = [
  { color: 'bg-[#ff5b3a]', bar: 'bg-[#ff5b3a]' },
  { color: 'bg-[#4f9fe8]', bar: 'bg-[#4f9fe8]' },
  { color: 'bg-[#5cb85c]', bar: 'bg-[#5cb85c]' },
  { color: 'bg-[#f5b731]', bar: 'bg-[#f5b731]' },
  { color: 'bg-[#a77ff0]', bar: 'bg-[#a77ff0]' },
  { color: 'bg-[#ee6fae]', bar: 'bg-[#ee6fae]' },
] as const

export const playerLook = (i: number) => playerLooks[i % playerLooks.length]
