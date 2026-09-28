import { useState, type FormEvent } from 'react'
import { cadastrarUsuario } from '../usuarios'
import BrandLogo from './BrandLogo'

type CadastroProps = {
  onIrParaLogin: () => void
}

function Cadastro({ onIrParaLogin }: CadastroProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function cadastrar(evento: FormEvent) {
    evento.preventDefault()

    // Salva o usuário no localStorage (só no navegador, some se limpar os dados).
    const mensagemErro = cadastrarUsuario(email, senha)
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    onIrParaLogin()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-brand-cream p-4">
      <header className="absolute left-8 top-8">
        <BrandLogo />
      </header>
      <form
        onSubmit={cadastrar}
        className="w-full max-w-sm rounded-xl border border-brand-brown/10 bg-brand-cream p-6 shadow-lg"
      >
        <p className="mb-4 text-center text-sm text-zinc-500">Criar conta</p>

        <label className="mb-1 block text-sm" htmlFor="cadastro-email">
          E-mail
        </label>
        <input
          id="cadastro-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border px-3 py-2"
          required
        />

        <label className="mb-1 block text-sm" htmlFor="cadastro-senha">
          Senha
        </label>
        <input
          id="cadastro-senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mb-4 w-full rounded border px-3 py-2"
          required
        />

        {erro && <p className="mb-4 text-sm text-brand-tomato">{erro}</p>}

        <button
          type="submit"
          className="w-full rounded bg-brand-tomato py-2 font-medium text-white hover:bg-brand-brown"
        >
          Cadastrar
        </button>

        <button
          type="button"
          onClick={onIrParaLogin}
          className="mt-4 w-full text-sm text-zinc-600 underline"
        >
          Já tem conta? Entrar
        </button>
      </form>
    </main>
  )
}

export default Cadastro
