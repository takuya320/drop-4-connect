import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('drop position preview', () => {
  it('shows the current player disc while a column is hovered', () => {
    vi.useFakeTimers()
    render(<App />)
    const firstColumn = screen.getByRole('button', {
      name: '列1に玉を落とす',
    })

    fireEvent.mouseEnter(firstColumn)

    expect(
      screen.getByRole('img', { name: '赤の玉の落下位置' })
    ).toBeInTheDocument()

    fireEvent.click(firstColumn)

    const fallingDisc = screen.getByTestId('disc-5-0')
    expect(fallingDisc).toHaveClass('is-dropping')
    expect(firstColumn).toBeDisabled()

    fireEvent.click(firstColumn)
    expect(screen.queryByTestId('disc-4-0')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(460))
    fireEvent.mouseEnter(firstColumn)

    expect(
      screen.getByRole('img', { name: '黄の玉の落下位置' })
    ).toBeInTheDocument()
    expect(firstColumn).toBeEnabled()

    fireEvent.mouseLeave(firstColumn)

    expect(
      screen.queryByRole('img', { name: '黄の玉の落下位置' })
    ).not.toBeInTheDocument()
  })

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

  it('keeps a full column disabled without showing a preview', () => {
    vi.useFakeTimers()
    render(<App />)
    const firstColumn = screen.getByRole('button', {
      name: '列1に玉を落とす',
    })

    for (let move = 0; move < 6; move++) {
      fireEvent.click(firstColumn)
      act(() => vi.advanceTimersByTime(460))
    }

    expect(firstColumn).toBeDisabled()
    fireEvent.mouseEnter(firstColumn)
    fireEvent.click(firstColumn)

    expect(
      screen.queryByRole('img', { name: /の玉の落下位置/ })
    ).not.toBeInTheDocument()
    expect(screen.getByText('6 手目')).toBeInTheDocument()
  })

  it('keeps every column disabled after the game is won', () => {
    vi.useFakeTimers()
    render(<App />)
    const columns = screen.getAllByRole('button', {
      name: /列\dに玉を落とす/,
    })

    for (const columnIndex of [0, 1, 0, 1, 0, 1, 0]) {
      fireEvent.click(columns[columnIndex])
      act(() => vi.advanceTimersByTime(460))
    }

    expect(screen.getByText('赤の勝利')).toBeInTheDocument()
    for (const column of columns) expect(column).toBeDisabled()
  })

  it('falls back to a legal CPU move when the Worker is unavailable', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'CPUと対戦' }))
    fireEvent.click(
      screen.getByRole('button', { name: '列1に玉を落とす' })
    )

    act(() => vi.advanceTimersByTime(460))
    expect(screen.getByText('CPUが考えています…')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(400))
    expect(screen.getByTestId('disc-5-3')).toHaveClass('is-dropping')
    expect(screen.getByText('2 手目')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(460))
    expect(screen.getByText('赤の番')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '列1に玉を落とす' })
    ).toBeEnabled()
  })
})
