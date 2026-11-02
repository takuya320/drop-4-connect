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
    const availableMoves = getAvailableMoves(board)
    const fallbackColumn = availableMoves[0] ?? -1

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

    // The CPU level silently drops to "first legal column" here, so make the
    // cause visible instead of swallowing it.
    const fallBack = (reason: string, detail?: unknown) => {
      console.error(`CPU worker failed (${reason}); using fallback move`, detail)
      worker?.terminate()
      worker = null
      scheduleMove(fallbackColumn)
    }

    try {
      worker = new Worker(new URL('../cpuWorker.ts', import.meta.url))
      worker.onmessage = (event: MessageEvent<CpuWorkerResponse>) => {
        const column: unknown = event.data?.column
        if (typeof column !== 'number' || !availableMoves.includes(column)) {
          fallBack('illegal move received', event.data)
          return
        }
        scheduleMove(column)
      }
      worker.onerror = (event) => fallBack('worker error', event.message)
      worker.onmessageerror = (event) => fallBack('unreadable message', event)

      const request: CpuWorkerRequest = { board, difficulty }
      worker.postMessage(request)
    } catch (error) {
      fallBack('failed to start', error)
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
