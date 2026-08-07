export type Player = 'red' | 'yellow' | null

export const ROWS = 6
export const COLS = 7

export type BoardPosition = {
  row: number
  col: number
}

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
  return getWinningCells(board, row, col, player).length >= 4
}

export function getWinningCells(
  board: Player[][],
  row: number,
  col: number,
  player: Player
): BoardPosition[] {
  if (!player || board[row]?.[col] !== player) return []

  const directions: ReadonlyArray<readonly [number, number]> = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]

  for (const [rowStep, colStep] of directions) {
    const line: BoardPosition[] = [{ row, col }]

    for (const direction of [-1, 1] as const) {
      let nextRow = row + rowStep * direction
      let nextCol = col + colStep * direction

      while (
        nextRow >= 0 &&
        nextRow < ROWS &&
        nextCol >= 0 &&
        nextCol < COLS &&
        board[nextRow][nextCol] === player
      ) {
        if (direction === -1) {
          line.unshift({ row: nextRow, col: nextCol })
        } else {
          line.push({ row: nextRow, col: nextCol })
        }
        nextRow += rowStep * direction
        nextCol += colStep * direction
      }
    }

    if (line.length >= 4) return line
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
