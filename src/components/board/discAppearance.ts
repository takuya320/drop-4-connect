import type { CSSProperties } from 'react'
import type { Player } from '../../gameLogic'

export type DiscTone = Exclude<Player, null>

export type DiscAppearance = CSSProperties & {
  '--disc-glow': string
}

export const discAppearance: Record<DiscTone, DiscAppearance> = {
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
