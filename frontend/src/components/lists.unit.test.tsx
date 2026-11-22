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
        viewerId={null}
        consulta="vazio"
        onSelecionarRestaurante={vi.fn()}
        onSelecionarRestaurantePorId={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        erroCarregamentoRestaurante=""
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Nenhum restaurante encontrado.')).toBeVisible()
    })
  })
})

describe('reviews em destaque', () => {
  it('liga para perfil e restaurante a partir de uma review', async () => {
    const user = userEvent.setup()
    const onSelecionarUsuario = vi.fn()
    const onSelecionarRestaurante = vi.fn()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 3,
          user_id: 7,
          restaurant_id: 2,
          username: 'bia',
          restaurant_name: 'Café Central',
          rating: 4.5,
          comment: 'Excelente',
          helpful_votes: 2,
          unhelpful_votes: 1,
          viewer_vote: null,
        },
      ],
    } as Response)
    render(
      <TopReviews
        email="ana@example.com"
        viewerId={4}
        onSelecionarUsuario={onSelecionarUsuario}
        onSelecionarRestaurante={onSelecionarRestaurante}
      />,
    )

    await user.click(await screen.findByRole('button', { name: /Café Central/ }))
    await user.click(screen.getByRole('button', { name: 'bia' }))
    expect(onSelecionarRestaurante).toHaveBeenCalledWith(2)
    expect(onSelecionarUsuario).toHaveBeenCalledWith(7)
    expect(fetch).toHaveBeenCalledWith('/api/reviews/top?viewer_id=4')
  })

  it('mostra lista vazia e erro de carregamento', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
    const props = {
      email: 'ana@example.com',
      viewerId: null,
      onSelecionarUsuario: vi.fn(),
      onSelecionarRestaurante: vi.fn(),
    }
    const { rerender } = render(<TopReviews {...props} />)
    expect(await screen.findByText('Ainda não há reviews para exibir.')).toBeVisible()

    rerender(<TopReviews {...props} viewerId={8} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as reviews em destaque.',
    )
  })

  it('registra voto e recarrega o ranking', async () => {
    const user = userEvent.setup()
    const destaque = {
      id: 3,
      user_id: 7,
      restaurant_id: 2,
      username: 'bia',
      restaurant_name: 'Café Central',
      rating: 4.5,
      comment: 'Excelente',
      helpful_votes: 2,
      unhelpful_votes: 1,
      viewer_vote: null,
    }
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input) === '/api/reviews/top'
        ? ({ ok: true, json: async () => [destaque] } as Response)
        : ({ ok: true, json: async () => ({}) } as Response),
    )
    render(
      <TopReviews
        email="ana@example.com"
        viewerId={null}
        onSelecionarUsuario={vi.fn()}
        onSelecionarRestaurante={vi.fn()}
      />,
    )

    await user.click(
      await screen.findByRole('button', { name: 'Marcar avaliação como útil' }),
    )
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/reviews/3/votes',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(fetch).toHaveBeenCalledTimes(3)
    })
  })
})

describe('lista de seguidores e seguindo', () => {
  it('mostra usuários, abre perfil e fecha lista', async () => {
    const user = userEvent.setup()
    const aoSelecionarUsuario = vi.fn()
    const aoFechar = vi.fn()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 9, username: 'caio' }],
    } as Response)
    render(
      <ListaRelacoes
        userId={6}
        tipo="followers"
        aoSelecionarUsuario={aoSelecionarUsuario}
        aoFechar={aoFechar}
      />,
    )

    await user.click(await screen.findByRole('button', { name: 'caio' }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(aoSelecionarUsuario).toHaveBeenCalledWith(9)
    expect(aoFechar).toHaveBeenCalledOnce()
    expect(screen.getByText('Seguidores')).toBeInTheDocument()
  })

  it('exibe lista vazia e falha da API', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
    const props = {
      userId: 6,
      aoSelecionarUsuario: vi.fn(),
      aoFechar: vi.fn(),
    }
    const { rerender } = render(<ListaRelacoes {...props} tipo="following" />)
    expect(await screen.findByText('Nenhum usuário nesta lista.')).toBeVisible()

    rerender(<ListaRelacoes {...props} tipo="followers" />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar esta lista.',
    )
  })
})

describe('busca de usuários', () => {
  it('lista matches, seleciona um perfil e limpa a consulta', async () => {
    const user = userEvent.setup()
    const onSelecionarUsuario = vi.fn()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 12, username: 'bia lima', review_count: 3 }],
    } as Response)
    render(<BuscaUsuarios onSelecionarUsuario={onSelecionarUsuario} />)

    await user.type(screen.getByRole('searchbox', { name: 'Busque um usuário' }), 'bia')
    await user.click(screen.getByRole('button', { name: 'Buscar usuário' }))
    await user.click(await screen.findByRole('button', { name: /bia lima/ }))
    expect(onSelecionarUsuario).toHaveBeenCalledWith(12)
    expect(fetch).toHaveBeenCalledWith('/api/users?name=bia')

    await user.clear(screen.getByRole('searchbox', { name: 'Busque um usuário' }))
    expect(screen.queryByText('bia lima')).not.toBeInTheDocument()
  })

  it('mostra nenhum resultado e erro da busca', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
    render(<BuscaUsuarios onSelecionarUsuario={vi.fn()} />)
    const input = screen.getByRole('searchbox', { name: 'Busque um usuário' })
    await user.type(input, 'ninguém')
    await user.click(screen.getByRole('button', { name: 'Buscar usuário' }))
    expect(await screen.findByText('Nenhum usuário encontrado.')).toBeVisible()

    await user.clear(input)
    await user.type(input, 'falha')
    await user.click(screen.getByRole('button', { name: 'Buscar usuário' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível buscar usuários.',
    )
  })
})
