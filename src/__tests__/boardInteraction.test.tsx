import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('board interaction', () => {
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
})
