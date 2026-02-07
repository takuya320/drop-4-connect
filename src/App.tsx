import { Button, Container, GlobalStyles, Typography } from '@mui/material'
import { styled, keyframes } from '@mui/system'
import { useMemo, useState, useCallback, memo } from 'react'
import type { CSSProperties } from 'react'

const ROWS = 6
const COLS = 7

type Player = 'red' | 'yellow' | null

/* ─── keyframes ─── */
const dropIn = keyframes`
  0%   { transform: translateY(-60px) scale(0.9); opacity: 0; }
  60%  { transform: translateY(6px) scale(1.02); opacity: 1; }
  80%  { transform: translateY(-2px) scale(0.99); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,53,0.4); }
  50%      { box-shadow: 0 0 0 12px rgba(255,107,53,0); }
`

const floatUp = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const winGlow = keyframes`
  0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(255,200,50,0.3)); }
  50%      { filter: brightness(1.15) drop-shadow(0 0 20px rgba(255,200,50,0.6)); }
`

/* ─── styled components ─── */
const Page = styled('div')({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0a0e1a',
  position: 'relative',
  overflow: 'hidden',
  padding: '32px 16px',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(ellipse 900px 600px at 15% 20%, rgba(88,28,135,0.15), transparent),' +
      'radial-gradient(ellipse 700px 500px at 85% 70%, rgba(30,58,138,0.12), transparent),' +
      'radial-gradient(ellipse 500px 400px at 50% 50%, rgba(120,40,40,0.08), transparent)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage:
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    opacity: 0.5,
  },
})

const StyledContainer = styled(Container)({
  display: 'grid',
  gap: '28px',
  justifyItems: 'center',
  position: 'relative',
  zIndex: 1,
  animation: `${fadeSlideIn} 0.6s ease-out`,
})

const Header = styled('div')({
  textAlign: 'center',
  maxWidth: '680px',
})

const Title = styled(Typography)({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: 'transparent',
  backgroundImage: 'linear-gradient(135deg, #f5e6c8 0%, #e8c77b 40%, #d4a853 60%, #f5e6c8 100%)',
  backgroundSize: '200% auto',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  animation: `${shimmer} 4s ease-in-out infinite`,
  textShadow: 'none',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '60px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #d4a853, transparent)',
    margin: '12px auto 0',
  },
})

const Subtitle = styled(Typography)({
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  color: '#8891a8',
  letterSpacing: '0.04em',
  lineHeight: 1.8,
  fontSize: '0.95rem',
})

const StatusRow = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '14px',
  alignItems: 'center',
  justifyContent: 'center',
})

const Pill = styled('div')<{ isWinner?: boolean }>(({ isWinner }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 20px',
  borderRadius: '14px',
  background: isWinner
    ? 'linear-gradient(135deg, rgba(255,200,50,0.12), rgba(255,140,50,0.08))'
    : 'rgba(255,255,255,0.04)',
  border: isWinner ? '1px solid rgba(255,200,50,0.3)' : '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  color: isWinner ? '#ffd866' : '#c5cde0',
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontWeight: 600,
  fontSize: '0.9rem',
  letterSpacing: '0.03em',
  transition: 'all 0.3s ease',
  ...(isWinner && { animation: `${winGlow} 2s ease-in-out infinite` }),
}))

const Dot = styled('span')({
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0,
})

const GameCard = styled('div')({
  width: 'min(800px, 100%)',
  padding: '28px',
  borderRadius: '24px',
  background: 'linear-gradient(165deg, rgba(20,24,40,0.95) 0%, rgba(12,15,28,0.98) 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
  boxShadow:
    '0 40px 80px rgba(0,0,0,0.5),' +
    '0 0 0 1px rgba(255,255,255,0.03) inset,' +
    '0 1px 0 rgba(255,255,255,0.05) inset',
  display: 'grid',
  gap: '22px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '200px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.4), transparent)',
  },
})

