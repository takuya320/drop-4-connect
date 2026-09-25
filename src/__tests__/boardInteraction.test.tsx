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

  it('drops a disc when a cell in that column is tapped', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByTestId('cell-0-2'))

    expect(screen.getByTestId('disc-5-2')).toBeInTheDocument()
    expect(screen.getByText('1 手目')).toBeInTheDocument()
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

  it('undoes the latest disc and returns the turn to that player', () => {
    vi.useFakeTimers()
    render(<App />)
    const undo = screen.getByRole('button', { name: '1つ戻す' })
    const firstColumn = screen.getByRole('button', {
      name: '列1に玉を落とす',
    })

    expect(undo).toBeDisabled()

    fireEvent.click(firstColumn)
    expect(undo).toBeDisabled()
    act(() => vi.advanceTimersByTime(460))
    act(() => vi.advanceTimersByTime(100))

    expect(screen.getByTestId('disc-5-0')).toBeInTheDocument()
    expect(screen.getByText('黄の番')).toBeInTheDocument()
    expect(undo).toBeEnabled()

    fireEvent.click(undo)
    act(() => vi.advanceTimersByTime(100))

    expect(screen.queryByTestId('disc-5-0')).not.toBeInTheDocument()
    expect(screen.getByText('赤の番')).toBeInTheDocument()
    expect(screen.getByText('0 手目')).toBeInTheDocument()
    expect(undo).toBeDisabled()
  })

  it('undoes a finished game so play can continue', () => {
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
    fireEvent.click(screen.getByRole('button', { name: '1つ戻す' }))

    expect(screen.queryByText('赤の勝利')).not.toBeInTheDocument()
    expect(screen.queryByTestId('disc-2-0')).not.toBeInTheDocument()
    expect(screen.getByText('赤の番')).toBeInTheDocument()
    expect(columns[2]).toBeEnabled()
  })
})
