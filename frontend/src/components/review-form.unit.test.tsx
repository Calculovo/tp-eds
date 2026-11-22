import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AvaliarRestaurante from './AvaliarRestaurante'
import BotoesVotoReview from './BotoesVotoReview'
import type { Restaurante } from './ListaRestaurantes'

const restaurante: Restaurante = {
  id: 8,
  nome: 'Café Central',
  categoria: 'Café',
  imagem: null,
  mediaAvaliacoes: null,
  quantidadeAvaliacoes: 0,
  contagemAvaliacoes: [0, 0, 0, 0, 0],
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('edição e envio de avaliações', () => {
  it('exige uma nota antes de enviar', async () => {
    const user = userEvent.setup()
    render(
      <AvaliarRestaurante
        restaurante={restaurante}
        email="ana@example.com"
        onFechar={vi.fn()}
        onSalvo={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Salvar avaliação' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecione uma nota de 1 a 5 estrelas.',
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('pré-preenche review existente e salva alterações', async () => {
    const user = userEvent.setup()
    const onSalvo = vi.fn()
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
    render(
      <AvaliarRestaurante
        restaurante={restaurante}
        email="ana@example.com"
        avaliacaoInicial={{ rating: 4, comment: '  Muito bom  ' }}
        onFechar={vi.fn()}
        onSalvo={onSalvo}
      />,
    )

    expect(screen.getByLabelText('Sua avaliação')).toHaveValue('  Muito bom  ')
    expect(screen.getByRole('button', { name: '4 estrelas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: '5 estrelas' }))
    await user.click(screen.getByRole('button', { name: 'Salvar avaliação' }))

    await waitFor(() => expect(onSalvo).toHaveBeenCalledOnce())
    expect(fetch).toHaveBeenCalledWith('/api/restaurants/8/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ana@example.com',
        rating: 5,
        comment: 'Muito bom',
      }),
    })
  })

  it('mostra erro quando o backend recusa a avaliação', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    render(
      <AvaliarRestaurante
        restaurante={restaurante}
        email="ana@example.com"
        onFechar={vi.fn()}
        onSalvo={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '3 estrelas' }))
    await user.click(screen.getByRole('button', { name: 'Salvar avaliação' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar sua avaliação.',
