import { useState, type FormEvent } from 'react'
import { validarLogin, redefinirSenha } from '../usuarios'
import BrandLogo from './BrandLogo'

type LoginProps = {
  onIrParaCadastro: () => void
  onLoginSucesso: (email: string) => Promise<void>
}

function Login({ onIrParaCadastro, onLoginSucesso }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [modoRecuperacao, setModoRecuperacao] = useState(false)

  async function entrar(evento: FormEvent) {
    evento.preventDefault()

    const deuCerto = validarLogin(email, senha)
    if (!deuCerto) {
      setErro('E-mail ou senha inválidos. Cadastre-se primeiro.')
      return
    }

    setCarregando(true)
    setErro('')
    try {
      await onLoginSucesso(email)
    } catch {
      setErro('Não foi possível conectar ao servidor. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  async function recuperar(evento: FormEvent) {
    evento.preventDefault()
    setCarregando(true)
    setErro('')
    setSucesso('')

    const mensagemErro = await redefinirSenha(email, senha)
    
    if (mensagemErro) {
      setErro(mensagemErro)
    } else {
      setSucesso('Senha alterada com sucesso! Agora você pode entrar.')
      setModoRecuperacao(false)
      setSenha('') // Limpa a senha por segurança
    }
    setCarregando(false)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-cream p-4">
      <header className="absolute left-8 top-8">
        <BrandLogo showTagline />
      </header>
      <form
        onSubmit={modoRecuperacao ? recuperar : entrar}
        className="w-full max-w-sm rounded-xl border border-brand-brown/10 bg-brand-cream p-6 shadow-lg"
      >
        <p className="mb-4 text-center text-sm text-zinc-500">
          {modoRecuperacao ? 'Redefinir Senha' : 'Entrar'}
        </p>

        <label className="mb-1 block text-sm" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border px-3 py-2"
          required
        />

        <label className="mb-1 block text-sm" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mb-4 w-full rounded border px-3 py-2"
          required
        />

        {erro && <p className="mb-4 text-sm text-brand-tomato">{erro}</p>}

        {sucesso && <p className="mb-4 text-sm text-green-600">{sucesso}</p>}

<button
  type="submit"
  disabled={carregando}
  className="w-full rounded bg-brand-tomato py-2 font-medium text-white hover:bg-brand-brown"
>
  {carregando ? 'Aguarde...' : (modoRecuperacao ? 'Salvar Nova Senha' : 'Entrar')}
</button>

{!modoRecuperacao && (
  <button
    type="button"
    onClick={() => {
      setModoRecuperacao(true)
      setErro('')
      setSucesso('')
    }}
    className="mt-4 w-full text-sm text-zinc-600 underline"
  >
    Esqueci minha senha
  </button>
)}

{modoRecuperacao && (
          <button
            type="button"
            onClick={() => {
              setModoRecuperacao(false)
              setErro('')
              setSucesso('')
            }}
            className="mt-4 w-full text-sm text-zinc-600 underline"
          >
            Voltar para o login
          </button>
        )}

        <button
          type="button"
          onClick={onIrParaCadastro}
          className="mt-4 w-full text-sm text-zinc-600 underline"
        >
          Não tem conta? Cadastre-se
        </button>
      </form>
    </main>
  )
}

export default Login
