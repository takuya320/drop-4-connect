import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('CPU mode', () => {
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
    act(() => vi.advanceTimersByTime(100))
    expect(screen.getByText('赤の番')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '列1に玉を落とす' })
    ).toBeEnabled()
  })

  it('undoes the player move together with the CPU reply', () => {
    vi.useFakeTimers()
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'CPUと対戦' }))
    const undo = screen.getByRole('button', { name: '1つ戻す' })
    const firstColumn = screen.getByRole('button', {
      name: '列1に玉を落とす',
    })

    fireEvent.click(firstColumn)
    act(() => vi.advanceTimersByTime(460))
    expect(undo).toBeDisabled()

    act(() => vi.advanceTimersByTime(400))
    act(() => vi.advanceTimersByTime(460))

    expect(screen.getByText('2 手目')).toBeInTheDocument()
    expect(undo).toBeEnabled()

    fireEvent.click(undo)
    act(() => vi.advanceTimersByTime(100))

    expect(screen.queryByTestId('disc-5-0')).not.toBeInTheDocument()
    expect(screen.queryByTestId('disc-5-3')).not.toBeInTheDocument()
    expect(screen.getByText('0 手目')).toBeInTheDocument()
    expect(screen.getByText('赤の番')).toBeInTheDocument()
    expect(undo).toBeDisabled()
  })
})
