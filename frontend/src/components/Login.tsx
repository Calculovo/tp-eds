import { useState, type FormEvent } from 'react'
import { validarLogin } from '../usuarios'

type LoginProps = {
  onIrParaCadastro: () => void
  onLoginSucesso: (email: string) => void
}

function Login({ onIrParaCadastro, onLoginSucesso }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function entrar(evento: FormEvent) {
    evento.preventDefault()

    const deuCerto = validarLogin(email, senha)
    if (!deuCerto) {
      setErro('E-mail ou senha inválidos. Cadastre-se primeiro.')
      return
    }

    onLoginSucesso(email)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">RestauranK</h1>
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

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          className="w-full rounded bg-amber-400 py-2 font-medium text-zinc-900 hover:bg-amber-300"
        >
          Entrar
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
