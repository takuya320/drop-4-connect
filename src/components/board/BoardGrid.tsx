import { keyframes, styled } from '@mui/system'
import { memo } from 'react'
import type { CSSProperties } from 'react'
import type { Player } from '../../gameLogic'
import type { Move } from '../../gameTypes'
import { discAppearance, type DiscAppearance } from './discAppearance'

const discDrop = keyframes`
  0% {
    transform: translate3d(0, var(--drop-offset), 0) scale(0.96);
    filter: brightness(0.92);
    animation-timing-function: cubic-bezier(0.55, 0.05, 0.82, 0.34);
  }
  72% {
    transform: translate3d(0, 0, 0) scaleX(1.04) scaleY(0.96);
    filter: brightness(1.12) drop-shadow(0 0 7px var(--disc-glow));
    animation-timing-function: cubic-bezier(0.2, 0.75, 0.3, 1);
  }
  86% {
    transform: translate3d(0, -5%, 0) scaleX(0.99) scaleY(1.01);
    filter: brightness(1.05) drop-shadow(0 0 4px var(--disc-glow));
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    filter: none;
  }
`

const winningDiscPop = keyframes`
  0% { transform: scale(1); filter: brightness(1); }
  40% {
    transform: scale(1.22);
    filter: brightness(1.4) drop-shadow(0 0 16px rgba(255,210,110,0.95));
  }
  100% {
    transform: scale(1.06);
    filter: brightness(1.12) drop-shadow(0 0 8px var(--disc-glow));
  }
`

const winningDiscPulse = keyframes`
  0%, 100% {
    transform: scale(1.06);
    filter: brightness(1.12) drop-shadow(0 0 8px var(--disc-glow));
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.25) drop-shadow(0 0 16px rgba(255,210,110,0.8));
  }
`

const winningRingIn = keyframes`
  from { opacity: 0; transform: scale(1.7); }
  to   { opacity: 1; transform: scale(1); }
`

const Cell = styled('div')<{ interactive?: boolean }>(({ interactive }) => ({
  width: '100%',
  height: '100%',
  minWidth: 0,
  aspectRatio: '1',
  cursor: interactive ? 'pointer' : 'default',
  touchAction: 'manipulation',
  borderRadius: '50%',
  background:
    'radial-gradient(circle at 40% 35%, #0e1428 0%, #080c1a 60%, #050811 100%)',
  boxShadow:
    'inset 0 4px 8px rgba(255,255,255,0.03),' +
    'inset 0 -6px 16px rgba(0,0,0,0.6),' +
    'inset 0 0 0 2px rgba(255,255,255,0.02)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
}))

const Disc = styled('div')({
  width: '78.79%',
  height: '78.79%',
  borderRadius: '50%',
  position: 'relative',
  willChange: 'transform, filter',
  transition: 'filter 300ms ease, opacity 300ms ease',
  '&.is-dropping': {
    animation: `${discDrop} 380ms both`,
  },
  // --win-order staggers the pop along the line, from one end to the other.
  '&.is-winning': {
    zIndex: 1,
    animation:
      `${winningDiscPop} 560ms cubic-bezier(0.2, 0.9, 0.3, 1.3) calc(var(--win-order, 0) * 90ms) both, ` +
      `${winningDiscPulse} 1800ms ease-in-out calc(var(--win-order, 0) * 90ms + 560ms) infinite`,
  },
  '&.is-winning::after': {
    content: '""',
    position: 'absolute',
    inset: '-10%',
    borderRadius: '50%',
    border: '2px solid rgba(255,222,140,0.95)',
    boxShadow:
      '0 0 14px rgba(255,200,80,0.75), inset 0 0 10px rgba(255,200,80,0.45)',
    pointerEvents: 'none',
    animation: `${winningRingIn} 600ms ease-out calc(var(--win-order, 0) * 90ms) both`,
  },
  '&.is-dimmed': {
    opacity: 0.45,
    filter: 'brightness(0.62) saturate(0.7)',
    transition: 'filter 600ms ease, opacity 600ms ease',
  },
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

const PreviewDisc = styled('div')({
  width: '78.79%',
  height: '78.79%',
  borderRadius: '50%',
  opacity: 0.45,
  pointerEvents: 'none',
})

type CustomCssProperties = CSSProperties & {
  [key: `--${string}`]: string | number | undefined
}

type DiscStyle = DiscAppearance &
  CustomCssProperties & {
    '--drop-offset'?: string
  }

function getDropOffset(row: number): string {
  const rowHeight = '(var(--cell-size) + var(--board-gap))'
  return `calc(0px - ${Array.from(
    { length: row + 1 },
    () => rowHeight
  ).join(' - ')})`
}

type BoardGridProps = {
  board: Player[][]
  previewColumn: number | null
  previewRow: number
  previewPlayer: Player
  lastMove: Move | null
  isAnimating: boolean
  /** Winning cell key (`row-col`) mapped to its position along the line. */
  winningCellOrder: Map<string, number>
  showWinEmphasis: boolean
  onDropAnimationEnd: () => void
  onDrop: (col: number) => void
  isDropEnabled: boolean
  isColumnFull: boolean[]
}

export const BoardGrid = memo(function BoardGrid({
  board,
  previewColumn,
  previewRow,
  previewPlayer,
  lastMove,
  isAnimating,
  winningCellOrder,
  showWinEmphasis,
  onDropAnimationEnd,
  onDrop,
  isDropEnabled,
  isColumnFull,
}: BoardGridProps) {
  return (
    <>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const winOrder = showWinEmphasis
            ? winningCellOrder.get(`${rowIndex}-${colIndex}`)
            : undefined
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              data-testid={`cell-${rowIndex}-${colIndex}`}
              interactive={isDropEnabled && !isColumnFull[colIndex]}
              onClick={() => {
                if (!isDropEnabled || isColumnFull[colIndex]) return
                onDrop(colIndex)
              }}
            >
              {cell && (
                <Disc
                  role="img"
                  aria-label={`${rowIndex + 1}行${colIndex + 1}列 ${cell === 'red' ? '赤' : '黄'}の玉`}
                  data-testid={`disc-${rowIndex}-${colIndex}`}
                  className={[
                    isAnimating &&
                    lastMove?.row === rowIndex &&
                    lastMove.col === colIndex
                      ? 'is-dropping'
                      : '',
                    winOrder !== undefined ? 'is-winning' : '',
                    showWinEmphasis && winOrder === undefined
                      ? 'is-dimmed'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    {
                      ...discAppearance[cell],
                      '--drop-offset': getDropOffset(rowIndex),
                      '--win-order': winOrder,
                    } as DiscStyle
                  }
                  onAnimationEnd={
                    isAnimating &&
                    lastMove?.row === rowIndex &&
                    lastMove.col === colIndex
                      ? onDropAnimationEnd
                      : undefined
                  }
                />
              )}
              {!cell &&
                previewPlayer &&
                rowIndex === previewRow &&
                colIndex === previewColumn && (
                  <PreviewDisc
                    role="img"
                    aria-label={`${previewPlayer === 'red' ? '赤' : '黄'}の玉の落下位置`}
                    style={discAppearance[previewPlayer]}
                  />
                )}
            </Cell>
          )
        })
      )}
    </>
  )
})
