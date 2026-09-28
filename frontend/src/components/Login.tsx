import { useState, type FormEvent } from 'react'
import { validarLogin } from '../usuarios'
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream p-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-xl border border-brand-brown/10 bg-brand-cream p-6 shadow-lg"
      >
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <p className="mb-4 text-center text-sm text-zinc-500">Entrar</p>

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

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded bg-brand-tomato py-2 font-medium text-white hover:bg-brand-brown"
        >
          {carregando ? 'Conectando...' : 'Entrar'}
        </button>

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
