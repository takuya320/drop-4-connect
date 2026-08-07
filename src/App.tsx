import { Button, Container, GlobalStyles, Typography } from '@mui/material'
import { styled, keyframes } from '@mui/system'
import { useMemo, useState, useCallback, useEffect, memo } from 'react'
import type { CSSProperties } from 'react'
import {
  type Player,
  ROWS,
  COLS,
  createEmptyBoard,
  checkWinner,
  findWinningCells,
  dropDisc,
  findDropRow,
  isDraw as checkDraw,
  isColumnFull,
  countMoves,
} from './gameLogic'

const DROP_ANIMATION_MS = 350

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

const victoryReveal = keyframes`
  0%   { opacity: 0; transform: scale(0.35) rotate(-12deg); }
  65%  { opacity: 1; transform: scale(1.1) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
`

const auraBurst = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
  35%  { opacity: 0.9; }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
`

const raySpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`

const confettiFall = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, -12vh, 0) rotate(0deg);
  }
  12% { opacity: 1; }
  100% {
    opacity: 0;
    transform: translate3d(var(--drift), 108vh, 0) rotate(var(--rotation));
  }
`

const winningDisc = keyframes`
  0%, 100% { transform: scale(1); filter: brightness(1.15); }
  50% { transform: scale(1.13); filter: brightness(1.45); }
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
  cursor: 'pointer',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  boxShadow: 'none',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:not(.Mui-disabled):hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  '&:not(.Mui-disabled):hover .drop-indicator': {
    background: 'var(--hover-bg)',
    boxShadow: 'var(--hover-shadow)',
    opacity: 1,
    transform: 'scale(1.1)',
  },
  '&.Mui-disabled': {
    cursor: 'default',
    opacity: 0.25,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.02)',
    transform: 'none',
    boxShadow: 'none',
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
  '&[data-winning="true"]': {
    animation: `${winningDisc} 0.8s ease-in-out infinite`,
    zIndex: 2,
    outline: '3px solid rgba(255, 232, 138, 0.9)',
    outlineOffset: '3px',
  },
})

const PreviewDisc = styled('div')({
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  opacity: 0.45,
  pointerEvents: 'none',
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
  animation: `${victoryReveal} 0.75s cubic-bezier(0.2, 1.4, 0.4, 1)`,
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  boxShadow: '0 0 45px rgba(255,190,40,0.12), inset 0 0 28px rgba(255,220,100,0.04)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.18) 45%, transparent 65%)',
    backgroundSize: '250% 100%',
    animation: `${shimmer} 2.2s ease-in-out infinite`,
    pointerEvents: 'none',
  },
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

const VictoryLayer = styled('div')({
  position: 'fixed',
  inset: 0,
  zIndex: 10,
  overflow: 'hidden',
  pointerEvents: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at 50% 42%, rgba(255,193,57,0.2), transparent 36%), rgba(4,6,14,0.16)',
    animation: `${fadeSlideIn} 0.6s ease-out both`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&, & *': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
    },
  },
})

const VictoryRays = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '42%',
  width: 'min(92vw, 760px)',
  aspectRatio: '1',
  borderRadius: '50%',
  opacity: 0.22,
  background:
    'repeating-conic-gradient(from 0deg, rgba(255,220,120,0.65) 0deg 5deg, transparent 5deg 14deg)',
  maskImage: 'radial-gradient(circle, transparent 0 17%, #000 30% 68%, transparent 76%)',
  animation: `${raySpin} 24s linear infinite`,
})

const VictoryAura = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '42%',
  width: 'min(80vw, 580px)',
  aspectRatio: '1',
  borderRadius: '50%',
  border: '2px solid rgba(255,218,115,0.75)',
  boxShadow: '0 0 70px rgba(255,185,45,0.35), inset 0 0 70px rgba(255,185,45,0.16)',
  animation: `${auraBurst} 2.2s ease-out infinite`,
})

const VictoryCrest = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '42%',
  width: 'clamp(106px, 16vw, 156px)',
  aspectRatio: '1',
  transform: 'translate(-50%, -50%)',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  color: '#fff2bd',
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  fontSize: 'clamp(3.8rem, 9vw, 6.5rem)',
  fontWeight: 800,
  lineHeight: 1,
  background:
    'radial-gradient(circle at 38% 30%, rgba(255,244,194,0.22), rgba(118,67,15,0.76) 58%, rgba(24,15,12,0.92))',
  border: '2px solid rgba(255,222,126,0.82)',
  boxShadow:
    '0 0 0 7px rgba(255,207,86,0.08), 0 0 65px rgba(255,182,39,0.5), inset 0 0 28px rgba(255,224,139,0.22)',
  textShadow: '0 3px 0 #8d5314, 0 0 22px rgba(255,231,148,0.75)',
  animation: `${victoryReveal} 0.9s 0.1s cubic-bezier(0.2, 1.5, 0.4, 1) both`,
})

