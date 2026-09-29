import { useEffect, useState } from 'react'
import Cadastro from './components/Cadastro'
import ListaRestaurantes, {
  type Restaurante,
} from './components/ListaRestaurantes'
import Login from './components/Login'
import PerfilUsuario from './components/PerfilUsuario'
import BrandLogo from './components/BrandLogo'

// As 3 telas possíveis do app nesta simulação.
type Tela = 'login' | 'cadastro' | 'logado'

type AvaliacaoRestaurante = {
  id: number
  user_id: number
  username: string
  email: string
  rating: number
  comment: string
  helpful_votes: number
  unhelpful_votes: number
  viewer_vote: boolean | null
}

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [emailLogado, setEmailLogado] = useState('')
  const [viewerId, setViewerId] = useState<number | null>(null)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null)
  const [restauranteSelecionado, setRestauranteSelecionado] =
    useState<Restaurante | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoRestaurante[]>([])
  const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false)
  const [erroAvaliacoes, setErroAvaliacoes] = useState('')
  const [votosEmEnvio, setVotosEmEnvio] = useState<number[]>([])
  const [errosVoto, setErrosVoto] = useState<Record<number, string>>({})

  useEffect(() => {
    const restauranteId = restauranteSelecionado?.id
    if (restauranteId === undefined) {
      setAvaliacoes([])
      setCarregandoAvaliacoes(false)
      return
    }

    let ativa = true
    setCarregandoAvaliacoes(true)
    setErroAvaliacoes('')
    const viewer = viewerId === null ? '' : `?viewer_id=${viewerId}`
    fetch(`/api/restaurants/${restauranteId}/reviews${viewer}`)
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar as avaliações.')
        }
        return resposta.json() as Promise<AvaliacaoRestaurante[]>
      })
      .then((resultados) => {
        if (ativa) setAvaliacoes(resultados)
      })
      .catch(() => {
        if (ativa) {
          setAvaliacoes([])
          setErroAvaliacoes('Não foi possível carregar os comentários.')
        }
      })
      .finally(() => {
        if (ativa) setCarregandoAvaliacoes(false)
      })

    return () => {
      ativa = false
    }
  }, [restauranteSelecionado?.id, viewerId])

  useEffect(() => {
    if (!emailLogado) {
      setViewerId(null)
      return
    }
    let ativa = true
    fetch(`/api/users?email=${encodeURIComponent(emailLogado)}`)
      .then((resposta) => resposta.json() as Promise<{ id: number }[]>)
      .then((usuarios) => {
        if (ativa) setViewerId(usuarios[0]?.id ?? null)
      })
      .catch(() => {
        if (ativa) setViewerId(null)
      })
    return () => {
      ativa = false
    }
  }, [emailLogado])

  async function votarNaAvaliacao(reviewId: number, isHelpful: boolean) {
    setVotosEmEnvio((atuais) => [...atuais, reviewId])
    setErrosVoto((atuais) => {
      const proximos = { ...atuais }
      delete proximos[reviewId]
      return proximos
    })

    try {
      const resposta = await fetch(`/api/reviews/${reviewId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogado, is_helpful: isHelpful }),
      })
      if (!resposta.ok) {
        throw new Error('Não foi possível registrar seu voto.')
      }
      setAvaliacoes((atuais) =>
        atuais.map((avaliacao) => {
          if (avaliacao.id !== reviewId) return avaliacao
          const votoAnterior = avaliacao.viewer_vote
          return {
            ...avaliacao,
            helpful_votes:
              avaliacao.helpful_votes +
              Number(isHelpful) -
              Number(votoAnterior === true),
            unhelpful_votes:
              avaliacao.unhelpful_votes +
              Number(!isHelpful) -
              Number(votoAnterior === false),
            viewer_vote: isHelpful,
          }
        }),
      )
    } catch {
      setErrosVoto((atuais) => ({
        ...atuais,
        [reviewId]: 'Não foi possível registrar seu voto. Tente novamente.',
      }))
    } finally {
      setVotosEmEnvio((atuais) => atuais.filter((id) => id !== reviewId))
    }
  }

  if (tela === 'cadastro') {
    return <Cadastro onIrParaLogin={() => setTela('login')} />
  }

  if (tela === 'logado' && usuarioSelecionado !== null) {
    return (
      <PerfilUsuario
        key={usuarioSelecionado}
        userId={usuarioSelecionado}
        viewerId={viewerId}
        onVoltar={() => setUsuarioSelecionado(null)}
        onSelecionarUsuario={setUsuarioSelecionado}
      />
    )
  }

  if (tela === 'logado') {
    return (
      <>
        <div hidden={restauranteSelecionado !== null}>
          <ListaRestaurantes
            email={emailLogado}
            viewerId={viewerId}
            onSelecionarRestaurante={setRestauranteSelecionado}
            onSelecionarUsuario={setUsuarioSelecionado}
            onLogout={() => {
              setRestauranteSelecionado(null)
              setUsuarioSelecionado(null)
              setEmailLogado('')
              setTela('login')
            }}
          />
        </div>
        {restauranteSelecionado !== null && (
          <main className="mx-auto min-h-screen max-w-7xl bg-brand-cream p-5 sm:p-8 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:content-start lg:gap-x-10">
            <header className="mb-8 flex items-start justify-between gap-4 lg:col-span-2">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setRestauranteSelecionado(null)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-tomato transition hover:bg-brand-tomato/10"
              >
                Voltar aos resultados
              </button>
            </header>
            <section className="mb-2 lg:col-span-2">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-tomato">
                {restauranteSelecionado.categoria}
              </p>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-brand-brown sm:text-5xl">
                  {restauranteSelecionado.nome}
                </h1>
                {restauranteSelecionado.mediaAvaliacoes !== null && (
                  <p className="mb-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-amber-600 shadow-sm">
                    ★ {restauranteSelecionado.mediaAvaliacoes.toFixed(1)}
                    <span className="ml-1 font-medium text-zinc-500">
                      ({restauranteSelecionado.quantidadeAvaliacoes}{' '}
                      {restauranteSelecionado.quantidadeAvaliacoes === 1
                        ? 'avaliação'
                        : 'avaliações'})
                    </span>
                  </p>
                )}
              </div>
            </section>
            <div className="min-w-0">
              <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:h-72 lg:h-[22rem]">
                {restauranteSelecionado.imagem ? (
                  <img
                    src={restauranteSelecionado.imagem}
                    alt={restauranteSelecionado.nome}
                    className="h-full w-full rounded-xl object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    Imagem indisponível
                  </div>
                )}
              </div>
              <section
                aria-labelledby="distribuicao-titulo"
                className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h2
                  id="distribuicao-titulo"
                  className="text-xl font-semibold text-brand-brown"
                >
                  Avaliações por estrelas
                </h2>
                <div className="mt-4 space-y-2">
                  {restauranteSelecionado.contagemAvaliacoes.map(
                    (quantidade, indice) => {
                      const estrelas = indice + 1
                      const maiorContagem = Math.max(
                        1,
                        ...restauranteSelecionado.contagemAvaliacoes,
                      )
                      const largura = (quantidade / maiorContagem) * 100

                      return (
                        <div
                          key={estrelas}
                          className="grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-3"
                        >
                          <span
                            role="img"
                            aria-label={`${estrelas} estrela${estrelas === 1 ? '' : 's'}`}
                            className="whitespace-nowrap text-sm text-amber-500"
                          >
                            {'★'.repeat(estrelas)}
                          </span>
                          <div
                            role="progressbar"
                            aria-label={`${quantidade} avaliações com ${estrelas} estrela${estrelas === 1 ? '' : 's'}`}
                            aria-valuemin={0}
                            aria-valuemax={maiorContagem}
                            aria-valuenow={quantidade}
                            className="h-2 overflow-hidden rounded-sm bg-zinc-200"
                          >
                            <div
                              className="h-full bg-brand-tomato"
                              style={{ width: `${largura}%` }}
                            />
                          </div>
                          <span className="text-right text-sm font-medium text-zinc-700">
                            {quantidade}
                          </span>
                        </div>
                      )
                    },
                  )}
                </div>
                {restauranteSelecionado.quantidadeAvaliacoes === 0 && (
                  <p className="mt-5 text-sm text-zinc-600">
                    Ainda não há avaliações para este restaurante.
                  </p>
                )}
              </section>
            </div>
            <section
              aria-labelledby="comentarios-titulo"
              className="mt-8 min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:mt-0"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="comentarios-titulo" className="text-xl font-semibold text-brand-brown">
                  Comentários
                </h2>
                <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-zinc-600">
                  {avaliacoes.length}
                </span>
              </div>
              <div className="mt-4 max-h-[65vh] overflow-y-auto pr-2">
                {carregandoAvaliacoes && <p className="text-sm text-zinc-600">Carregando...</p>}
                {erroAvaliacoes && <p role="alert" className="text-sm text-brand-tomato">{erroAvaliacoes}</p>}
                {!carregandoAvaliacoes && !erroAvaliacoes && avaliacoes.length === 0 && (
                  <p className="text-sm text-zinc-600">Ainda não há comentários.</p>
                )}
                {avaliacoes.map((avaliacao) => (
                  <article key={avaliacao.id} className="border-b border-zinc-200 py-4 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setUsuarioSelecionado(avaliacao.user_id)}
                        className="break-all text-left text-sm font-medium text-brand-tomato hover:text-brand-brown hover:underline"
                      >
                        {avaliacao.username}
                      </button>
                      <p className="shrink-0 text-sm font-semibold text-amber-600">★ {avaliacao.rating.toFixed(1)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{avaliacao.comment}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => votarNaAvaliacao(avaliacao.id, true)}
                        disabled={votosEmEnvio.includes(avaliacao.id)}
                        aria-label="Marcar avaliação como útil"
                        aria-pressed={avaliacao.viewer_vote === true}
                        className={`rounded border px-3 py-1 text-sm transition disabled:opacity-60 ${
                          avaliacao.viewer_vote === true
                            ? 'border-brand-tomato bg-brand-tomato text-white'
                            : 'border-zinc-300 text-zinc-700 hover:border-brand-tomato hover:text-brand-tomato'
                        }`}
                      >
                        ▲ Útil ({avaliacao.helpful_votes})
                      </button>
                      <button
                        type="button"
                        onClick={() => votarNaAvaliacao(avaliacao.id, false)}
                        disabled={votosEmEnvio.includes(avaliacao.id)}
                        aria-label="Marcar avaliação como não útil"
                        aria-pressed={avaliacao.viewer_vote === false}
                        className={`rounded border px-3 py-1 text-sm transition disabled:opacity-60 ${
                          avaliacao.viewer_vote === false
                            ? 'border-brand-brown bg-brand-brown text-white'
                            : 'border-zinc-300 text-zinc-700 hover:border-brand-brown hover:text-brand-brown'
                        }`}
                      >
                        ▼ Não útil ({avaliacao.unhelpful_votes})
                      </button>
                    </div>
                    {errosVoto[avaliacao.id] && (
                      <p role="alert" className="mt-2 text-sm text-brand-tomato">
                        {errosVoto[avaliacao.id]}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </main>
        )}
      </>
    )
  }

  return (
    <Login
      onIrParaCadastro={() => setTela('cadastro')}
      onLoginSucesso={async (email) => {
        const resposta = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!resposta.ok) {
          throw new Error('Não foi possível preparar a conta no servidor.')
        }
        setEmailLogado(email)
        setTela('logado')
      }}
    />
  )
}

export default App
