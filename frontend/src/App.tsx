import { useState } from 'react'
import Cadastro from './components/Cadastro'
import ListaRestaurantes from './components/ListaRestaurantes'
import Login from './components/Login'

// As 3 telas possíveis do app nesta simulação.
type Tela = 'login' | 'cadastro' | 'logado'

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [emailLogado, setEmailLogado] = useState('')

  if (tela === 'cadastro') {
    return <Cadastro onIrParaLogin={() => setTela('login')} />
  }

  if (tela === 'logado') {
    return (
      <ListaRestaurantes
        email={emailLogado}
        onLogout={() => {
          setEmailLogado('')
          setTela('login')
        }}
      />
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