const Confetti = styled('i')({
  position: 'absolute',
  top: '-6vh',
  width: '9px',
  height: '20px',
  borderRadius: '2px',
  animation: `${confettiFall} var(--duration) var(--delay) cubic-bezier(0.2, 0.7, 0.35, 1) infinite`,
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

const confettiPieces = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 37 + 7) % 100}%`,
  delay: `${((index * 13) % 24) / 10}s`,
  duration: `${3.4 + ((index * 7) % 18) / 10}s`,
  drift: `${((index * 29) % 160) - 80}px`,
  rotation: `${540 + ((index * 47) % 720)}deg`,
  color: ['#ffd866', '#fff0b3', '#d84a35', '#f2a72f', '#c995ff'][index % 5],
}))

/* ─── app ─── */
function App() {
  const [board, setBoard] = useState<Player[][]>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [winner, setWinner] = useState<Player>(null)
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const columns = useMemo(() => Array.from({ length: COLS }, (_, i) => i), [])
  const hoverPlayer = currentPlayer ?? 'red'

  const isDraw = useMemo(() => checkDraw(board, winner), [board, winner])
  const isGameOver = Boolean(winner) || isDraw
  const winningCellKeys = useMemo(() => {
    if (!winner) return new Set<string>()
    return new Set(findWinningCells(board, winner).map(([row, col]) => `${row}-${col}`))
  }, [board, winner])
  const isGameInputEnabled = !isGameOver && !isAnimating
  const canDrop = useCallback(
    (col: number) => isGameInputEnabled && !isColumnFull(board, col),
    [board, isGameInputEnabled]
  )
  const droppableColumns = useMemo(
    () => columns.map((col) => canDrop(col)),
    [canDrop, columns]
  )
  const previewRow = useMemo(
    () =>
      hoveredColumn === null || !canDrop(hoveredColumn)
        ? -1
        : findDropRow(board, hoveredColumn),
    [board, canDrop, hoveredColumn]
  )

  useEffect(() => {
    if (!isAnimating) return

    const timer = window.setTimeout(() => {
      setIsAnimating(false)
    }, DROP_ANIMATION_MS)

    return () => window.clearTimeout(timer)
  }, [isAnimating])

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setHoveredColumn(null)
    setIsAnimating(false)
  }, [])

  const handleClick = useCallback(
    (col: number) => {
      if (!canDrop(col)) return

      const result = dropDisc(board, col, currentPlayer)
      if (!result) return

      const { newBoard, row } = result
      setBoard(newBoard)
      setIsAnimating(true)

      if (checkWinner(newBoard, row, col, currentPlayer)) {
        setWinner(currentPlayer)
      } else {
        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
      }
    },
    [board, canDrop, currentPlayer]
  )

  const moveCount = useMemo(() => countMoves(board), [board])

  return (
    <>
      <GlobalStyles
        styles={{
          '*': { boxSizing: 'border-box', margin: 0, padding: 0 },
          body: { margin: 0, background: '#0a0e1a' },
        }}
      />
      <Page>
        {winner && <VictoryCelebration />}
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
                  droppableColumns={droppableColumns}
                  onDrop={handleClick}
                  onColumnHover={setHoveredColumn}
                />
                <BoardGrid
                  board={board}
                  previewColumn={hoveredColumn}
                  previewRow={previewRow}
                  previewPlayer={currentPlayer}
                  winningCellKeys={winningCellKeys}
                />
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

function VictoryCelebration() {
  return (
    <VictoryLayer aria-hidden="true">
      <VictoryRays />
      <VictoryAura />
      <VictoryCrest>勝</VictoryCrest>
      {confettiPieces.map((piece, index) => (
        <Confetti
          key={index}
          style={
            {
              left: piece.left,
              background: piece.color,
              '--delay': piece.delay,
              '--duration': piece.duration,
              '--drift': piece.drift,
              '--rotation': piece.rotation,
            } as CSSProperties
          }
        />
      ))}
    </VictoryLayer>
  )
}

const BoardGrid = memo(function BoardGrid({
  board,
  winningCellKeys,
  previewColumn,
  previewRow,
  previewPlayer,
}: {
  board: Player[][]
  winningCellKeys: ReadonlySet<string>
  previewColumn: number | null
  previewRow: number
  previewPlayer: Player
}) {
  return (
    <>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell key={`${rowIndex}-${colIndex}`}>
            {cell && (
              <Disc
                style={discStyles[cell]}
                data-winning={winningCellKeys.has(`${rowIndex}-${colIndex}`)}
              />
            )}
            {!cell &&
              previewPlayer &&
              rowIndex === previewRow &&
              colIndex === previewColumn && (
                <PreviewDisc
                  role="img"
                  aria-label={`${previewPlayer === 'red' ? '赤' : '黄'}の玉の落下位置`}
                  style={discStyles[previewPlayer]}
                />
              )}
          </Cell>
        ))
      )}
    </>
  )
})

const ColumnButtons = memo(function ColumnButtons({
  columns,
  droppableColumns,
  onDrop,
  onColumnHover,
}: {
  columns: number[]
  droppableColumns: boolean[]
  onDrop: (col: number) => void
  onColumnHover: (col: number | null) => void
}) {
  return (
    <>
      {columns.map((col) => (
        <ColumnButton
          key={`drop-${col}`}
          variant="contained"
          onClick={() => {
            if (droppableColumns[col]) onDrop(col)
          }}
          onMouseEnter={() => {
            if (droppableColumns[col]) onColumnHover(col)
          }}
          onMouseLeave={() => onColumnHover(null)}
          onFocus={() => {
            if (droppableColumns[col]) onColumnHover(col)
          }}
          onBlur={() => onColumnHover(null)}
          disabled={!droppableColumns[col]}
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
