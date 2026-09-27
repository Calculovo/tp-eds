import { useState, type FormEvent } from 'react'
import { cadastrarUsuario } from '../usuarios'

type CadastroProps = {
  onIrParaLogin: () => void
  onCadastroSucesso: (nome: string) => void // Adicionado
}

function Cadastro({ onIrParaLogin, onCadastroSucesso }: CadastroProps) {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function cadastrar(evento: FormEvent) {
    evento.preventDefault()

    const mensagemErro = cadastrarUsuario(email, senha)
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }
    
    onCadastroSucesso(nome)
    onIrParaLogin()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <form
        onSubmit={cadastrar}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-6 text-center">
          <span className="inline-block rounded-xl bg-orange-500 p-2.5 text-xl shadow-lg mb-2">🍽️</span>
          <h1 className="text-2xl font-bold text-white">RestauranK</h1>
          <p className="text-sm text-zinc-400 mt-1">Crie sua nova conta</p>
        </div>

        <div className="space-y-4">
          {/* Nome e Sobrenome lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="cadastro-nome">
                Nome
              </label>
              <input
                id="cadastro-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="cadastro-sobrenome">
                Sobrenome
              </label>
              <input
                id="cadastro-sobrenome"
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                placeholder="Sobrenome"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="cadastro-email">
              E-mail
            </label>
            <input
              id="cadastro-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="cadastro-senha">
              Senha
            </label>
            <input
              id="cadastro-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>
        </div>

        {erro && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-xs text-red-400">
            {erro}
          </div>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.99]"
        >
          Cadastrar conta
        </button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onIrParaLogin}
            className="text-xs font-medium text-zinc-400 transition hover:text-orange-400"
          >
            Já tem uma conta? <span className="underline font-semibold">Entrar</span>
          </button>
        </div>
      </form>
    </main>
  )
}

export default Cadastro