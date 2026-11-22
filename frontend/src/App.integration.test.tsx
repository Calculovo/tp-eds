import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { cadastrarUsuario } from './usuarios'

type ReviewFixture = {
  id: number
  user_id: number
  username: string
  email: string
  rating: number
  comment: string | null
  helpful_votes: number
  unhelpful_votes: number
  viewer_vote: boolean | null
}

const restaurant = {
  id: 8,
  name: 'Café Central',
  category: 'Café',
  image_url: '/cafe.jpg',
  average_rating: null as number | null,
  review_count: 0,
  rating_counts: [0, 0, 0, 0, 0],
}

let reviews: ReviewFixture[]
let requests: { url: string; init?: RequestInit }[]

function response(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response
}

function mockRestaurantApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      requests.push({ url, init })
      const parsed = new URL(url, 'http://localhost')

      if (url === '/api/users' && init?.method === 'POST') {
        return response({ id: 1 }, true)
      }
      if (parsed.pathname === '/api/users' && parsed.searchParams.has('email')) {
        return response([{ id: 1, email: parsed.searchParams.get('email') }])
      }
      if (parsed.pathname === '/api/users' && parsed.searchParams.has('name')) {
        return response([{ id: 1, username: 'ana', review_count: reviews.length }])
      }
      if (parsed.pathname === '/api/restaurants') {
        return response([restaurant])
      }
      if (parsed.pathname === '/api/reviews/top') return response([])
      if (
        parsed.pathname === '/api/restaurants/8/reviews' &&
        init?.method !== 'POST'
      ) {
        return response(
          reviews.filter((review) => review.comment?.trim() || review.user_id === 1),
        )
      }
      if (parsed.pathname === '/api/restaurants/8' && !init?.method) {
        return response(restaurant)
      }
      if (parsed.pathname === '/api/restaurants/8/reviews' && init?.method === 'POST') {
        const body = JSON.parse(String(init.body)) as {
          email: string
          rating: number
          comment: string | null
        }
        const existing = reviews.find(
          (review) => review.email === body.email && restaurant.id === 8,
        )
        if (existing) {
          existing.rating = body.rating
          existing.comment = body.comment
        } else {
          reviews.push({
            id: reviews.length + 20,
            user_id: 1,
            username: 'ana',
            email: body.email,
            rating: body.rating,
            comment: body.comment,
            helpful_votes: 0,
            unhelpful_votes: 0,
            viewer_vote: null,
          })
        }
        restaurant.average_rating =
          reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        restaurant.review_count = reviews.length
        restaurant.rating_counts = [0, 0, 0, 0, 0]
        restaurant.rating_counts[Math.round(body.rating) - 1] = reviews.length
        return response({ id: existing?.id ?? reviews.at(-1)?.id })
      }
      if (parsed.pathname === '/api/users/1') {
        return response({
          id: 1,
          username: 'ana',
          followers_count: 0,
          following_count: 0,
          is_following: false,
          reviews: reviews.map((review) => ({
            ...review,
            restaurant_id: 8,
            restaurant_name: restaurant.name,
            restaurant_image_url: restaurant.image_url,
          })),
        })
      }
      return response({ detail: 'not found' }, false)
    }),
  )
}

async function login() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
  await user.type(screen.getByLabelText('Senha'), 'senha')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
  await screen.findByRole('searchbox', { name: 'Busque um restaurante' })
}

beforeEach(() => {
  reviews = []
  requests = []
  restaurant.average_rating = null
  restaurant.review_count = 0
  restaurant.rating_counts = [0, 0, 0, 0, 0]
  cadastrarUsuario('Ana', 'Lima', 'ana@example.com', 'senha')
  mockRestaurantApi()
})

