import { Button, Container, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { useState } from 'react'

const ROWS = 6
const COLS = 7

type Player = 'red' | 'yellow' | null

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f0f0',
  padding: '20px',
})

const BoardContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, 55px)`,
  gridTemplateRows: `auto repeat(${ROWS}, 55px)`,
  gap: '5px',
  marginBottom: '20px',
  paddingTop: '5px',
})

const Circle = styled('div')({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: '1px solid black',
  boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
})

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
    <StyledContainer maxWidth='md'>
      <Typography variant='h4' component='h1' gutterBottom>
        玉落とし4目並べ
      </Typography>
      <Typography variant='body1' gutterBottom>
        現在のプレイヤー: {currentPlayer === 'red' ? '赤' : '黄'}
      </Typography>
      {winner && (
        <Typography variant='h6' gutterBottom>
          勝者: {winner === 'red' ? '赤' : '黄'}
        </Typography>
      )}
      <BoardContainer>
        {Array.from({ length: COLS }).map((_, col) => (
          <Button key={col} variant='contained' onClick={() => handleClick(col)} style={{ margin: '5px' }}>
            置く
          </Button>
        ))}
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Circle
              key={`${rowIndex}-${colIndex}`}
              style={{
                backgroundColor: cell === 'red' ? 'red' : cell === 'yellow' ? 'yellow' : 'white',
              }}
            />
          ))
        )}
      </BoardContainer>
    </StyledContainer>
  )
}

export default App
