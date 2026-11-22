import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ListaRelacoes from './ListaRelacoes'
import ListaRestaurantes from './ListaRestaurantes'
import TopReviews from './TopReviews'
import BuscaUsuarios from './BuscaUsuarios'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('busca e lista de restaurantes', () => {
  it('mapeia resultados e permite abrir um restaurante', async () => {
    const user = userEvent.setup()
    const onSelecionarRestaurante = vi.fn()
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).startsWith('/api/restaurants?')
        ? ({
            ok: true,
            json: async () => [
              {
                id: 2,
                name: 'Café Central',
                category: 'Café',
                image_url: null,
                average_rating: null,
                review_count: 0,
                rating_counts: [0, 0, 0, 0, 0],
              },
            ],
          } as Response)
        : ({ ok: true, json: async () => [] } as Response),
    )
    render(
      <ListaRestaurantes
        email="ana@example.com"
        viewerId={4}
        consulta="cafe & pão"
        onSelecionarRestaurante={onSelecionarRestaurante}
        onSelecionarRestaurantePorId={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        erroCarregamentoRestaurante=""
      />,
    )

    await user.click(await screen.findByRole('button', { name: /Café Central/ }))
    expect(onSelecionarRestaurante).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Café Central',
        mediaAvaliacoes: null,
        quantidadeAvaliacoes: 0,
      }),
    )
    expect(fetch).toHaveBeenCalledWith(
      '/api/restaurants?name=cafe%20%26%20p%C3%A3o',
    )
    expect(screen.getByText('Sem avaliações')).toBeInTheDocument()
  })

  it('mostra erro de busca e a mensagem de nenhum resultado', async () => {
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).startsWith('/api/restaurants?')
        ? ({ ok: false } as Response)
        : ({ ok: true, json: async () => [] } as Response),
    )
    const { rerender } = render(
      <ListaRestaurantes
        email="ana@example.com"
        viewerId={null}
        consulta="falha"
        onSelecionarRestaurante={vi.fn()}
        onSelecionarRestaurantePorId={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        erroCarregamentoRestaurante="Falha ao abrir"
      />,
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao abrir',
    )
    expect(screen.getByText('Não foi possível buscar restaurantes. Tente novamente.')).toBeVisible()

    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).startsWith('/api/restaurants?')
        ? ({ ok: true, json: async () => [] } as Response)
        : ({ ok: true, json: async () => [] } as Response),
    )
    rerender(
      <ListaRestaurantes
        email="ana@example.com"
