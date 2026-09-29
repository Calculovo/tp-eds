import type { Restaurante } from './ListaRestaurantes'

type CartaoRestauranteAvaliacaoProps = {
  restaurante: Restaurante
}

function CartaoRestauranteAvaliacao({
  restaurante,
}: CartaoRestauranteAvaliacaoProps) {
  return (
    <aside className="mx-auto w-full max-w-52 sm:mx-0 sm:max-w-none">
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl border border-brand-brown/10 bg-white shadow-sm">
        {restaurante.imagem ? (
          <img
            src={restaurante.imagem}
            alt={restaurante.nome}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="px-4 text-center text-sm text-zinc-500">
            Imagem indisponível
          </span>
        )}
      </div>
      <p className="mb-1 mt-4 text-sm font-semibold uppercase tracking-wide text-brand-tomato">
        {restaurante.categoria}
      </p>
      <h3 className="text-xl font-bold text-brand-brown sm:text-2xl">
        {restaurante.nome}
      </h3>
    </aside>
  )
}

export default CartaoRestauranteAvaliacao
