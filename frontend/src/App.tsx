import { useEffect, useState } from 'react'
import Cadastro from './components/Cadastro'
import ListaRestaurantes, {
  type Restaurante,
} from './components/ListaRestaurantes'
import Login from './components/Login'
import PerfilUsuario from './components/PerfilUsuario'

// As 3 telas possíveis do app nesta simulação.
type Tela = 'login' | 'cadastro' | 'logado'

type AvaliacaoRestaurante = {
  id: number
  user_id: number
  username: string
  email: string
  rating: number
  comment: string
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
    fetch(`/api/restaurants/${restauranteId}/reviews`)
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
  }, [restauranteSelecionado?.id])

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
          <main className="min-h-screen bg-zinc-100 p-8 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:content-start lg:gap-x-8">
            <button
              type="button"
              onClick={() => setRestauranteSelecionado(null)}
              className="mb-8 rounded px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50 lg:col-span-2"
            >
              Voltar aos resultados
            </button>
            <h1 className="text-3xl font-bold text-zinc-900 lg:col-span-2">
              {restauranteSelecionado.nome}
            </h1>
            <div className="mt-8 max-w-2xl lg:contents">
              <div className="aspect-[16/9] overflow-hidden rounded border border-zinc-200 bg-white">
                {restauranteSelecionado.imagem ? (
                  <img
                    src={restauranteSelecionado.imagem}
                    alt={restauranteSelecionado.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    Imagem indisponível
                  </div>
                )}
              </div>
              <section
                aria-labelledby="distribuicao-titulo"
                className="mt-6 max-w-lg lg:col-start-1 lg:row-start-4"
              >
                <h2
                  id="distribuicao-titulo"
                  className="text-xl font-semibold text-zinc-900"
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
                              className="h-full bg-emerald-700"
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
              className="mt-8 min-w-0 lg:col-start-2 lg:row-start-3"
            >
              <h2 id="comentarios-titulo" className="text-xl font-semibold text-zinc-900">
                Comentários
              </h2>
              <div className="mt-4 max-h-[65vh] overflow-y-auto pr-2">
                {carregandoAvaliacoes && <p className="text-sm text-zinc-600">Carregando...</p>}
                {erroAvaliacoes && <p role="alert" className="text-sm text-red-700">{erroAvaliacoes}</p>}
                {!carregandoAvaliacoes && !erroAvaliacoes && avaliacoes.length === 0 && (
                  <p className="text-sm text-zinc-600">Ainda não há comentários.</p>
                )}
                {avaliacoes.map((avaliacao) => (
                  <article key={avaliacao.id} className="border-b border-zinc-200 py-4 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setUsuarioSelecionado(avaliacao.user_id)}
                        className="break-all text-left text-sm font-medium text-emerald-800 hover:underline"
                      >
                        {avaliacao.username}
                      </button>
                      <p className="shrink-0 text-sm font-semibold text-amber-600">★ {avaliacao.rating.toFixed(1)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{avaliacao.comment}</p>
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
