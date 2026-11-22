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
