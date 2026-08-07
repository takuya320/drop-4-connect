import { chooseCpuMove, type CpuDifficulty } from './cpuLogic'
import type { Player } from './gameLogic'

export interface CpuWorkerRequest {
  board: Player[][]
  difficulty: CpuDifficulty
}

export interface CpuWorkerResponse {
  column: number
}

self.onmessage = (event: MessageEvent<CpuWorkerRequest>) => {
  const column = chooseCpuMove(event.data.board, event.data.difficulty, 'yellow')
  const response: CpuWorkerResponse = { column }
  self.postMessage(response)
}

export {}
