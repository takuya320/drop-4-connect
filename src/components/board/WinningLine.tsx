import { keyframes, styled } from '@mui/system'
import type { CellPosition } from '../../gameLogic'

const drawLine = keyframes`
  0%   { stroke-dashoffset: 1; opacity: 0; }
  8%   { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
`

// Absolutely positioned grid children take their grid area as the containing
// block without taking part in auto-placement, so the board cells keep their
// slots. The SVG is inset by half a cell, which puts its corners on the
// centres of the first and last winning discs. It keeps a 2px minimum
// thickness because a zero-sized SVG is not rendered at all, which would hide
// horizontal and vertical lines.
const LineSvg = styled('svg')({
  position: 'absolute',
  top: 'calc(var(--cell-size) / 2 - 1px)',
  left: 'calc(var(--cell-size) / 2 - 1px)',
  width: 'calc(100% - var(--cell-size) + 2px)',
  height: 'calc(100% - var(--cell-size) + 2px)',
  overflow: 'visible',
  pointerEvents: 'none',
  zIndex: 2,
  filter:
    'drop-shadow(0 0 6px rgba(255,210,110,0.9)) drop-shadow(0 0 18px rgba(255,170,60,0.55))',
  '& line': {
    strokeLinecap: 'round',
    strokeDasharray: '1 1',
    animation: `${drawLine} 520ms cubic-bezier(0.6, 0, 0.2, 1) 260ms both`,
  },
  '& .line-glow': {
    stroke: 'rgba(255,200,80,0.6)',
    strokeWidth: 'calc(var(--cell-size) * 0.2)',
  },
  '& .line-core': {
    stroke: '#fff4cf',
    strokeWidth: 'calc(var(--cell-size) * 0.07)',
  },
})

function toPercent(value: number, min: number, max: number): string {
  return max === min ? '50%' : `${((value - min) / (max - min)) * 100}%`
}

type WinningLineProps = {
  cells: CellPosition[]
}

export function WinningLine({ cells }: WinningLineProps) {
  if (cells.length < 2) return null

  const first = cells[0]
  const last = cells[cells.length - 1]
  const minRow = Math.min(first.row, last.row)
  const maxRow = Math.max(first.row, last.row)
  const minCol = Math.min(first.col, last.col)
  const maxCol = Math.max(first.col, last.col)
  const endpoints = {
    x1: toPercent(first.col, minCol, maxCol),
    y1: toPercent(first.row, minRow, maxRow),
    x2: toPercent(last.col, minCol, maxCol),
    y2: toPercent(last.row, minRow, maxRow),
  }

  return (
    <LineSvg
      aria-hidden="true"
      data-testid="winning-line"
      style={{
        // Row 1 of the board grid holds the drop buttons.
        gridRow: `${minRow + 2} / ${maxRow + 3}`,
        gridColumn: `${minCol + 1} / ${maxCol + 2}`,
      }}
    >
      <line className="line-glow" pathLength={1} {...endpoints} />
      <line className="line-core" pathLength={1} {...endpoints} />
    </LineSvg>
  )
}
