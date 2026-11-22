import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BrandLogo from './BrandLogo'
import CabecalhoAvaliacao from './CabecalhoAvaliacao'
import CartaoRestauranteAvaliacao from './CartaoRestauranteAvaliacao'
import EstrelasAvaliacao from './EstrelasAvaliacao'
import RodapeAvaliacao from './RodapeAvaliacao'
import type { Restaurante } from './ListaRestaurantes'

const restaurante: Restaurante = {
  id: 1,
  nome: 'Café Central',
  categoria: 'Café',
  imagem: '/cafe.jpg',
  mediaAvaliacoes: 4.5,
  quantidadeAvaliacoes: 2,
  contagemAvaliacoes: [0, 0, 0, 1, 1],
}

describe('componentes visuais compartilhados', () => {
  it('exibe a marca e só mostra a frase quando solicitada', () => {
    const { rerender } = render(<BrandLogo />)
    expect(screen.getByLabelText('RestauRank')).toBeInTheDocument()
    expect(screen.queryByText(/Avalie/)).not.toBeInTheDocument()

    rerender(<BrandLogo showTagline />)
    expect(screen.getByText('Avalie · Ranqueie · Descubra')).toBeVisible()
  })

  it('fecha o cabeçalho pelo botão acessível', () => {
    const onFechar = vi.fn()
    render(<CabecalhoAvaliacao onFechar={onFechar} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fechar avaliação' }))
    expect(onFechar).toHaveBeenCalledOnce()
  })

  it('mostra a imagem do restaurante ou alternativa sem imagem', () => {
    const { rerender } = render(
      <CartaoRestauranteAvaliacao restaurante={restaurante} />,
    )
    expect(screen.getByRole('img', { name: 'Café Central' })).toHaveAttribute(
      'src',
      '/cafe.jpg',
    )

    rerender(
      <CartaoRestauranteAvaliacao
        restaurante={{ ...restaurante, imagem: null }}
      />,
    )
    expect(screen.getByText('Imagem indisponível')).toBeVisible()
  })

  it('seleciona a nota e expõe o estado pressionado', () => {
    const onSelecionar = vi.fn()
    render(<EstrelasAvaliacao nota={3} onSelecionar={onSelecionar} />)

    expect(screen.getByText('3 de 5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3 estrelas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    fireEvent.click(screen.getByRole('button', { name: '5 estrelas' }))
    expect(onSelecionar).toHaveBeenCalledWith(5)
  })

  it('desativa ações durante o salvamento e permite fechar quando ocioso', () => {
    const onFechar = vi.fn()
    const { rerender } = render(
      <form>
        <RodapeAvaliacao salvando onFechar={onFechar} />
      </form>,
    )
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()

    rerender(
      <form>
        <RodapeAvaliacao salvando={false} onFechar={onFechar} />
      </form>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onFechar).toHaveBeenCalledOnce()
  })
})
