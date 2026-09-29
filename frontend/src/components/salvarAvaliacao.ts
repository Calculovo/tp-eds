export async function salvarAvaliacao(
  restaurantId: number,
  email: string,
  rating: number,
  comment: string,
): Promise<void> {
  const resposta = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      rating,
      comment: comment.trim() || null,
    }),
  })
  if (!resposta.ok) {
    throw new Error('Não foi possível salvar sua avaliação.')
  }
}