describe('integração da aplicação autenticada', () => {
  it('cadastra usuário pela interface e então permite entrar', async () => {
    const user = userEvent.setup()
    localStorage.clear()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Não tem conta? Cadastre-se' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Sobrenome'), 'Lima')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(await screen.findByText('Entrar', { selector: 'p' })).toBeVisible()

    await login()
    expect(screen.getByRole('button', { name: 'Meu perfil' })).toBeEnabled()
    expect(requests).toContainEqual(
      expect.objectContaining({
        url: '/api/users',
        init: expect.objectContaining({ method: 'POST' }),
      }),
    )
  })

  it('cria e edita uma review pela página do restaurante', async () => {
    const user = userEvent.setup()
    render(<App />)
    await login()
    await user.click(await screen.findByRole('button', { name: /Café Central/ }))
    await user.click(await screen.findByRole('button', { name: 'Avaliar este restaurante' }))

    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Sua avaliação'), 'Excelente café')
    await user.click(dialog.getByRole('button', { name: '5 estrelas' }))
    await user.click(dialog.getByRole('button', { name: 'Salvar avaliação' }))
    expect(await screen.findByText('Excelente café', { exact: true })).toBeVisible()
    expect(reviews).toHaveLength(1)

    const review = screen.getByRole('article')
    await user.click(within(review).getByRole('button', { name: 'Editar avaliação' }))
    const editor = within(screen.getByRole('dialog'))
    expect(editor.getByLabelText('Sua avaliação')).toHaveValue('Excelente café')
    expect(editor.getByRole('button', { name: '5 estrelas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.clear(editor.getByLabelText('Sua avaliação'))
    await user.type(editor.getByLabelText('Sua avaliação'), 'Atualizada')
    await user.click(editor.getByRole('button', { name: 'Salvar avaliação' }))

    expect(await screen.findByText('Atualizada', { exact: true })).toBeVisible()
    expect(reviews).toHaveLength(1)
    expect(reviews[0].comment).toBe('Atualizada')
    expect(
      requests.some(
        ({ url, init }) =>
          url === '/api/restaurants/8/reviews' && init?.method === 'POST',
      ),
    ).toBe(true)
  })

  it('abre o perfil próprio, edita uma review e retorna à página do restaurante', async () => {
    const user = userEvent.setup()
    reviews.push({
      id: 13,
      user_id: 1,
      username: 'ana',
      email: 'ana@example.com',
      rating: 3,
      comment: 'Antes',
      helpful_votes: 0,
      unhelpful_votes: 0,
      viewer_vote: null,
    })
    render(<App />)
    await login()
    await user.click(screen.getByRole('button', { name: 'Meu perfil' }))
    await user.click(await screen.findByRole('button', { name: 'Editar avaliação' }))

    const editor = within(await screen.findByRole('dialog'))
    expect(editor.getByLabelText('Sua avaliação')).toHaveValue('Antes')
    await user.clear(editor.getByLabelText('Sua avaliação'))
    await user.type(editor.getByLabelText('Sua avaliação'), 'Pelo perfil')
    await user.click(editor.getByRole('button', { name: 'Salvar avaliação' }))
    expect(await screen.findByRole('button', { name: 'Voltar aos resultados' })).toBeVisible()
    expect(reviews).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Voltar aos resultados' }))
    expect(await screen.findByRole('heading', { name: 'ana' })).toBeVisible()
  })

  it('a busca de restaurante no perfil retorna à home e aplica o termo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await login()
    await user.click(screen.getByRole('button', { name: 'Meu perfil' }))
    await screen.findByRole('heading', { name: 'ana' })
    await user.type(
      screen.getByRole('searchbox', { name: 'Busque um restaurante' }),
      'Cafe',
    )
    await user.click(screen.getByRole('button', { name: 'Buscar restaurante' }))

    expect(await screen.findByRole('heading', { name: 'Restaurantes' })).toBeVisible()
    await waitFor(() => {
      expect(requests).toContainEqual(
        expect.objectContaining({ url: '/api/restaurants?name=Cafe' }),
      )
    })
  })

  it('busca e abre um perfil e volta à página inicial pela logo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await login()
    await user.type(screen.getByRole('searchbox', { name: 'Busque um usuário' }), 'ana')
    await user.click(screen.getByRole('button', { name: 'Buscar usuário' }))
    await user.click(await screen.findByRole('button', { name: /^ana/ }))
    expect(await screen.findByRole('heading', { name: 'ana' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Ir para a página inicial' }))
    expect(await screen.findByRole('heading', { name: 'Restaurantes' })).toBeVisible()
  })

  it('mostra erro se a API não aceitar a criação da sessão', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation(async (input, init) =>
      String(input) === '/api/users' && init?.method === 'POST'
        ? response({ detail: 'offline' }, false)
        : response([], true),
    )
    render(<App />)
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Não foi possível conectar ao servidor. Tente novamente.')).toBeVisible()
  })
})