const BoardShell = styled('div')({
  padding: '20px',
  borderRadius: '20px',
  background: 'linear-gradient(170deg, #162044 0%, #0d1530 50%, #0a0f22 100%)',
  boxShadow:
    'inset 0 2px 0 rgba(255,255,255,0.04),' +
    'inset 0 -8px 24px rgba(0,0,0,0.4),' +
    '0 8px 32px rgba(0,0,0,0.3)',
  display: 'grid',
  placeItems: 'center',
  position: 'relative',
  border: '1px solid rgba(255,255,255,0.03)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    borderRadius: '19px',
    background:
      'radial-gradient(ellipse 300px 200px at 30% 20%, rgba(60,90,180,0.08), transparent),' +
      'radial-gradient(ellipse 200px 150px at 70% 80%, rgba(120,50,80,0.06), transparent)',
    pointerEvents: 'none',
  },
})

const BoardContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, 66px)`,
  gridTemplateRows: `48px repeat(${ROWS}, 66px)`,
  gap: '8px',
  position: 'relative',
  zIndex: 1,
})

const ColumnButton = styled(Button)({
  minWidth: '66px',
  height: '48px',
  padding: 0,
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  boxShadow: 'none',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  '&:hover .drop-indicator': {
    background: 'var(--hover-bg)',
    boxShadow: 'var(--hover-shadow)',
    opacity: 1,
    transform: 'scale(1.1)',
  },
  '&.Mui-disabled': {
    opacity: 0.25,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.02)',
  },
})

const DropIndicator = styled('div')({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
  opacity: 0.5,
})

const Cell = styled('div')({
  width: '66px',
  height: '66px',
  borderRadius: '50%',
  background: 'radial-gradient(circle at 40% 35%, #0e1428 0%, #080c1a 60%, #050811 100%)',
  boxShadow:
    'inset 0 4px 8px rgba(255,255,255,0.03),' +
    'inset 0 -6px 16px rgba(0,0,0,0.6),' +
    'inset 0 0 0 2px rgba(255,255,255,0.02)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
})

const Disc = styled('div')({
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  animation: `${dropIn} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '6px',
    left: '10px',
    width: '18px',
    height: '10px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    filter: 'blur(3px)',
  },
})

const FooterRow = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '14px',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const Legend = styled('div')({
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
})

const LegendItem = styled('div')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#8891a8',
  fontSize: '0.82rem',
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  letterSpacing: '0.02em',
})

const ResetButton = styled(Button)({
  borderRadius: '12px',
  padding: '10px 28px',
  fontWeight: 700,
  fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontSize: '0.85rem',
  letterSpacing: '0.06em',
  textTransform: 'none',
  background: 'rgba(255,255,255,0.04)',
  color: '#c5cde0',
  border: '1px solid rgba(255,255,255,0.08)',
  transition: 'all 0.25s ease',
  '&:hover': {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    color: '#fff',
  },
})

const WinBanner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  padding: '20px 32px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, rgba(255,200,50,0.08), rgba(255,140,50,0.04))',
  border: '1px solid rgba(255,200,50,0.15)',
  animation: `${fadeSlideIn} 0.5s ease-out`,
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
})

const WinText = styled(Typography)({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 700,
  color: '#ffd866',
  letterSpacing: '0.1em',
  fontSize: '1.3rem',
})

const DrawText = styled(Typography)({
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontWeight: 700,
  color: '#8891a8',
  letterSpacing: '0.1em',
  fontSize: '1.1rem',
})

const TurnIndicator = styled('div')<{ player: 'red' | 'yellow' }>(({ player }) => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  display: 'inline-flex',
  borderRadius: '50%',
  boxShadow:
    player === 'red'
      ? '0 0 0 0 rgba(220,60,40,0.4)'
      : '0 0 0 0 rgba(240,180,40,0.4)',
}))

const DecoLine = styled('div')({
  width: '100%',
  height: '1px',
  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 20%, rgba(212,168,83,0.12) 50%, rgba(255,255,255,0.04) 80%, transparent 100%)',
})

const FloatingKanji = styled('div')({
  position: 'absolute',
  fontFamily: "'Shippori Mincho B1', serif",
  fontSize: '120px',
  fontWeight: 800,
  color: 'rgba(255,255,255,0.012)',
  pointerEvents: 'none',
  userSelect: 'none',
  lineHeight: 1,
})

