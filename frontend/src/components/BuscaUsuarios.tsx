import { useEffect, useState, type FormEvent } from 'react'

type UsuarioResumo = {
  id: number
  username: string
  review_count: number
}

type BuscaUsuariosProps = {
  onSelecionarUsuario: (userId: number) => void
}

async function buscarUsuarios(nome: string): Promise<UsuarioResumo[]> {
  const resposta = await fetch(`/api/users?name=${encodeURIComponent(nome)}`)
  if (!resposta.ok) throw new Error('Não foi possível buscar usuários.')
  return (await resposta.json()) as UsuarioResumo[]
}

function BuscaUsuarios({ onSelecionarUsuario }: BuscaUsuariosProps) {
  const [nomeBusca, setNomeBusca] = useState('')
  const [consulta, setConsulta] = useState('')
  const [usuarios, setUsuarios] = useState<UsuarioResumo[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!consulta) {
      setUsuarios([])
      setErro('')
      return
    }
    let ativa = true
    setCarregando(true)
    setErro('')
    buscarUsuarios(consulta)
      .then((resultados) => { if (ativa) setUsuarios(resultados) })
      .catch(() => {
        if (ativa) {
          setUsuarios([])
          setErro('Não foi possível buscar usuários.')
        }
      })
      .finally(() => { if (ativa) setCarregando(false) })
    return () => { ativa = false }
  }, [consulta])

  function enviarBusca(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setConsulta(nomeBusca.trim())
  }

  return (
    <div className="relative w-full sm:w-52">
      <form onSubmit={enviarBusca} role="search">
        <input
          type="search"
          value={nomeBusca}
          onChange={(event) => {
            setNomeBusca(event.target.value)
            if (!event.target.value.trim()) setConsulta('')
          }}
          placeholder="Busque um usuário"
          aria-label="Busque um usuário"
          className="w-full rounded-full border border-zinc-300 bg-white py-2 pl-4 pr-11 text-sm shadow-sm outline-none transition placeholder:text-zinc-500 focus:border-brand-tomato focus:ring-2 focus:ring-brand-tomato/20"
        />
        <button
          type="submit"
          disabled={carregando}
          aria-label="Buscar usuário"
          className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-brand-tomato transition hover:bg-brand-tomato/10 disabled:opacity-60"
        >
          {carregando ? (
            <span className="text-xs" aria-hidden="true">…</span>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" strokeWidth="2">
              <circle cx="10.8" cy="10.8" r="6.3" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </form>
      {(erro || carregando || (consulta && usuarios.length > 0) || (consulta && !erro && !carregando)) && (
        <div className="absolute right-0 top-full z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
          {erro && <p role="alert" className="text-sm text-brand-tomato">{erro}</p>}
          {carregando && <p className="text-sm text-zinc-600">Buscando usuários...</p>}
          {consulta && !carregando && !erro && usuarios.length === 0 && (
            <p className="text-sm text-zinc-600">Nenhum usuário encontrado.</p>
          )}
          {usuarios.length > 0 && (
            <ul className="divide-y divide-zinc-100">
              {usuarios.map((usuario) => (
                <li key={usuario.id}>
                  <button
                    type="button"
                    onClick={() => onSelecionarUsuario(usuario.id)}
                    className="flex w-full items-center justify-between gap-3 py-2 text-left hover:text-brand-tomato"
                  >
                    <span className="truncate font-medium">{usuario.username}</span>
                    <span className="shrink-0 text-sm text-zinc-500">{usuario.review_count} reviews</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default BuscaUsuarios
