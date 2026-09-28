import { useEffect, useState } from 'react'

type Usuario = { id: number; username: string }

type ListaRelacoesProps = {
  userId: number
  tipo: 'followers' | 'following'
  aoSelecionarUsuario: (userId: number) => void
  aoFechar: () => void
}

function ListaRelacoes({
  userId,
  tipo,
  aoSelecionarUsuario,
  aoFechar,
}: ListaRelacoesProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let ativa = true
    fetch(`/api/users/${userId}/${tipo}`)
      .then((resposta) => {
        if (!resposta.ok) throw new Error('lista')
        return resposta.json() as Promise<Usuario[]>
      })
      .then((dados) => { if (ativa) setUsuarios(dados) })
      .catch(() => { if (ativa) setErro(true) })
      .finally(() => { if (ativa) setCarregando(false) })
    return () => { ativa = false }
  }, [tipo, userId])

  return (
    <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-brown">
          {tipo === 'followers' ? 'Seguidores' : 'Seguindo'}
        </h2>
        <button type="button" onClick={aoFechar} className="text-sm text-brand-tomato hover:underline">
          Fechar
        </button>
      </div>
      {carregando && <p className="text-sm text-zinc-600">Carregando...</p>}
      {erro && <p role="alert" className="text-sm text-brand-tomato">Não foi possível carregar esta lista.</p>}
      {!carregando && !erro && usuarios.length === 0 && (
        <p className="text-sm text-zinc-600">Nenhum usuário nesta lista.</p>
      )}
      <ul className="divide-y divide-zinc-100">
        {usuarios.map((usuario) => (
          <li key={usuario.id}>
            <button
              type="button"
              onClick={() => aoSelecionarUsuario(usuario.id)}
              className="w-full py-2 text-left font-medium text-brand-tomato hover:text-brand-brown hover:underline"
            >
              {usuario.username}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ListaRelacoes
