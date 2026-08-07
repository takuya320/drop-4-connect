import { Button } from '@mui/material'
import { styled } from '@mui/system'
import { memo } from 'react'
import type { Player } from '../../gameLogic'

const ColumnButton = styled(Button)({
  minWidth: 'var(--cell-size)',
  width: 'var(--cell-size)',
  height: 'var(--control-height)',
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
  width: 'clamp(20px, 4.5vw, 28px)',
  height: 'clamp(20px, 4.5vw, 28px)',
  borderRadius: '50%',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
  opacity: 0.5,
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
