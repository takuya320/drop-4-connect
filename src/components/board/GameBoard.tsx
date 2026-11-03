import { keyframes, styled } from '@mui/system'
import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { COLS, ROWS, type CellPosition, type Player } from '../../gameLogic'
import type { Move } from '../../gameTypes'
import { BoardGrid } from './BoardGrid'
import { ColumnButtons } from './ColumnButtons'
import { VictoryOverlay, type Celebration } from './VictoryOverlay'
import { WinningLine } from './WinningLine'

// Lands together with the seal in VictoryOverlay.
const boardImpact = keyframes`
  0%   { transform: translate3d(0, 0, 0); }
  15%  { transform: translate3d(0, 6px, 0) scale(0.995); }
  35%  { transform: translate3d(-4px, -3px, 0); }
  55%  { transform: translate3d(3px, 2px, 0); }
  75%  { transform: translate3d(-1px, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
`

const BoardShell = styled('div')({
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  containerType: 'inline-size',
  padding: 'clamp(8px, 2.6vw, 20px)',
  '@media (max-width: 700px)': {
    padding: '8px',
  },
  '@media (min-width: 960px)': {
    width: '100%',
    height: '100%',
    containerType: 'size',
    padding: 'clamp(12px, 2vh, 24px)',
  },
  borderRadius: '20px',
  background:
    'linear-gradient(170deg, #162044 0%, #0d1530 50%, #0a0f22 100%)',
  boxShadow:
    'inset 0 2px 0 rgba(255,255,255,0.04),' +
    'inset 0 -8px 24px rgba(0,0,0,0.4),' +
    '0 8px 32px rgba(0,0,0,0.3)',
  display: 'grid',
  placeItems: 'center',
  position: 'relative',
  border: '1px solid rgba(255,255,255,0.03)',
  '&.is-celebrating': {
    animation: `${boardImpact} 420ms ease-out 900ms both`,
  },
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
  '--board-gap': 'clamp(4px, 1.6cqi, 8px)',
  '--cell-size': 'min(66px, calc((100cqi - (6 * var(--board-gap))) / 7))',
  '--control-height': 'clamp(48px, calc(var(--cell-size) + 16px), 64px)',
  width: 'min(100%, calc((7 * var(--cell-size)) + (6 * var(--board-gap))))',
  maxWidth: '100%',
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
  gridTemplateRows: `var(--control-height) repeat(${ROWS}, var(--cell-size))`,
  gap: 'var(--board-gap)',
  position: 'relative',
  zIndex: 1,
  '@media (min-width: 960px)': {
    '--board-gap': 'clamp(6px, 1.1cqmin, 14px)',
    '--cell-size':
      'min(128px, calc((100cqi - (6 * var(--board-gap))) / 7), calc((100cqb - (6 * var(--board-gap))) / 6.72))',
    '--control-height': 'calc(var(--cell-size) * 0.72)',
    width: 'calc((7 * var(--cell-size)) + (6 * var(--board-gap)))',
    height: 'calc(var(--control-height) + (6 * var(--cell-size)) + (6 * var(--board-gap)))',
    maxWidth: '100%',
    maxHeight: '100%',
  },
})

type GameBoardProps = {
  board: Player[][]
  /** Present once the winning disc has landed. */
  celebration: Celebration | null
  columns: number[]
  currentPlayer: Exclude<Player, null>
  finishDropAnimation: () => void
  handleClick: (column: number) => void
  hoveredColumn: number | null
  isAnimating: boolean
  isBoardLocked: boolean
  isColumnFull: boolean[]
  isDraw: boolean
  lastMove: Move | null
  previewRow: number
  setHoveredColumn: Dispatch<SetStateAction<number | null>>
  showWinEmphasis: boolean
  winner: Player
  winningCells: CellPosition[]
}

export function GameBoard({
  board,
  celebration,
  columns,
  currentPlayer,
  finishDropAnimation,
  handleClick,
  hoveredColumn,
  isAnimating,
  isBoardLocked,
  isColumnFull,
  isDraw,
  lastMove,
  previewRow,
  setHoveredColumn,
  showWinEmphasis,
  winner,
  winningCells,
}: GameBoardProps) {
  const winningCellOrder = useMemo(
    () =>
      new Map(
        winningCells.map(({ row, col }, index) => [`${row}-${col}`, index])
      ),
    [winningCells]
  )

  return (
    <BoardShell className={celebration ? 'is-celebrating' : undefined}>
      <BoardContainer>
        <ColumnButtons
          columns={columns}
          currentPlayer={currentPlayer}
          isColumnFull={isColumnFull}
          isDraw={isDraw}
          winner={winner}
          locked={isBoardLocked}
          onDrop={handleClick}
          onColumnHover={setHoveredColumn}
        />
        <BoardGrid
          board={board}
          previewColumn={hoveredColumn}
          previewRow={previewRow}
          previewPlayer={isBoardLocked ? null : currentPlayer}
          lastMove={lastMove}
          isAnimating={isAnimating}
          winningCellOrder={winningCellOrder}
          showWinEmphasis={showWinEmphasis}
          onDropAnimationEnd={finishDropAnimation}
          onDrop={handleClick}
          isDropEnabled={!isBoardLocked && !winner && !isDraw}
          isColumnFull={isColumnFull}
        />
        {showWinEmphasis && <WinningLine cells={winningCells} />}
      </BoardContainer>
      {celebration && (
        <VictoryOverlay key={celebration.seed} celebration={celebration} />
      )}
    </BoardShell>
  )
}
