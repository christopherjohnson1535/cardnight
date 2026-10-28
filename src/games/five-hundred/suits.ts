import type { Bid, Suit } from './score'

export const suitLook: Record<Suit, { glyph: string; red: boolean; name: string }> = {
  s: { glyph: '♠', red: false, name: 'spades' },
  c: { glyph: '♣', red: false, name: 'clubs' },
  d: { glyph: '♦', red: true, name: 'diamonds' },
  h: { glyph: '♥', red: true, name: 'hearts' },
  n: { glyph: 'NT', red: false, name: 'no trumps' },
}

// "8♥", "6NT"
export function bidLabel(bid: Bid) {
  return `${bid.tricks}${suitLook[bid.suit].glyph}`
}
