import {
  COLS,
  ROWS,
  checkWinner,
  dropDisc,
  type Player,
} from './gameLogic'

export type CpuDifficulty = 1 | 2 | 3 | 4
export type DiscPlayer = Exclude<Player, null>

export interface CpuOptions {
  random?: () => number
  timeLimitMs?: number
}

interface SearchContext {
  cpu: DiscPlayer
  deadline: number
  table?: Map<string, TableEntry>
  timedOut: boolean
}

interface TableEntry {
  depth: number
  score: number
}

interface SearchResult {
  move: number
  score: number
  completed: boolean
}

const CENTER_ORDER = [3, 2, 4, 1, 5, 0, 6]
const WIN_SCORE = 1_000_000

export function getAvailableMoves(board: Player[][]): number[] {
  return CENTER_ORDER.filter((column) => board[0]?.[column] === null)
}

export function makeMove(
  board: Player[][],
  column: number,
  player: DiscPlayer
): { board: Player[][]; row: number } | null {
  const result = dropDisc(board, column, player)
  return result ? { board: result.newBoard, row: result.row } : null
}

function opponentOf(player: DiscPlayer): DiscPlayer {
  return player === 'red' ? 'yellow' : 'red'
}

function getWinningMoves(board: Player[][], player: DiscPlayer): number[] {
  return getAvailableMoves(board).filter((column) => {
    const result = makeMove(board, column, player)
    return result !== null && checkWinner(result.board, result.row, column, player)
  })
}

function scoreWindow(
  cells: Player[],
  player: DiscPlayer,
  opponent: DiscPlayer
): number {
  const own = cells.filter((cell) => cell === player).length
  const theirs = cells.filter((cell) => cell === opponent).length
  const empty = cells.filter((cell) => cell === null).length

  if (own === 4) return 100_000
  if (theirs === 4) return -100_000
  if (own > 0 && theirs > 0) return 0
  if (own === 3 && empty === 1) return 130
  if (own === 2 && empty === 2) return 18
  if (theirs === 3 && empty === 1) return -165
  if (theirs === 2 && empty === 2) return -20
  return 0
}

export function evaluateBoard(board: Player[][], player: DiscPlayer): number {
  const opponent = opponentOf(player)
  let score = 0

  for (let row = 0; row < ROWS; row++) {
    if (board[row][3] === player) score += 7
    if (board[row][3] === opponent) score -= 7
  }

  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column <= COLS - 4; column++) {
      score += scoreWindow(board[row].slice(column, column + 4), player, opponent)
    }
  }

  for (let column = 0; column < COLS; column++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      score += scoreWindow(
        [0, 1, 2, 3].map((offset) => board[row + offset][column]),
        player,
        opponent
      )
    }
  }

  for (let row = 0; row <= ROWS - 4; row++) {
    for (let column = 0; column <= COLS - 4; column++) {
      score += scoreWindow(
        [0, 1, 2, 3].map((offset) => board[row + offset][column + offset]),
        player,
        opponent
      )
      score += scoreWindow(
        [0, 1, 2, 3].map((offset) => board[row + 3 - offset][column + offset]),
        player,
        opponent
      )
    }
  }

  const ownThreats = getWinningMoves(board, player).length
  const opponentThreats = getWinningMoves(board, opponent).length
  score += ownThreats * 240
  score -= opponentThreats * 320
  if (ownThreats >= 2) score += 900
  if (opponentThreats >= 2) score -= 1_100

  return score
}

function boardKey(board: Player[][], player: DiscPlayer): string {
  const cells = board
    .map((row) =>
      row
        .map((cell) => (cell === 'red' ? 'r' : cell === 'yellow' ? 'y' : '.'))
        .join('')
    )
    .join('')
  return `${player}:${cells}`
}

function orderedMoves(
  board: Player[][],
  player: DiscPlayer,
  cpu: DiscPlayer
): number[] {
  const opponent = opponentOf(player)
  const winning = new Set(getWinningMoves(board, player))
  const blocking = new Set(getWinningMoves(board, opponent))

  return getAvailableMoves(board)
    .map((move) => {
      const result = makeMove(board, move, player)
      const evaluation = result ? evaluateBoard(result.board, cpu) : 0
      const perspectiveScore = player === cpu ? evaluation : -evaluation
      return {
        move,
        score:
          (winning.has(move) ? 2_000_000 : 0) +
          (blocking.has(move) ? 1_000_000 : 0) +
          perspectiveScore,
      }
    })
    .sort((a, b) => b.score - a.score)
    .map(({ move }) => move)
}

