import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('drop position preview', () => {
  it('shows the current player disc while a column is hovered', () => {
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
      screen.getByRole('img', { name: '黄の玉の落下位置' })
    ).toBeInTheDocument()

    fireEvent.mouseLeave(firstColumn)

    expect(
      screen.queryByRole('img', { name: '黄の玉の落下位置' })
    ).not.toBeInTheDocument()
  })
})