/* ─── disc styles ─── */
const discStyles = {
  red: {
    background: 'radial-gradient(circle at 35% 30%, #ff9a8b 0%, #dc3c28 40%, #8b1a1a 100%)',
    boxShadow:
      'inset 0 4px 8px rgba(255,180,160,0.3),' +
      'inset 0 -6px 12px rgba(80,10,10,0.5),' +
      '0 4px 16px rgba(220,60,40,0.35),' +
      '0 0 0 1px rgba(255,100,80,0.15)',
  },
  yellow: {
    background: 'radial-gradient(circle at 35% 30%, #fff3c4 0%, #f0b428 40%, #a06b00 100%)',
    boxShadow:
      'inset 0 4px 8px rgba(255,240,180,0.35),' +
      'inset 0 -6px 12px rgba(100,60,0,0.4),' +
      '0 4px 16px rgba(240,180,40,0.3),' +
      '0 0 0 1px rgba(255,200,60,0.15)',
  },
}

const dotStyles = {
  red: {
    background: 'radial-gradient(circle at 35% 30%, #ff8a7a, #dc3c28)',
    boxShadow: '0 0 8px rgba(220,60,40,0.4)',
  },
  yellow: {
    background: 'radial-gradient(circle at 35% 30%, #ffe88a, #f0b428)',
    boxShadow: '0 0 8px rgba(240,180,40,0.4)',
  },
}

const hoverDiscStyles = {
  red: {
    background: 'radial-gradient(circle, rgba(220,60,40,0.5), rgba(220,60,40,0.15))',
    boxShadow: 'inset 0 0 0 2px rgba(220,60,40,0.4)',
  },
  yellow: {
    background: 'radial-gradient(circle, rgba(240,180,40,0.5), rgba(240,180,40,0.15))',
    boxShadow: 'inset 0 0 0 2px rgba(240,180,40,0.4)',
  },
}

