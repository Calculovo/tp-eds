import { useEffect, useState } from 'react'
import Cadastro from './components/Cadastro'
import ListaRestaurantes, {
  type Restaurante,
} from './components/ListaRestaurantes'
import Login from './components/Login'

// As 3 telas possíveis do app nesta simulação.
type Tela = 'login' | 'cadastro' | 'logado'

type AvaliacaoRestaurante = {
  id: number
  email: string
  rating: number
  comment: string
}

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [emailLogado, setEmailLogado] = useState('')
  const [restauranteSelecionado, setRestauranteSelecionado] =
    useState<Restaurante | null>(null)
  const [, setAvaliacoes] = useState<AvaliacaoRestaurante[]>([])

  useEffect(() => {
    const restauranteId = restauranteSelecionado?.id
    if (restauranteId === undefined) return

    let ativa = true
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
        if (ativa) setAvaliacoes([])
      })

    return () => {
      ativa = false
    }
  }, [restauranteSelecionado?.id])

  if (tela === 'cadastro') {
    return <Cadastro onIrParaLogin={() => setTela('login')} />
  }

  if (tela === 'logado') {
    return (
      <>
        <div hidden={restauranteSelecionado !== null}>
          <ListaRestaurantes
            email={emailLogado}
            onSelecionarRestaurante={setRestauranteSelecionado}
            onLogout={() => {
              setRestauranteSelecionado(null)
              setEmailLogado('')
              setTela('login')
            }}
          />
        </div>
        {restauranteSelecionado !== null && (
          <main className="min-h-screen bg-zinc-100 p-8">
            <button
              type="button"
              onClick={() => setRestauranteSelecionado(null)}
              className="mb-8 rounded px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
            >
              Voltar aos resultados
            </button>
            <h1 className="text-3xl font-bold text-zinc-900">
              {restauranteSelecionado.nome}
            </h1>
            <div className="mt-8 max-w-2xl">
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
                className="mt-6 max-w-lg"
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
          </main>
        )}
      </>
    )
  }

  return (
    <Login
      onIrParaCadastro={() => setTela('cadastro')}
      onLoginSucesso={(email) => {
        setEmailLogado(email)
        setTela('logado')
      }}
    />
  )
}

export default App
