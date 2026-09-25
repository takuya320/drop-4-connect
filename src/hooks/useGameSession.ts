import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CpuDifficulty } from '../cpuLogic'
import {
  checkWinner,
  COLS,
  countMoves,
  createEmptyBoard,
  dropDisc,
  findDropRow,
  getWinningCells,
  isDraw as checkDraw,
  undoDisc,
  type Player,
} from '../gameLogic'
import type { GameMode, Move } from '../gameTypes'
import { useCpuTurn } from './useCpuTurn'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const columns = Array.from({ length: COLS }, (_, index) => index)

export function useGameSession() {
  const [board, setBoard] = useState<Player[][]>(createEmptyBoard)
  const [currentPlayer, setCurrentPlayer] =
    useState<Exclude<Player, null>>('red')
  const [winner, setWinner] = useState<Player>(null)
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('local')
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>(2)
  const [isCpuThinking, setIsCpuThinking] = useState(false)
  const [lastMove, setLastMove] = useState<Move | null>(null)
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const animationLock = useRef(false)
  const nextMoveId = useRef(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const isDraw = useMemo(() => checkDraw(board, winner), [board, winner])
  const isGameOver = Boolean(winner) || isDraw
  const isCpuTurn =
    gameMode === 'cpu' && currentPlayer === 'yellow' && !isGameOver
  const isBoardLocked =
    isGameOver || isAnimating || isCpuTurn || isCpuThinking
  const previewRow = useMemo(
    () =>
      hoveredColumn === null || isBoardLocked
        ? -1
        : findDropRow(board, hoveredColumn),
    [board, hoveredColumn, isBoardLocked]
  )

  const resetGame = useCallback(() => {
    animationLock.current = false
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setHoveredColumn(null)
    setIsCpuThinking(false)
    setLastMove(null)
    setMoveHistory([])
    setIsAnimating(false)
  }, [])

  const finishDropAnimation = useCallback(() => {
    animationLock.current = false
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (!lastMove || !isAnimating) return
    const fallback = window.setTimeout(
      finishDropAnimation,
      prefersReducedMotion ? 30 : 460
    )
    return () => window.clearTimeout(fallback)
  }, [finishDropAnimation, isAnimating, lastMove, prefersReducedMotion])

  const placeDisc = useCallback(
    (col: number) => {
      if (animationLock.current || winner || isDraw) return

      const result = dropDisc(board, col, currentPlayer)
      if (!result) return

      const { newBoard, row } = result
      animationLock.current = true
      setIsAnimating(true)
      setBoard(newBoard)
      nextMoveId.current += 1
      const move = {
        id: nextMoveId.current,
        row,
        col,
        player: currentPlayer,
      }
      setLastMove(move)
      setMoveHistory((history) => [...history, move])

      if (checkWinner(newBoard, row, col, currentPlayer)) {
        setWinner(currentPlayer)
      } else {
        setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
      }
    },
    [board, currentPlayer, winner, isDraw]
  )

  const undoMove = useCallback(() => {
    if (animationLock.current || isCpuThinking || moveHistory.length === 0) {
      return
    }

    const steps =
      gameMode === 'cpu' &&
      moveHistory[moveHistory.length - 1]?.player === 'yellow'
        ? Math.min(2, moveHistory.length)
        : 1
    const removed = moveHistory.slice(-steps)
    let nextBoard = board

    for (const move of [...removed].reverse()) {
      const undone = undoDisc(nextBoard, move.row, move.col)
      if (!undone) return
      nextBoard = undone
    }

    const nextHistory = moveHistory.slice(0, -steps)
    animationLock.current = false
    setIsAnimating(false)
    setIsCpuThinking(false)
    setHoveredColumn(null)
    setBoard(nextBoard)
    setMoveHistory(nextHistory)
    setLastMove(nextHistory[nextHistory.length - 1] ?? null)
    setWinner(null)
    setCurrentPlayer(removed[0].player)
  }, [board, gameMode, isCpuThinking, moveHistory])

  const handleClick = useCallback(
    (col: number) => {
      if (isCpuTurn || isCpuThinking) return
      placeDisc(col)
    },
    [isCpuThinking, isCpuTurn, placeDisc]
  )

  const selectGameMode = useCallback(
    (mode: GameMode) => {
      if (mode === gameMode) return
      setGameMode(mode)
      resetGame()
    },
    [gameMode, resetGame]
  )

  const selectCpuDifficulty = useCallback(
    (difficulty: CpuDifficulty) => {
      if (difficulty === cpuDifficulty) return
      setCpuDifficulty(difficulty)
      resetGame()
    },
    [cpuDifficulty, resetGame]
  )

  useCpuTurn({
    board,
    difficulty: cpuDifficulty,
    enabled: isCpuTurn && !isAnimating && !winner && !isDraw,
    onMove: placeDisc,
    setHoveredColumn,
    setIsThinking: setIsCpuThinking,
  })

  const isColumnFull = useMemo(
    () => board[0].map((cell) => cell !== null),
    [board]
  )
  const moveCount = useMemo(() => countMoves(board), [board])
  const statusPlayer =
    isAnimating && lastMove ? lastMove.player : currentPlayer
  const statusLabel =
    isCpuThinking
      ? 'CPUが考えています…'
      : gameMode === 'cpu' && statusPlayer === 'yellow'
        ? 'CPUの番'
        : undefined
  const winningCellKeys = useMemo(() => {
    if (!winner || !lastMove) return new Set<string>()
    return new Set(
      getWinningCells(
        board,
        lastMove.row,
        lastMove.col,
        winner
      ).map(({ row, col }) => `${row}-${col}`)
    )
  }, [board, lastMove, winner])

  return {
    board,
    canUndo: moveHistory.length > 0 && !isAnimating && !isCpuThinking,
    columns,
    cpuDifficulty,
    currentPlayer,
    finishDropAnimation,
    gameMode,
    handleClick,
    hoveredColumn,
    isAnimating,
    isBoardLocked,
    isColumnFull,
    isDraw,
    isGameOver,
    lastMove,
    moveCount,
    previewRow,
    resetGame,
    selectCpuDifficulty,
    selectGameMode,
    setHoveredColumn,
    showWinEmphasis: Boolean(winner) && !isAnimating,
    statusLabel,
    statusPlayer,
    undoMove,
    winner,
    winningCellKeys,
  }
}
