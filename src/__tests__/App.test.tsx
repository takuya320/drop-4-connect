import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

const DROP_ANIMATION_MS = 350

afterEach(() => {
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

    expect(
      screen.queryByRole('img', { name: '黄の玉の落下位置' })
    ).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(DROP_ANIMATION_MS)
    })

    expect(
      screen.getByRole('img', { name: '黄の玉の落下位置' })
    ).toBeInTheDocument()

    fireEvent.mouseLeave(firstColumn)

    expect(
      screen.queryByRole('img', { name: '黄の玉の落下位置' })
    ).not.toBeInTheDocument()
  })

  it('disables every column during the drop animation', () => {
    vi.useFakeTimers()
    render(<App />)
    const columns = screen.getAllByRole('button', {
      name: /列\dに玉を落とす/,
    })

    fireEvent.click(columns[0])

    for (const column of columns) {
      expect(column).toBeDisabled()
    }

    act(() => {
      vi.advanceTimersByTime(DROP_ANIMATION_MS)
    })

    for (const column of columns) {
      expect(column).toBeEnabled()
    }
  })

  it('removes all interaction feedback from a full column', () => {
    vi.useFakeTimers()
    render(<App />)
    const firstColumn = screen.getByRole('button', {
      name: '列1に玉を落とす',
    })

    expect(firstColumn).toBeEnabled()
    expect(firstColumn).toHaveStyle({ cursor: 'pointer' })

    for (let move = 0; move < 6; move++) {
      fireEvent.click(firstColumn)
      act(() => {
        vi.advanceTimersByTime(DROP_ANIMATION_MS)
      })
    }

    expect(firstColumn).toBeDisabled()
    expect(firstColumn).toHaveStyle({ cursor: 'default' })

    fireEvent.mouseLeave(firstColumn)
    fireEvent.mouseEnter(firstColumn)
    fireEvent.click(firstColumn)
    fireEvent.keyDown(firstColumn, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(firstColumn, { key: ' ', code: 'Space' })

    expect(screen.queryByRole('img', { name: /の玉の落下位置/ })).not.toBeInTheDocument()
    expect(screen.getByText('6 手目')).toBeInTheDocument()
  })

  it('disables every column after the game is won', () => {
    vi.useFakeTimers()
    render(<App />)
    const columns = screen.getAllByRole('button', {
      name: /列\dに玉を落とす/,
    })

    for (const columnIndex of [0, 1, 0, 1, 0, 1, 0]) {
      fireEvent.click(columns[columnIndex])
      act(() => {
        vi.advanceTimersByTime(DROP_ANIMATION_MS)
      })
    }

    expect(screen.getByText('赤の勝利')).toBeInTheDocument()
    for (const column of columns) {
      expect(column).toBeDisabled()
    }
  })
})
