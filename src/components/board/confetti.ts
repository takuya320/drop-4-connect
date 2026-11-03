export type ConfettiShape = 'leaf' | 'petal'

export type ConfettiPiece = {
  id: number
  shape: ConfettiShape
  /** Horizontal start position, as a percentage of the overlay width. */
  left: number
  width: number
  height: number
  delayMs: number
  durationMs: number
  /** Horizontal drift at the end of the fall, in px. */
  swayPx: number
  spinDeg: number
  background: string
}

/** Small deterministic PRNG (mulberry32) so a seed always yields the same burst. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}

export function createConfetti(
  count: number,
  palette: readonly string[],
  random: () => number
): ConfettiPiece[] {
  if (palette.length === 0) return []

  return Array.from({ length: count }, (_, id) => {
    const shape: ConfettiShape = random() < 0.55 ? 'leaf' : 'petal'
    const size = between(random, 7, 13)
    return {
      id,
      shape,
      left: between(random, 2, 98),
      width: shape === 'leaf' ? size : size * 1.1,
      height: shape === 'leaf' ? size * 0.7 : size * 0.8,
      delayMs: Math.round(between(random, 0, 900)),
      durationMs: Math.round(between(random, 2600, 4200)),
      swayPx: Math.round(between(random, -70, 70)),
      spinDeg: Math.round(between(random, 240, 720)) * (random() < 0.5 ? -1 : 1),
      background: palette[Math.floor(random() * palette.length)],
    }
  })
}
