export type Player = 'red' | 'yellow' | null

export const ROWS = 6
export const COLS = 7

export function createEmptyBoard(): Player[][] {
  const board: Player[][] = []
  for (let i = 0; i < ROWS; i++) {
    board.push(Array(COLS).fill(null))
  }
  return board
}

export function checkWinner(
  board: Player[][],
  row: number,
  col: number,
  player: Player
): boolean {
  // horizontal
  let count = 0
  for (let c = Math.max(0, col - 3); c <= Math.min(COLS - 1, col + 3); c++) {
    if (board[row][c] === player) {
      count++
      if (count === 4) return true
    } else {
      count = 0
    }
  }

  // vertical
  count = 0
  for (let r = Math.max(0, row - 3); r <= Math.min(ROWS - 1, row + 3); r++) {
    if (board[r][col] === player) {
      count++
      if (count === 4) return true
    } else {
      count = 0
    }
  }

  // diagonal ↘
  count = 0
  for (let i = -3; i <= 3; i++) {
    const r = row + i
    const c = col + i
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++
      if (count === 4) return true
    } else {
      count = 0
    }
  }

  // diagonal ↙
  count = 0
  for (let i = -3; i <= 3; i++) {
    const r = row + i
    const c = col - i
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count++
      if (count === 4) return true
    } else {
      count = 0
    }
  }

  return false
}

export function findDropRow(board: Player[][], col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) return row
  }
  return -1
}

export function dropDisc(
  board: Player[][],
  col: number,
  player: Player
): { newBoard: Player[][]; row: number } | null {
  const row = findDropRow(board, col)
  if (row === -1) return null
  const newBoard = board.map((r, i) =>
    i === row ? r.map((c, j) => (j === col ? player : c)) : r
  )
  return { newBoard, row }
}

export function isDraw(board: Player[][], winner: Player): boolean {
  if (winner) return false
  return board[0].every((cell) => cell !== null)
}

export function isColumnFull(board: Player[][], col: number): boolean {
  return board[0][col] !== null
}

export function countMoves(board: Player[][]): number {
  return board.reduce((sum, row) => sum + row.filter((c) => c !== null).length, 0)
}
