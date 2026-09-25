import { Button } from '@mui/material'
import { styled } from '@mui/system'
import { memo } from 'react'
import type { Player } from '../../gameLogic'

const ColumnButton = styled(Button)({
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  minHeight: 48,
  height: 'var(--control-height)',
  padding: 0,
  touchAction: 'manipulation',
  borderRadius: '14px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  boxShadow: 'none',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  '&:hover .drop-indicator, &:active:not(.Mui-disabled) .drop-indicator': {
    background: 'var(--hover-bg)',
    boxShadow: 'var(--hover-shadow)',
    opacity: 1,
    transform: 'scale(1.08)',
  },
  '&:active:not(.Mui-disabled)': {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(1px)',
  },
  '&.Mui-disabled': {
    opacity: 0.25,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.02)',
  },
})

const DropIndicator = styled('div')({
  width: '86%',
  height: 'auto',
  aspectRatio: '1',
  maxWidth: 'calc(var(--cell-size) * 0.86)',
  maxHeight: 'calc(var(--cell-size) * 0.86)',
  borderRadius: '50%',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255,255,255,0.14)',
  boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.22)',
  opacity: 0.9,
})

type ColumnButtonsProps = {
  columns: number[]
  isColumnFull: boolean[]
  isDraw: boolean
  winner: Player
  disabled: boolean
  onDrop: (col: number) => void
  onColumnHover: (col: number | null) => void
}

export const ColumnButtons = memo(function ColumnButtons({
  columns,
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
          <DropIndicator className="drop-indicator" />
        </ColumnButton>
      ))}
    </>
  )
})
