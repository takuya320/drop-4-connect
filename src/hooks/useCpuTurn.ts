import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { getAvailableMoves, type CpuDifficulty } from '../cpuLogic'
import type { CpuWorkerRequest, CpuWorkerResponse } from '../cpuWorker'
import type { Player } from '../gameLogic'

type UseCpuTurnOptions = {
  board: Player[][]
  difficulty: CpuDifficulty
  enabled: boolean
  onMove: (column: number) => void
  setHoveredColumn: Dispatch<SetStateAction<number | null>>
  setIsThinking: Dispatch<SetStateAction<boolean>>
}

export function useCpuTurn({
  board,
  difficulty,
  enabled,
  onMove,
  setHoveredColumn,
  setIsThinking,
}: UseCpuTurnOptions): void {
  useEffect(() => {
    if (!enabled) {
      setIsThinking(false)
      return
    }

    let cancelled = false
    let moveScheduled = false
    let moveTimer: ReturnType<typeof setTimeout> | undefined
    const startedAt = performance.now()
    let worker: Worker | null = null
    const fallbackColumn = getAvailableMoves(board)[0] ?? -1

    setHoveredColumn(null)
    setIsThinking(true)

    const scheduleMove = (column: number) => {
      if (cancelled || moveScheduled) return
      moveScheduled = true
      const remainingDelay = Math.max(0, 400 - (performance.now() - startedAt))
      moveTimer = setTimeout(() => {
        if (cancelled) return
        setIsThinking(false)
        onMove(column)
        worker?.terminate()
      }, remainingDelay)
    }

    try {
      worker = new Worker(new URL('../cpuWorker.ts', import.meta.url))
      worker.onmessage = (event: MessageEvent<CpuWorkerResponse>) => {
        scheduleMove(event.data.column)
      }
      worker.onerror = () => {
        worker?.terminate()
        worker = null
        scheduleMove(fallbackColumn)
      }

      const request: CpuWorkerRequest = { board, difficulty }
      worker.postMessage(request)
    } catch {
      worker?.terminate()
      worker = null
      scheduleMove(fallbackColumn)
    }

    return () => {
      cancelled = true
      worker?.terminate()
      if (moveTimer !== undefined) clearTimeout(moveTimer)
    }
  }, [
    board,
    difficulty,
    enabled,
    onMove,
    setHoveredColumn,
    setIsThinking,
  ])
}
