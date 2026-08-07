import { keyframes, styled } from '@mui/system'
import { useEffect, useRef, useState } from 'react'
import type { Player } from '../gameLogic'

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,53,0.4); }
  50%      { box-shadow: 0 0 0 12px rgba(255,107,53,0); }
`

const TurnContent = styled('div')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  transition:
    'opacity 90ms ease, transform 90ms ease, color 180ms ease, filter 180ms ease',
  '&[data-phase="out"]': {
    opacity: 0,
    transform: 'translateY(-6px)',
  },
  '&[data-phase="in"]': {
    opacity: 0,
    transform: 'translateY(6px)',
  },
})

const Dot = styled('span')({
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0,
})

const TurnIndicator = styled('div')<{ player: Exclude<Player, null> }>(
  ({ player }) => ({
    animation: `${pulse} 2s ease-in-out infinite`,
    display: 'inline-flex',
    borderRadius: '50%',
    boxShadow:
      player === 'red'
        ? '0 0 0 0 rgba(220,60,40,0.4)'
        : '0 0 0 0 rgba(240,180,40,0.4)',
  })
)

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

type PlayerDotProps = {
  player: Exclude<Player, null>
  size: number
}

export function PlayerDot({ player, size }: PlayerDotProps) {
  return (
    <Dot
      style={{
        ...dotStyles[player],
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  )
}

type AnimatedTurnStatusProps = {
  player: Exclude<Player, null>
  label?: string
}

export function AnimatedTurnStatus({
  player,
  label,
}: AnimatedTurnStatusProps) {
  const [displayedPlayer, setDisplayedPlayer] = useState(player)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const displayedPlayerRef = useRef(displayedPlayer)

  useEffect(() => {
    if (player === displayedPlayerRef.current) return
    setPhase('out')
    let settleTimer: number | undefined
    const swapTimer = window.setTimeout(() => {
      displayedPlayerRef.current = player
      setDisplayedPlayer(player)
      setPhase('in')
      settleTimer = window.setTimeout(() => setPhase('idle'), 100)
    }, 90)
    return () => {
      window.clearTimeout(swapTimer)
      if (settleTimer !== undefined) window.clearTimeout(settleTimer)
    }
  }, [player])

  return (
    <TurnContent data-phase={phase}>
      <TurnIndicator player={displayedPlayer}>
        <PlayerDot player={displayedPlayer} size={16} />
      </TurnIndicator>
      <span>{label ?? `${displayedPlayer === 'red' ? '赤' : '黄'}の番`}</span>
    </TurnContent>
  )
}
