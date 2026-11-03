import { describe, expect, it } from 'vitest'
import {
  createConfetti,
  createSeededRandom,
} from '../components/board/confetti'

const palette = ['#f00', '#0f0', '#00f']

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const first = createSeededRandom(42)
    const second = createSeededRandom(42)
    const sequence = Array.from({ length: 5 }, () => first())

    expect(Array.from({ length: 5 }, () => second())).toEqual(sequence)
    for (const value of sequence) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('produces a different sequence for a different seed', () => {
    expect(createSeededRandom(1)()).not.toBe(createSeededRandom(2)())
  })
})

describe('createConfetti', () => {
  it('creates the requested number of pieces within the overlay', () => {
    const pieces = createConfetti(40, palette, createSeededRandom(7))

    expect(pieces).toHaveLength(40)
    for (const piece of pieces) {
      expect(piece.left).toBeGreaterThanOrEqual(0)
      expect(piece.left).toBeLessThanOrEqual(100)
      expect(piece.durationMs).toBeGreaterThan(0)
      expect(palette).toContain(piece.background)
    }
  })

  it('is deterministic for a given random source', () => {
    expect(createConfetti(10, palette, createSeededRandom(3))).toEqual(
      createConfetti(10, palette, createSeededRandom(3))
    )
  })

  it('returns nothing without colours to draw from', () => {
    expect(createConfetti(10, [], createSeededRandom(3))).toEqual([])
  })
})
