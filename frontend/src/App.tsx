import { useState } from 'react'
import Cadastro from './components/Cadastro'
import ListaRestaurantes from './components/ListaRestaurantes'
import Login from './components/Login'

// As 3 telas possíveis do app nesta simulação.
type Tela = 'login' | 'cadastro' | 'logado'

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [emailLogado, setEmailLogado] = useState('')
  const [restauranteSelecionado, setRestauranteSelecionado] = useState<string | null>(null)

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
              {restauranteSelecionado}
            </h1>
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
