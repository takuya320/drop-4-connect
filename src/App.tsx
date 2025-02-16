import { Button } from '@mui/material'
import { useState } from 'react'

const ROWS = 6
const COLS = 7

type Player = 'red' | 'yellow' | null

function App() {
  const [board, setBoard] = useState<Player[][]>(() => {
    const initialBoard: Player[][] = []
    for (let i = 0; i < ROWS; i++) {
      initialBoard.push(Array(COLS).fill(null))
    }
    return initialBoard
  })
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [winner, setWinner] = useState<Player>(null)

  const handleClick = (col: number) => {
    if (winner) return

    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) {
        const newBoard = board.map((r, i) => (i === row ? r.map((c, j) => (j === col ? currentPlayer : c)) : r))
        setBoard(newBoard)

        // Check for winner
        if (checkWinner(newBoard, row, col, currentPlayer)) {
          setWinner(currentPlayer)
        } else {
          setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
        }
        break
      }
    }
  }

  const checkWinner = (board: Player[][], row: number, col: number, player: Player): boolean => {
    // Check horizontal
    let count = 0
    for (let c = Math.max(0, col - 3); c <= Math.min(COLS - 1, col + 3); c++) {
      if (board[row][c] === player) {
        count++
        if (count === 4) return true
      } else {
        count = 0
      }
    }

    // Check vertical
    count = 0
    for (let r = Math.max(0, row - 3); r <= Math.min(ROWS - 1, row + 3); r++) {
      if (board[r][col] === player) {
        count++
        if (count === 4) return true
      } else {
        count = 0
      }
    }

    // Check diagonal (top-left to bottom-right)
    count = 0
    for (
      let i = -3;
      i <= 3;
      i++ // row + i, col + i
    ) {
      const r = row + i
      const c = col + i
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++
        if (count === 4) return true
      } else {
        count = 0
      }
    }

    // Check diagonal (top-right to bottom-left)
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

  return (
    <div>
      <h1>Connect Four</h1>
      <div>Current Player: {currentPlayer}</div>
      {winner && <div>Winner: {winner}</div>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 50px)`,
          gap: '5px',
        }}
      >
        {Array.from({ length: COLS }).map((_, col) => (
          <Button key={col} variant='contained' onClick={() => handleClick(col)}>
            Drop
          </Button>
        ))}
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: cell === 'red' ? 'red' : cell === 'yellow' ? 'yellow' : 'white',
                border: '1px solid black',
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default App
