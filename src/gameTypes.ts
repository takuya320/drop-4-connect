import type { Player } from './gameLogic'

export type GameMode = 'local' | 'cpu'

export type Move = {
  id: number
  row: number
  col: number
  player: Exclude<Player, null>
}
