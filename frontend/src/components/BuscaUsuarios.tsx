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
    <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-900">Buscar usuários</h2>
      <form onSubmit={enviarBusca} className="flex gap-2">
        <input
          type="search"
          value={nomeBusca}
          onChange={(event) => {
            setNomeBusca(event.target.value)
            if (!event.target.value.trim()) setConsulta('')
          }}
          placeholder="Buscar usuário por nome"
          aria-label="Nome do usuário"
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-3 py-2"
        />
        <button type="submit" disabled={carregando} className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
      {consulta && !carregando && !erro && usuarios.length === 0 && (
        <p className="mt-3 text-sm text-zinc-600">Nenhum usuário encontrado.</p>
      )}
      <ul className="mt-3 divide-y divide-zinc-100">
        {usuarios.map((usuario) => (
          <li key={usuario.id}>
            <button type="button" onClick={() => onSelecionarUsuario(usuario.id)} className="flex w-full items-center justify-between py-2 text-left hover:text-emerald-800">
              <span className="font-medium">{usuario.username}</span>
              <span className="text-sm text-zinc-500">{usuario.review_count} reviews</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BuscaUsuarios
