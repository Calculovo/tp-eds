import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PerfilUsuario from './PerfilUsuario'

const profile = {
  id: 5,
  username: 'ana',
  followers_count: 2,
  following_count: 1,
  is_following: false,
  reviews: [
    {
      id: 11,
      restaurant_id: 8,
      restaurant_name: 'Café Central',
      restaurant_image_url: '/cafe.jpg',
      rating: 4,
      comment: 'Muito bom',
      helpful_votes: 1,
      unhelpful_votes: 0,
      viewer_vote: null,
    },
  ],
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('perfil e histórico de avaliações', () => {
  it('permite editar a própria avaliação e navegar ao restaurante', async () => {
    const user = userEvent.setup()
    const onEditarAvaliacao = vi.fn()
    const onSelecionarRestaurante = vi.fn()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => profile,
    } as Response)
    render(
      <PerfilUsuario
        userId={5}
        viewerId={5}
        email="ana@example.com"
        onVoltar={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        onSelecionarRestaurante={onSelecionarRestaurante}
        onEditarAvaliacao={onEditarAvaliacao}
        erroCarregamentoRestaurante=""
      />,
    )

    await user.click(await screen.findByRole('button', { name: 'Café Central' }))
    await user.click(screen.getByRole('button', { name: 'Editar avaliação' }))
    expect(onSelecionarRestaurante).toHaveBeenCalledWith(8)
    expect(onEditarAvaliacao).toHaveBeenCalledWith(8, 4, 'Muito bom')
    expect(document.querySelector('img')).toHaveAttribute('src', '/cafe.jpg')
  })

  it('permite seguir e deixar de seguir outro usuário', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => profile } as Response)
      .mockResolvedValue({ ok: true } as Response)
    render(
      <PerfilUsuario
        userId={5}
        viewerId={2}
        email="viewer@example.com"
        onVoltar={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        onSelecionarRestaurante={vi.fn()}
        onEditarAvaliacao={vi.fn()}
        erroCarregamentoRestaurante=""
      />,
    )

    await user.click(await screen.findByRole('button', { name: 'Seguir' }))
    expect(await screen.findByRole('button', { name: 'Deixar de seguir' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Deixar de seguir' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Seguir' })).toBeVisible()
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/users/5/follow?follower_id=2',
      { method: 'POST' },
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      '/api/users/5/follow?follower_id=2',
      { method: 'DELETE' },
    )
  })

  it('abre listas de relações e seleciona outro perfil', async () => {
    const user = userEvent.setup()
    const onSelecionarUsuario = vi.fn()
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => profile } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 9, username: 'bia' }],
      } as Response)
    render(
      <PerfilUsuario
        userId={5}
        viewerId={5}
        email="ana@example.com"
        onVoltar={vi.fn()}
        onSelecionarUsuario={onSelecionarUsuario}
        onSelecionarRestaurante={vi.fn()}
        onEditarAvaliacao={vi.fn()}
        erroCarregamentoRestaurante=""
      />,
    )

    await user.click(await screen.findByRole('button', { name: /seguidores/ }))
    await user.click(await screen.findByRole('button', { name: 'bia' }))
    expect(onSelecionarUsuario).toHaveBeenCalledWith(9)
  })

  it('mostra erro no carregamento do perfil e oferece voltar', async () => {
    const onVoltar = vi.fn()
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    render(
      <PerfilUsuario
        userId={99}
        viewerId={null}
        email="ana@example.com"
        onVoltar={onVoltar}
        onSelecionarUsuario={vi.fn()}
        onSelecionarRestaurante={vi.fn()}
        onEditarAvaliacao={vi.fn()}
        erroCarregamentoRestaurante="Erro de restaurante"
      />,
    )

    expect(await screen.findByText('Não foi possível carregar o perfil.')).toBeVisible()
    expect(screen.getByText('Erro de restaurante')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(onVoltar).toHaveBeenCalledOnce()
  })

  it('renomeia o perfil próprio e permite cancelar a edição', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => profile } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
    render(
      <PerfilUsuario
        userId={5}
        viewerId={5}
        email="ana@example.com"
        onVoltar={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        onSelecionarRestaurante={vi.fn()}
        onEditarAvaliacao={vi.fn()}
        erroCarregamentoRestaurante=""
      />,
    )

    await user.click(await screen.findByRole('button', { name: 'Editar Nome' }))
    const campo = screen.getByRole('textbox')
    await user.clear(campo)
    await user.type(campo, 'Ana Lima')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeVisible()
    expect(fetch).toHaveBeenLastCalledWith('/api/users/5/username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Ana Lima' }),
    })

    await user.click(screen.getByRole('button', { name: 'Editar Nome' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('heading', { name: 'Ana Lima' })).toBeVisible()
  })

  it('fecha a edição sem pedido se o nome não mudou e mostra erro do servidor', async () => {
