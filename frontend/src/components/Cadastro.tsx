import { useState, type FormEvent } from 'react'
import { cadastrarUsuario } from '../usuarios'

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
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <form
        onSubmit={cadastrar}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">RestauranK</h1>
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

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          className="w-full rounded bg-amber-400 py-2 font-medium text-zinc-900 hover:bg-amber-300"
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
