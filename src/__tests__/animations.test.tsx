import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('game animations', () => {
  it('reveals the winning line only after the final disc lands', () => {
    vi.useFakeTimers()
    render(<App />)
    const columns = [0, 6, 1, 6, 2, 5, 3]

    columns.forEach((column, moveIndex) => {
      fireEvent.click(
        screen.getByRole('button', {
          name: `列${column + 1}に玉を落とす`,
        })
      )

      if (moveIndex === columns.length - 1) {
        expect(screen.queryByText('赤の勝利')).not.toBeInTheDocument()
        expect(screen.getByTestId('disc-5-3')).toHaveClass('is-dropping')
      }

      act(() => vi.advanceTimersByTime(460))
    })

    expect(screen.getByText('赤の勝利')).toBeInTheDocument()
    for (let column = 0; column < 4; column++) {
      expect(screen.getByTestId(`disc-5-${column}`)).toHaveClass('is-winning')
    }
    expect(screen.getByTestId('disc-5-5')).toHaveClass('is-dimmed')
  })

  it('disables every column during the drop animation', () => {
    vi.useFakeTimers()
    render(<App />)
    const columns = screen.getAllByRole('button', {
      name: /列\dに玉を落とす/,
    })

    fireEvent.click(columns[0])
    for (const column of columns) expect(column).toBeDisabled()

    act(() => vi.advanceTimersByTime(460))
    for (const column of columns) expect(column).toBeEnabled()
  })
})
