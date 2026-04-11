import { describe, it, expect } from 'vitest'
import {
  type Player,
  ROWS,
  COLS,
  createEmptyBoard,
  checkWinner,
  findDropRow,
  dropDisc,
  isDraw,
  isColumnFull,
  countMoves,
} from '../gameLogic'

describe('createEmptyBoard', () => {
  it('creates a 6x7 board filled with null', () => {
    const board = createEmptyBoard()
    expect(board).toHaveLength(ROWS)
    for (const row of board) {
      expect(row).toHaveLength(COLS)
      expect(row.every((cell) => cell === null)).toBe(true)
    }
  })

  it('returns a new array each time', () => {
    const a = createEmptyBoard()
    const b = createEmptyBoard()
    expect(a).not.toBe(b)
    expect(a[0]).not.toBe(b[0])
  })
})

describe('findDropRow', () => {
  it('returns the bottom row for an empty column', () => {
    const board = createEmptyBoard()
    expect(findDropRow(board, 0)).toBe(ROWS - 1)
  })

  it('returns the row above the last placed disc', () => {
    const board = createEmptyBoard()
    board[ROWS - 1][3] = 'red'
    expect(findDropRow(board, 3)).toBe(ROWS - 2)
  })

  it('returns -1 when the column is full', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < ROWS; r++) {
      board[r][0] = 'red'
    }
    expect(findDropRow(board, 0)).toBe(-1)
  })
})

describe('dropDisc', () => {
  it('places a disc at the bottom of an empty column', () => {
    const board = createEmptyBoard()
    const result = dropDisc(board, 3, 'red')
    expect(result).not.toBeNull()
    expect(result!.row).toBe(ROWS - 1)
    expect(result!.newBoard[ROWS - 1][3]).toBe('red')
  })

  it('does not mutate the original board', () => {
    const board = createEmptyBoard()
    dropDisc(board, 3, 'red')
    expect(board[ROWS - 1][3]).toBeNull()
  })

  it('returns null when the column is full', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < ROWS; r++) {
      board[r][2] = 'yellow'
    }
    expect(dropDisc(board, 2, 'red')).toBeNull()
  })

  it('stacks discs correctly', () => {
    const board = createEmptyBoard()
    const r1 = dropDisc(board, 0, 'red')!
    const r2 = dropDisc(r1.newBoard, 0, 'yellow')!
    expect(r1.row).toBe(ROWS - 1)
    expect(r2.row).toBe(ROWS - 2)
    expect(r2.newBoard[ROWS - 1][0]).toBe('red')
    expect(r2.newBoard[ROWS - 2][0]).toBe('yellow')
  })
})

describe('checkWinner', () => {
  function placeLine(
    board: Player[][],
    positions: [number, number][],
    player: Player
  ) {
    for (const [r, c] of positions) {
      board[r][c] = player
    }
  }

  it('detects horizontal win', () => {
    const board = createEmptyBoard()
    const row = ROWS - 1
    placeLine(board, [[row, 0], [row, 1], [row, 2], [row, 3]], 'red')
    expect(checkWinner(board, row, 3, 'red')).toBe(true)
    expect(checkWinner(board, row, 0, 'red')).toBe(true)
  })

  it('detects vertical win', () => {
    const board = createEmptyBoard()
    placeLine(board, [[2, 0], [3, 0], [4, 0], [5, 0]], 'yellow')
    expect(checkWinner(board, 2, 0, 'yellow')).toBe(true)
    expect(checkWinner(board, 5, 0, 'yellow')).toBe(true)
  })

  it('detects diagonal ↘ win', () => {
    const board = createEmptyBoard()
    placeLine(board, [[0, 0], [1, 1], [2, 2], [3, 3]], 'red')
    expect(checkWinner(board, 0, 0, 'red')).toBe(true)
    expect(checkWinner(board, 3, 3, 'red')).toBe(true)
  })

  it('detects diagonal ↙ win', () => {
    const board = createEmptyBoard()
    placeLine(board, [[0, 6], [1, 5], [2, 4], [3, 3]], 'yellow')
    expect(checkWinner(board, 0, 6, 'yellow')).toBe(true)
    expect(checkWinner(board, 3, 3, 'yellow')).toBe(true)
  })

  it('returns false when only 3 in a row', () => {
    const board = createEmptyBoard()
    const row = ROWS - 1
    placeLine(board, [[row, 0], [row, 1], [row, 2]], 'red')
    expect(checkWinner(board, row, 2, 'red')).toBe(false)
  })

  it('returns false when line is broken by opponent', () => {
    const board = createEmptyBoard()
    const row = ROWS - 1
    placeLine(board, [[row, 0], [row, 1]], 'red')
    board[row][2] = 'yellow'
    placeLine(board, [[row, 3], [row, 4]], 'red')
    expect(checkWinner(board, row, 0, 'red')).toBe(false)
  })

  it('detects horizontal win in the middle of the row', () => {
    const board = createEmptyBoard()
    const row = ROWS - 1
    placeLine(board, [[row, 2], [row, 3], [row, 4], [row, 5]], 'red')
    expect(checkWinner(board, row, 4, 'red')).toBe(true)
  })
})

describe('isDraw', () => {
  it('returns false on an empty board', () => {
    expect(isDraw(createEmptyBoard(), null)).toBe(false)
  })

  it('returns false when there is a winner', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        board[r][c] = (r + c) % 2 === 0 ? 'red' : 'yellow'
      }
    }
    expect(isDraw(board, 'red')).toBe(false)
  })

  it('returns true when board is full and no winner', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        board[r][c] = (r + c) % 2 === 0 ? 'red' : 'yellow'
      }
    }
    expect(isDraw(board, null)).toBe(true)
  })
})

describe('isColumnFull', () => {
  it('returns false for an empty column', () => {
    expect(isColumnFull(createEmptyBoard(), 0)).toBe(false)
  })

  it('returns true when column is full', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < ROWS; r++) {
      board[r][4] = 'red'
    }
    expect(isColumnFull(board, 4)).toBe(true)
  })

  it('returns false when column is partially filled', () => {
    const board = createEmptyBoard()
    board[ROWS - 1][0] = 'red'
    board[ROWS - 2][0] = 'yellow'
    expect(isColumnFull(board, 0)).toBe(false)
  })
})

describe('countMoves', () => {
  it('returns 0 for an empty board', () => {
    expect(countMoves(createEmptyBoard())).toBe(0)
  })

  it('counts placed discs correctly', () => {
    const board = createEmptyBoard()
    board[ROWS - 1][0] = 'red'
    board[ROWS - 1][1] = 'yellow'
    board[ROWS - 2][0] = 'red'
    expect(countMoves(board)).toBe(3)
  })

  it('returns 42 for a full board', () => {
    const board = createEmptyBoard()
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        board[r][c] = 'red'
      }
    }
    expect(countMoves(board)).toBe(42)
  })
})
