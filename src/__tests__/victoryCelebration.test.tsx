import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { VictoryOverlay } from '../components/board/VictoryOverlay'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function playRedVerticalWin() {
  const columns = screen.getAllByRole('button', {
    name: /列\dに玉を落とす/,
  })
  const moves = [0, 1, 0, 1, 0, 1, 0]
  moves.forEach((columnIndex, moveIndex) => {
    fireEvent.click(columns[columnIndex])
    if (moveIndex < moves.length - 1) {
      act(() => vi.advanceTimersByTime(460))
    }
  })
}

function stubReducedMotion() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
}

describe('victory celebration', () => {
  it('stamps the board only after the winning disc lands', () => {
    vi.useFakeTimers()
    render(<App />)

    playRedVerticalWin()
    expect(screen.queryByTestId('victory-overlay')).not.toBeInTheDocument()
    expect(screen.queryByTestId('winning-line')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(460))

    expect(screen.getByTestId('victory-overlay')).toHaveAttribute(
      'data-outcome',
      'victory'
    )
    expect(screen.getByTestId('victory-seal')).toHaveTextContent('勝')
    expect(screen.getByText('赤の勝ち')).toBeInTheDocument()
    expect(screen.getByTestId('winning-line')).toBeInTheDocument()
    expect(screen.getAllByTestId('confetti-piece').length).toBeGreaterThan(0)
  })

  it('keeps the overlay out of the accessibility tree', () => {
    vi.useFakeTimers()
    render(<App />)

    playRedVerticalWin()
    act(() => vi.advanceTimersByTime(460))

    expect(screen.getByTestId('victory-overlay')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
    expect(screen.getByRole('status')).toHaveTextContent('赤の勝利')
  })

  it('clears the celebration when a new game starts', () => {
    vi.useFakeTimers()
    render(<App />)

    playRedVerticalWin()
    act(() => vi.advanceTimersByTime(460))
    fireEvent.click(screen.getByRole('button', { name: 'もう一局' }))

    expect(screen.queryByTestId('victory-overlay')).not.toBeInTheDocument()
    expect(screen.queryByTestId('winning-line')).not.toBeInTheDocument()
  })

  it('clears the celebration when the winning move is undone', () => {
    vi.useFakeTimers()
    render(<App />)

    playRedVerticalWin()
    act(() => vi.advanceTimersByTime(460))
    fireEvent.click(screen.getByRole('button', { name: '1つ戻す' }))

    expect(screen.queryByTestId('victory-overlay')).not.toBeInTheDocument()
  })

  it('skips confetti and the sunburst when reduced motion is preferred', () => {
    stubReducedMotion()
    vi.useFakeTimers()
    render(<App />)

    playRedVerticalWin()
    act(() => vi.advanceTimersByTime(460))

    expect(screen.getByTestId('victory-seal')).toBeInTheDocument()
    expect(screen.queryByTestId('confetti-piece')).not.toBeInTheDocument()
    expect(screen.queryByTestId('victory-sunburst')).not.toBeInTheDocument()
  })
})

describe('VictoryOverlay', () => {
  it('shows a subdued defeat stamp without confetti', () => {
    render(
      <VictoryOverlay
        celebration={{
          outcome: 'defeat',
          tone: 'yellow',
          label: 'CPUの勝ち',
          seed: 1,
        }}
      />
    )

    expect(screen.getByTestId('victory-overlay')).toHaveAttribute(
      'data-outcome',
      'defeat'
    )
    expect(screen.getByTestId('victory-seal')).toHaveTextContent('敗')
    expect(screen.getByText('無念')).toBeInTheDocument()
    expect(screen.queryByTestId('confetti-piece')).not.toBeInTheDocument()
  })
})
