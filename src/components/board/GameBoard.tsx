import { styled } from '@mui/system'
import type { CSSProperties, Dispatch, SetStateAction } from 'react'
import { COLS, ROWS, type Player } from '../../gameLogic'
import type { Move } from '../../gameTypes'
import { BoardGrid } from './BoardGrid'
import { ColumnButtons } from './ColumnButtons'

const BoardShell = styled('div')({
  padding: 'clamp(9px, 2.6vw, 20px)',
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
  '--cell-size': 'clamp(38px, 10.2vw, 66px)',
  '--board-gap': 'clamp(3px, 1.25vw, 8px)',
  '--control-height': 'clamp(34px, 8vw, 48px)',
  display: 'grid',
  gridTemplateColumns: `repeat(${COLS}, var(--cell-size))`,
  gridTemplateRows: `var(--control-height) repeat(${ROWS}, var(--cell-size))`,
  gap: 'var(--board-gap)',
  position: 'relative',
  zIndex: 1,
})

const hoverDiscStyles = {
  red: {
    background:
      'radial-gradient(circle, rgba(220,60,40,0.5), rgba(220,60,40,0.15))',
    boxShadow: 'inset 0 0 0 2px rgba(220,60,40,0.4)',
  },
  yellow: {
    background:
      'radial-gradient(circle, rgba(240,180,40,0.5), rgba(240,180,40,0.15))',
    boxShadow: 'inset 0 0 0 2px rgba(240,180,40,0.4)',
  },
}

type BoardCssProperties = CSSProperties & {
  '--hover-bg': string
  '--hover-shadow': string
}

type GameBoardProps = {
  board: Player[][]
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
  winningCellKeys: Set<string>
}

export function GameBoard({
  board,
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
  winningCellKeys,
}: GameBoardProps) {
  return (
    <BoardShell>
      <BoardContainer
        style={
          {
            '--hover-bg': hoverDiscStyles[currentPlayer].background,
            '--hover-shadow': hoverDiscStyles[currentPlayer].boxShadow,
          } as BoardCssProperties
        }
      >
        <ColumnButtons
          columns={columns}
          isColumnFull={isColumnFull}
          isDraw={isDraw}
          winner={winner}
          disabled={isBoardLocked}
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
          winningCellKeys={winningCellKeys}
          showWinEmphasis={showWinEmphasis}
          onDropAnimationEnd={finishDropAnimation}
        />
      </BoardContainer>
    </BoardShell>
  )
}
