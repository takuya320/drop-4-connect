import { Button } from '@mui/material'
import { styled } from '@mui/system'
import { memo } from 'react'
import type { Player } from '../../gameLogic'
import { discAppearance, type DiscTone } from './discAppearance'

const ColumnButton = styled(Button)({
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  minHeight: 48,
  height: 'var(--control-height)',
  padding: 0,
  touchAction: 'manipulation',
  borderRadius: 0,
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover, &.Mui-focusVisible': {
    background: 'transparent',
    boxShadow: 'none',
  },
  '&:hover .drop-indicator, &.Mui-focusVisible .drop-indicator': {
    opacity: 1,
    filter: 'brightness(1.04)',
    transform: 'translateY(-3px) scale(1.05)',
  },
  '&:active:not(.Mui-disabled)': {
    background: 'transparent',
  },
  '&:active:not(.Mui-disabled) .drop-indicator': {
    opacity: 1,
    filter: 'brightness(0.96)',
    transform: 'translateY(1px) scale(0.96)',
  },
  '&.Mui-focusVisible .drop-indicator': {
    outline: '2px solid rgba(245, 226, 200, 0.8)',
    outlineOffset: '4px',
  },
  '&.Mui-disabled': {
    opacity: 1,
    background: 'transparent',
    border: 'none',
  },
  '&.Mui-disabled .drop-indicator': {
    opacity: 0.22,
    filter: 'saturate(0.55) brightness(0.72)',
    transform: 'scale(0.86)',
  },
})

const DropIndicator = styled('div')({
  width: 'calc(var(--cell-size) * 0.79)',
  height: 'calc(var(--cell-size) * 0.79)',
  borderRadius: '50%',
  position: 'relative',
  flexShrink: 0,
  opacity: 0.62,
  transform: 'scale(0.9)',
  filter: 'brightness(0.88) saturate(0.92)',
  transition:
    'opacity 180ms cubic-bezier(0.4, 0, 0.2, 1), transform 180ms cubic-bezier(0.4, 0, 0.2, 1), filter 180ms ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '14%',
    left: '20%',
    width: '32%',
    height: '18%',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.35)',
    filter: 'blur(1.5px)',
    pointerEvents: 'none',
  },
})

type ColumnButtonsProps = {
  columns: number[]
  currentPlayer: DiscTone
  isColumnFull: boolean[]
  isDraw: boolean
  winner: Player
  disabled: boolean
  onDrop: (col: number) => void
  onColumnHover: (col: number | null) => void
}

export const ColumnButtons = memo(function ColumnButtons({
  columns,
  currentPlayer,
  isColumnFull,
  isDraw,
  winner,
  disabled,
  onDrop,
  onColumnHover,
}: ColumnButtonsProps) {
  return (
    <>
      {columns.map((col) => (
        <ColumnButton
          key={`drop-${col}`}
          variant="contained"
          onClick={() => onDrop(col)}
          onMouseEnter={() => onColumnHover(col)}
          onMouseLeave={() => onColumnHover(null)}
          onFocus={() => onColumnHover(col)}
          onBlur={() => onColumnHover(null)}
          disabled={disabled || isColumnFull[col] || Boolean(winner) || isDraw}
          disableElevation
          disableRipple
          aria-label={`列${col + 1}に玉を落とす`}
        >
          <DropIndicator
            className="drop-indicator"
            data-testid="drop-indicator"
            data-player={currentPlayer}
            style={discAppearance[currentPlayer]}
          />
        </ColumnButton>
      ))}
    </>
  )
})