/* ─── app ─── */
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
  const columns = useMemo(() => Array.from({ length: COLS }, (_, i) => i), [])
  const hoverPlayer = currentPlayer ?? 'red'

  const isDraw = useMemo(() => {
    if (winner) return false
    return board[0].every((cell) => cell !== null)
  }, [board, winner])
  const isGameOver = Boolean(winner) || isDraw

  const resetGame = useCallback(() => {
    const initialBoard: Player[][] = []
    for (let i = 0; i < ROWS; i++) {
      initialBoard.push(Array(COLS).fill(null))
    }
    setBoard(initialBoard)
    setCurrentPlayer('red')
    setWinner(null)
  }, [])

  const checkWinner = useCallback(
    (board: Player[][], row: number, col: number, player: Player): boolean => {
      let count = 0
      for (let c = Math.max(0, col - 3); c <= Math.min(COLS - 1, col + 3); c++) {
        if (board[row][c] === player) {
          count++
          if (count === 4) return true
        } else {
          count = 0
        }
      }

      count = 0
      for (let r = Math.max(0, row - 3); r <= Math.min(ROWS - 1, row + 3); r++) {
        if (board[r][col] === player) {
          count++
          if (count === 4) return true
        } else {
          count = 0
        }
      }

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
    },
    []
  )

  const handleClick = useCallback(
    (col: number) => {
      if (winner || isDraw) return

      for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
          const newBoard = board.map((r, i) =>
            i === row ? r.map((c, j) => (j === col ? currentPlayer : c)) : r
          )
          setBoard(newBoard)

          if (checkWinner(newBoard, row, col, currentPlayer)) {
            setWinner(currentPlayer)
          } else {
            setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
          }
          break
        }
      }
    },
    [board, currentPlayer, winner, isDraw, checkWinner]
  )

  const isColumnFull = useMemo(() => board[0].map((cell) => cell !== null), [board])

  const moveCount = useMemo(
    () => board.reduce((sum, row) => sum + row.filter((c) => c !== null).length, 0),
    [board]
  )

  return (
    <>
      <GlobalStyles
        styles={{
          '*': { boxSizing: 'border-box', margin: 0, padding: 0 },
          body: { margin: 0, background: '#0a0e1a' },
        }}
      />
      <Page>
        <StyledContainer maxWidth="md">
          <Header>
            <Title variant="h3" gutterBottom style={{ animation: isGameOver ? 'none' : undefined }}>
              玉落とし四目並べ
            </Title>
            <Subtitle variant="body1">
              一手ずつ玉を落とし、先に四つ並べた者が勝つ。静かなる攻防を愉しめ。
            </Subtitle>
          </Header>

          <StatusRow>
            {!winner && !isDraw && currentPlayer && (
              <Pill>
                <TurnIndicator player={currentPlayer}>
                  <Dot style={dotStyles[currentPlayer]} />
                </TurnIndicator>
                <span>{currentPlayer === 'red' ? '赤' : '黄'}の番</span>
              </Pill>
            )}
            <Pill style={{ opacity: 0.6 }}>
              <span style={{ fontSize: '0.8rem' }}>
                {moveCount} 手目
              </span>
            </Pill>
          </StatusRow>

          {winner && (
            <WinBanner>
              <Dot
                style={{
                  ...dotStyles[winner],
                  width: '22px',
                  height: '22px',
                  animation: isGameOver ? 'none' : `${floatUp} 2s ease-in-out infinite`,
                }}
              />
              <WinText>
                {winner === 'red' ? '赤' : '黄'}の勝利
              </WinText>
            </WinBanner>
          )}

          {isDraw && (
            <WinBanner style={{ borderColor: 'rgba(136,145,168,0.15)', background: 'rgba(136,145,168,0.05)' }}>
              <DrawText>引き分け</DrawText>
            </WinBanner>
          )}

          <GameCard>
            <FloatingKanji style={{ top: '-30px', right: '-20px', transform: 'rotate(8deg)' }}>
              勝
            </FloatingKanji>
            <FloatingKanji style={{ bottom: '-20px', left: '-15px', transform: 'rotate(-12deg)', fontSize: '90px' }}>
              連
            </FloatingKanji>

            <BoardShell>
              <BoardContainer
                style={
                  {
                    '--hover-bg': hoverDiscStyles[hoverPlayer].background,
                    '--hover-shadow': hoverDiscStyles[hoverPlayer].boxShadow,
                  } as CSSProperties
                }
              >
                <ColumnButtons
                  columns={columns}
                  currentPlayer={currentPlayer}
                  isColumnFull={isColumnFull}
                  isDraw={isDraw}
                  winner={winner}
                  onDrop={handleClick}
                />
                <BoardGrid board={board} />
              </BoardContainer>
            </BoardShell>

            <DecoLine />

            <FooterRow>
              <Legend>
                <LegendItem>
                  <Dot style={{ ...dotStyles.red, width: '12px', height: '12px' }} /> 赤
                </LegendItem>
                <LegendItem>
                  <Dot style={{ ...dotStyles.yellow, width: '12px', height: '12px' }} /> 黄
                </LegendItem>
              </Legend>
              <ResetButton onClick={resetGame}>もう一局</ResetButton>
            </FooterRow>
          </GameCard>
        </StyledContainer>
      </Page>
    </>
  )
}

export default App

const BoardGrid = memo(function BoardGrid({ board }: { board: Player[][] }) {
  return (
    <>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell key={`${rowIndex}-${colIndex}`}>
            {cell && <Disc style={discStyles[cell]} />}
          </Cell>
        ))
      )}
    </>
  )
})

const ColumnButtons = memo(function ColumnButtons({
  columns,
  currentPlayer,
  isColumnFull,
  isDraw,
  winner,
  onDrop,
}: {
  columns: number[]
  currentPlayer: Player
  isColumnFull: boolean[]
  isDraw: boolean
  winner: Player
  onDrop: (col: number) => void
}) {
  return (
    <>
      {columns.map((col) => (
        <ColumnButton
          key={`drop-${col}`}
          variant="contained"
          onClick={() => onDrop(col)}
          disabled={isColumnFull[col] || Boolean(winner) || isDraw}
          disableElevation
          disableRipple
          aria-label={`列${col + 1}に玉を落とす`}
        >
          <DropIndicator className="drop-indicator" />
        </ColumnButton>
      ))}
    </>
  )
})
