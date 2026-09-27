import { useState, type FormEvent } from 'react'
import { validarLogin } from '../usuarios'

type LoginProps = {
  onIrParaCadastro: () => void
  onLoginSucesso: (email: string, nome?: string) => void
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
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* 1. Imagem de Fundo de Tela Cheia com Overlay Escuro */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1601972602288-3be527b4f18a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Ambiente de restaurante aconchegante"
          className="h-full w-full object-cover object-center filter brightness-50"
        />
        {/* Camada gradiente escura para dar contraste e elegância */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/40" />
      </div>

      {/* 2. Caixa de Login Centralizada e Flutuante (Transposta sobre o banner) */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-700/50 bg-zinc-900/75 p-8 shadow-2xl backdrop-blur-xl">
        {/* Cabeçalho com Logo e a Frase Convidativa */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-2xl bg-orange-500 p-3 text-2xl shadow-lg shadow-orange-500/30 mb-3">
            🍽️
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">RestauranK</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Com o <span className="font-semibold text-orange-400">RestauranK</span>, você opina e acompanha as melhores avaliações.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          {erro && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-xs text-red-400">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 active:scale-[0.99]"
          >
            Entrar na conta
          </button>
        </form>

        {/* Rodapé para ir ao Cadastro */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onIrParaCadastro}
            className="text-xs font-medium text-zinc-400 transition hover:text-orange-400"
          >
            Não tem uma conta? <span className="underline font-semibold">Cadastre-se</span>
          </button>
        </div>
      </div>
    </main>
  )
}

export default Login