function minimax(
  board: Player[][],
  depth: number,
  alpha: number,
  beta: number,
  player: DiscPlayer,
  context: SearchContext
): number {
  if (Date.now() >= context.deadline) {
    context.timedOut = true
    return evaluateBoard(board, context.cpu)
  }

  const moves = getAvailableMoves(board)
  if (depth === 0 || moves.length === 0) return evaluateBoard(board, context.cpu)

  const key = context.table ? boardKey(board, player) : ''
  const cached = context.table?.get(key)
  if (cached && cached.depth >= depth) return cached.score

  const maximizing = player === context.cpu
  let best = maximizing ? -Infinity : Infinity

  for (const move of orderedMoves(board, player, context.cpu)) {
    const result = makeMove(board, move, player)
    if (!result) continue

    let score: number
    if (checkWinner(result.board, result.row, move, player)) {
      score = maximizing ? WIN_SCORE + depth : -WIN_SCORE - depth
    } else {
      score = minimax(
        result.board,
        depth - 1,
        alpha,
        beta,
        opponentOf(player),
        context
      )
    }

    if (context.timedOut) return score

    if (maximizing) {
      best = Math.max(best, score)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, best)
    }
    if (alpha >= beta) break
  }

  context.table?.set(key, { depth, score: best })
  return best
}

function searchAtDepth(
  board: Player[][],
  cpu: DiscPlayer,
  depth: number,
  context: SearchContext
): SearchResult {
  let bestMove = getAvailableMoves(board)[0] ?? -1
  let bestScore = -Infinity

  for (const move of orderedMoves(board, cpu, cpu)) {
    const result = makeMove(board, move, cpu)
    if (!result) continue

    const score = checkWinner(result.board, result.row, move, cpu)
      ? WIN_SCORE + depth
      : minimax(
          result.board,
          depth - 1,
          -Infinity,
          Infinity,
          opponentOf(cpu),
          context
        )

    if (context.timedOut) {
      return { move: bestMove, score: bestScore, completed: false }
    }
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return { move: bestMove, score: bestScore, completed: true }
}

function chooseEasyMove(
  board: Player[][],
  cpu: DiscPlayer,
  random: () => number
): number {
  const moves = getAvailableMoves(board)
  const winningMoves = getWinningMoves(board, cpu)
  if (winningMoves.length > 0 && random() < 0.35) {
    return winningMoves[Math.floor(random() * winningMoves.length)]
  }
  return moves[Math.floor(random() * moves.length)] ?? -1
}

function chooseNormalMove(
  board: Player[][],
  cpu: DiscPlayer,
  random: () => number
): number {
  const winningMoves = getWinningMoves(board, cpu)
  if (winningMoves.length > 0) return winningMoves[0]

  const blockingMoves = getWinningMoves(board, opponentOf(cpu))
  if (blockingMoves.length > 0) return blockingMoves[0]

  const moves = getAvailableMoves(board)
  if (random() < 0.12) return moves[Math.floor(random() * moves.length)] ?? -1

  const ranked = moves
    .map((move) => {
      const result = makeMove(board, move, cpu)
      const centerBonus = (3 - Math.abs(3 - move)) * 8
      return {
        move,
        score: (result ? evaluateBoard(result.board, cpu) : -Infinity) + centerBonus,
      }
    })
    .sort((a, b) => b.score - a.score)

  const candidates = ranked.slice(0, Math.min(2, ranked.length))
  return candidates[Math.floor(random() * candidates.length)]?.move ?? -1
}

export function chooseCpuMove(
  board: Player[][],
  difficulty: CpuDifficulty,
  cpu: DiscPlayer = 'yellow',
  options: CpuOptions = {}
): number {
  const moves = getAvailableMoves(board)
  if (moves.length === 0) return -1

  const random = options.random ?? Math.random
  if (difficulty === 1) return chooseEasyMove(board, cpu, random)
  if (difficulty === 2) return chooseNormalMove(board, cpu, random)

  const immediateWin = getWinningMoves(board, cpu)[0]
  if (immediateWin !== undefined) return immediateWin
  const immediateBlock = getWinningMoves(board, opponentOf(cpu))[0]
  if (immediateBlock !== undefined) return immediateBlock

  const defaultLimit = difficulty === 4 ? 1_000 : 650
  const context: SearchContext = {
    cpu,
    deadline: Date.now() + (options.timeLimitMs ?? defaultLimit),
    table: difficulty === 4 ? new Map<string, TableEntry>() : undefined,
    timedOut: false,
  }

  if (difficulty === 3) {
    return searchAtDepth(board, cpu, 5, context).move
  }

  let bestMove = moves[0]
  for (let depth = 4; depth <= 9; depth++) {
    context.timedOut = false
    const result = searchAtDepth(board, cpu, depth, context)
    if (!result.completed) break
    bestMove = result.move
    if (Math.abs(result.score) >= WIN_SCORE) break
  }
  return bestMove
}
