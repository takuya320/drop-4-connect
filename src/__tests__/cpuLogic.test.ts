import { describe, expect, it } from 'vitest'
import {
  chooseCpuMove,
  getAvailableMoves,
  makeMove,
  searchAtDepth,
  type CpuDifficulty,
  type DiscPlayer,
  type SearchContext,
} from '../cpuLogic'
import { COLS, ROWS, checkWinner, createEmptyBoard, type Player } from '../gameLogic'

function boardWithBottomRow(cells: Player[]): Player[][] {
  const board = createEmptyBoard()
  cells.forEach((cell, column) => {
    board[ROWS - 1][column] = cell
  })
  return board
}

describe('CPU tactics', () => {
  it.each<CpuDifficulty>([2, 3, 4])(
    'Level %i completes an immediate win',
    (difficulty) => {
      const board = boardWithBottomRow(['yellow', 'yellow', 'yellow'])
      expect(chooseCpuMove(board, difficulty, 'yellow', { random: () => 0.5 })).toBe(3)
    }
  )

  it.each<CpuDifficulty>([2, 3, 4])(
    'Level %i blocks the opponent immediate win',
    (difficulty) => {
      const board = boardWithBottomRow(['red', 'red', 'red'])
      expect(chooseCpuMove(board, difficulty, 'yellow', { random: () => 0.5 })).toBe(3)
    }
  )

  it('Level 1 remains fallible even when it can win', () => {
    const board = boardWithBottomRow(['yellow', 'yellow', 'yellow'])
    expect(chooseCpuMove(board, 1, 'yellow', { random: () => 0.9 })).not.toBe(3)
  })
})

describe('CPU move legality', () => {
  it('does not include a filled column in available moves', () => {
    const board = createEmptyBoard()
    for (let row = 0; row < ROWS; row++) board[row][3] = 'red'

    expect(getAvailableMoves(board)).not.toContain(3)
  })

  it.each<CpuDifficulty>([1, 2, 3, 4])(
    'Level %i returns only a legal move',
    (difficulty) => {
      const board = createEmptyBoard()
      for (let row = 0; row < ROWS; row++) {
        board[row][3] = row % 2 === 0 ? 'red' : 'yellow'
      }

      const move = chooseCpuMove(board, difficulty, 'yellow', {
        random: () => 0.5,
        timeLimitMs: 20,
      })

      expect(move).toBeGreaterThanOrEqual(0)
      expect(move).toBeLessThan(COLS)
      expect(move).not.toBe(3)
      expect(makeMove(board, move, 'yellow')).not.toBeNull()
    }
  )

  it('returns no move on a full board', () => {
    const board = createEmptyBoard().map((row, rowIndex) =>
      row.map((_, columnIndex) =>
        (rowIndex + columnIndex) % 2 === 0 ? 'red' : 'yellow'
      )
    )
    expect(chooseCpuMove(board, 4)).toBe(-1)
  })
})

describe('shared win rules', () => {
  it('recognizes a CPU move with the existing winner check', () => {
    const board = boardWithBottomRow(['yellow', 'yellow', 'yellow'])
    const move = chooseCpuMove(board, 2)
    const result = makeMove(board, move, 'yellow')

    expect(result).not.toBeNull()
    expect(checkWinner(result!.board, result!.row, move, 'yellow')).toBe(true)
  })
})

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomPosition(
  random: () => number,
  plies: number
): { board: Player[][]; toMove: DiscPlayer } {
  let board = createEmptyBoard()
  let toMove: DiscPlayer = 'red'
  for (let ply = 0; ply < plies; ply++) {
    const moves = getAvailableMoves(board)
    const column = moves[Math.floor(random() * moves.length)]
    const result = makeMove(board, column, toMove)
    if (!result) break
    board = result.board
    if (checkWinner(board, result.row, column, toMove)) break
    toMove = toMove === 'red' ? 'yellow' : 'red'
  }
  return { board, toMove }
}

describe('transposition table', () => {
  // Within one fixed-depth search a board is always reached with the same
  // remaining depth, so a correct table must reproduce the plain alpha-beta
  // score exactly. Reusing a cutoff bound as an exact score breaks this.
  // Samples 40 and 102 of this seeded sequence are positions where that
  // mistake changed the score.
  it('does not change the search score compared with a plain alpha-beta search', () => {
    const random = mulberry32(7)
    const regressionSamples = new Set([40, 102])

    for (let sample = 0; sample <= 102; sample++) {
      const { board, toMove } = randomPosition(random, 6 + (sample % 20))
      if (!regressionSamples.has(sample)) continue

      const search = (table?: SearchContext['table']) =>
        searchAtDepth(board, toMove, 6, {
          cpu: toMove,
          deadline: Number.POSITIVE_INFINITY,
          table,
          timedOut: false,
        })

      expect(search(new Map()).score).toBe(search().score)
    }
  })
})
