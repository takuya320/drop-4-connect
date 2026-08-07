import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

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
    vi.useRealTimers()
  })
})
