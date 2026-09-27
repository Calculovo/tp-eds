import { useState } from 'react'
import Cadastro from './components/Cadastro'
import ListaRestaurantes from './components/ListaRestaurantes'
import Login from './components/Login'

type Tela = 'login' | 'cadastro' | 'logado'

function App() {
  const [tela, setTela] = useState<Tela>('login')
  const [emailLogado, setEmailLogado] = useState('')
  const [nomeLogado, setNomeLogado] = useState('')

  if (tela === 'cadastro') {
    return (
      <Cadastro
        onIrParaLogin={() => setTela('login')}
        onCadastroSucesso={(nomeCadastrado) => {
          // Recebe o nome que foi digitado no cadastro
          setNomeLogado(nomeCadastrado)
        }}
      />
    )
  }

  if (tela === 'logado') {
    // Se por acaso o nomeLogado estiver vazio (contas antigas), geramos um nome bonito baseado no e-mail
    const nomeExibicao = nomeLogado || emailLogado.split('@')[0]
      .split('.')
      .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(' ')

    return (
      <ListaRestaurantes
        email={emailLogado}
        nome={nomeExibicao} // Sempre envia um nome formatado, nunca o e-mail cru
        onLogout={() => {
          setEmailLogado('')
          setNomeLogado('')
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
        
        // Se já temos um nome guardado do cadastro recente, usamos ele.
        // Se não (contas antigas), pegamos o e-mail e formatamos um nome elegante!
        if (!nomeLogado) {
          const partes = email.split('@')[0].split('.')
          const nomeFormatado = partes
            .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
            .join(' ')
          setNomeLogado(nomeFormatado)
        }
        
        setTela('logado')
      }}
    />
  )
}

export default App
