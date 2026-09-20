type ListaRestaurantesProps = {
  email: string
  onLogout: () => void
}

type Restaurante = {
  id: number
  nome: string
  categoria: string
  nota: number
  imagem: string
}

const restaurantes: Restaurante[] = [
  {
    id: 1,
    nome: 'Pizzaria Bella Italia',
    categoria: 'Italiana',
    nota: 4.8,
    imagem:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
  },
  {
    id: 2,
    nome: 'Burguer House',
    categoria: 'Hambúrguer',
    nota: 4.2,
    imagem:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
  },
  {
    id: 3,
    nome: 'Sushi Garden',
    categoria: 'Japonesa',
    nota: 4.6,
    imagem:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66d?w=300',
  },
]

function ListaRestaurantes({ email, onLogout }: ListaRestaurantesProps) {
  return (
    <main className="min-h-screen bg-zinc-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RestauranK</h1>
          <p className="text-sm text-zinc-600">Olá, {email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          Sair
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurantes.map((restaurante) => (
          <article
            key={restaurante.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-md"
          >
            <img
              src={restaurante.imagem}
              alt={restaurante.nome}
              className="mb-3 h-40 w-full rounded-md object-cover"
            />
            <h2 className="text-xl font-semibold text-zinc-800">
              {restaurante.nome}
            </h2>
            <p className="text-sm text-zinc-500">{restaurante.categoria}</p>
            <p className="mt-3 font-bold text-amber-500">
              ★ {restaurante.nota.toFixed(1)} / 5.0
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}

export default ListaRestaurantes
