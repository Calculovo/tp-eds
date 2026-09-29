import { type FormEvent } from 'react'
import BrandLogo from './BrandLogo'
import BuscaUsuarios from './BuscaUsuarios'

type NavegacaoLogadaProps = {
  email: string
  viewerId: number | null
  buscaRestaurante: string
  onBuscaRestauranteChange: (value: string) => void
  onBuscarRestaurante: (value: string) => void
  onSelecionarUsuario: (userId: number) => void
  onIrParaInicio: () => void
  onMeuPerfil: () => void
  onLogout: () => void
}

function NavegacaoLogada({
  email,
  viewerId,
  buscaRestaurante,
  onBuscaRestauranteChange,
  onBuscarRestaurante,
  onSelecionarUsuario,
  onIrParaInicio,
  onMeuPerfil,
  onLogout,
}: NavegacaoLogadaProps) {
  function enviarBusca(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onBuscarRestaurante(buscaRestaurante.trim())
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-brown/10 bg-brand-cream/95 px-4 py-3 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <div className="mr-auto">
          <button
            type="button"
            onClick={onIrParaInicio}
            aria-label="Ir para a página inicial"
            title="Página inicial"
            className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-tomato"
          >
            <BrandLogo />
          </button>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <BuscaUsuarios onSelecionarUsuario={onSelecionarUsuario} />
          <form
            onSubmit={enviarBusca}
            role="search"
            className="relative w-full sm:w-52"
          >
            <input
              type="search"
              value={buscaRestaurante}
              onChange={(event) => {
                onBuscaRestauranteChange(event.target.value)
              }}
              placeholder="Busque um restaurante"
              aria-label="Busque um restaurante"
              className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-4 pr-11 text-sm shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-brand-tomato focus:ring-2 focus:ring-brand-tomato/20"
            />
            <button
              type="submit"
              aria-label="Buscar restaurante"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-brand-tomato transition hover:bg-brand-tomato/10"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 stroke-current"
                strokeWidth="2"
              >
                <circle cx="10.8" cy="10.8" r="6.3" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          <button
            type="button"
            onClick={onMeuPerfil}
            disabled={viewerId === null}
            aria-label="Meu perfil"
            title="Meu perfil"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tomato text-lg font-bold text-white transition hover:bg-brand-brown disabled:opacity-60"
          >
            {email.charAt(0).toUpperCase()}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded bg-brand-brown px-3 py-2 text-sm text-white hover:bg-brand-tomato"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}

export default NavegacaoLogada
