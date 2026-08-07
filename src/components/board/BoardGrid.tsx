import { keyframes, styled } from '@mui/system'
import { memo } from 'react'
import type { CSSProperties } from 'react'
import type { Player } from '../../gameLogic'
import type { Move } from '../../gameTypes'

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

const winningDiscPulse = keyframes`
  0%, 100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 3px var(--disc-glow)); }
  50% { transform: scale(1.035); filter: brightness(1.12) drop-shadow(0 0 9px var(--disc-glow)); }
`

const Cell = styled('div')({
  width: 'var(--cell-size)',
  height: 'var(--cell-size)',
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
})

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
  '&.is-winning': {
    animation: `${winningDiscPulse} 900ms ease-in-out 2`,
  },
  '&.is-dimmed': {
    opacity: 0.72,
    filter: 'brightness(0.82)',
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

type DiscStyle = CustomCssProperties & {
  '--disc-glow': string
  '--drop-offset'?: string
}

const discStyles: Record<Exclude<Player, null>, DiscStyle> = {
  red: {
    '--disc-glow': 'rgba(220,60,40,0.55)',
    background:
      'radial-gradient(circle at 35% 30%, #ff9a8b 0%, #dc3c28 40%, #8b1a1a 100%)',
    boxShadow:
      'inset 0 4px 8px rgba(255,180,160,0.3),' +
      'inset 0 -6px 12px rgba(80,10,10,0.5),' +
      '0 4px 16px rgba(220,60,40,0.35),' +
      '0 0 0 1px rgba(255,100,80,0.15)',
  },
  yellow: {
    '--disc-glow': 'rgba(240,180,40,0.5)',
    background:
      'radial-gradient(circle at 35% 30%, #fff3c4 0%, #f0b428 40%, #a06b00 100%)',
    boxShadow:
      'inset 0 4px 8px rgba(255,240,180,0.35),' +
      'inset 0 -6px 12px rgba(100,60,0,0.4),' +
      '0 4px 16px rgba(240,180,40,0.3),' +
      '0 0 0 1px rgba(255,200,60,0.15)',
  },
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
  winningCellKeys: Set<string>
  showWinEmphasis: boolean
  onDropAnimationEnd: () => void
}

export const BoardGrid = memo(function BoardGrid({
  board,
  previewColumn,
  previewRow,
  previewPlayer,
  lastMove,
  isAnimating,
  winningCellKeys,
  showWinEmphasis,
  onDropAnimationEnd,
}: BoardGridProps) {
  return (
    <>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell key={`${rowIndex}-${colIndex}`}>
            {cell && (
              <Disc
                data-testid={`disc-${rowIndex}-${colIndex}`}
                className={[
                  isAnimating &&
                  lastMove?.row === rowIndex &&
                  lastMove.col === colIndex
                    ? 'is-dropping'
                    : '',
                  showWinEmphasis &&
                  winningCellKeys.has(`${rowIndex}-${colIndex}`)
                    ? 'is-winning'
                    : '',
                  showWinEmphasis &&
                  !winningCellKeys.has(`${rowIndex}-${colIndex}`)
                    ? 'is-dimmed'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    ...discStyles[cell],
                    '--drop-offset': getDropOffset(rowIndex),
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
                  style={discStyles[previewPlayer]}
                />
              )}
          </Cell>
        ))
      )}
    </>
  )
})
