export type Player = 'red' | 'yellow' | null

export const ROWS = 6
export const COLS = 7
export type BoardPosition = readonly [row: number, col: number]

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

export function findWinningCells(
  board: Player[][],
  player: Exclude<Player, null>
): BoardPosition[] {
  const directions: BoardPosition[] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] !== player) continue

      for (const [rowStep, colStep] of directions) {
        const cells = Array.from({ length: 4 }, (_, index) => {
          return [row + rowStep * index, col + colStep * index] as const
        })

        if (
          cells.every(
            ([candidateRow, candidateCol]) =>
              candidateRow >= 0 &&
              candidateRow < ROWS &&
              candidateCol >= 0 &&
              candidateCol < COLS &&
              board[candidateRow][candidateCol] === player
          )
        ) {
          return cells
        }
      }
    }
  }

  return []
}

export function findDropRow(board: Player[][], col: number): number {
  if (!Number.isInteger(col) || col < 0 || col >= COLS) return -1

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
