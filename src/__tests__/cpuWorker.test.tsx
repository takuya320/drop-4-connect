import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

class FakeWorker {
  static instances: FakeWorker[] = []

  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  onmessageerror: ((event: MessageEvent) => void) | null = null
  terminated = false

  constructor() {
    FakeWorker.instances.push(this)
  }

  postMessage() {}

  terminate() {
    this.terminated = true
  }

  reply(data: unknown) {
    act(() => this.onmessage?.({ data } as MessageEvent))
  }
}

// Red plays column 1, then the CPU worker is started once the drop settles.
function startCpuTurn(): FakeWorker {
  vi.useFakeTimers()
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'CPUと対戦' }))
  fireEvent.click(screen.getByRole('button', { name: '列1に玉を落とす' }))
  act(() => vi.advanceTimersByTime(460))

  expect(FakeWorker.instances).toHaveLength(1)
  return FakeWorker.instances[0]
}

let consoleError: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  FakeWorker.instances = []
  vi.stubGlobal('Worker', FakeWorker)
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  consoleError.mockRestore()
})

describe('CPU worker', () => {
  it('plays the column chosen by the worker', () => {
    const worker = startCpuTurn()

    worker.reply({ column: 5 })
    act(() => vi.advanceTimersByTime(400))

    expect(screen.getByTestId('disc-5-5')).toBeInTheDocument()
    expect(worker.terminated).toBe(true)
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('falls back to a legal move and reports the failure when the worker errors', () => {
    const worker = startCpuTurn()

    act(() => worker.onerror?.({ message: 'boom' } as ErrorEvent))
    act(() => vi.advanceTimersByTime(400))

    expect(screen.getByTestId('disc-5-3')).toBeInTheDocument()
    expect(worker.terminated).toBe(true)
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('worker error'),
      'boom'
    )
  })

  it.each([
    ['an out-of-range column', { column: 99 }],
    ['a non-numeric column', { column: 'x' }],
    ['no payload', null],
  ])('falls back instead of stalling when the worker returns %s', (_name, data) => {
    const worker = startCpuTurn()

    worker.reply(data)
    act(() => vi.advanceTimersByTime(400))

    expect(screen.getByTestId('disc-5-3')).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('illegal move'),
      data
    )

    act(() => vi.advanceTimersByTime(460))
    act(() => vi.advanceTimersByTime(100))
    expect(screen.getByText('赤の番')).toBeInTheDocument()
  })

  it('falls back when the worker message cannot be deserialized', () => {
    const worker = startCpuTurn()

    act(() => worker.onmessageerror?.({} as MessageEvent))
    act(() => vi.advanceTimersByTime(400))

    expect(screen.getByTestId('disc-5-3')).toBeInTheDocument()
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('unreadable message'),
      expect.anything()
    )
  })
})
