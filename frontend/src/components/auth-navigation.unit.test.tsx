import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Cadastro from './Cadastro'
import Login from './Login'
import NavegacaoLogada from './NavegacaoLogada'
import { cadastrarUsuario, lerUsuarios } from '../usuarios'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('formulários de conta', () => {
  it('cadastra conta e rejeita e-mail duplicado', async () => {
    const user = userEvent.setup()
    const onIrParaLogin = vi.fn()
    const { unmount } = render(<Cadastro onIrParaLogin={onIrParaLogin} />)

    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Sobrenome'), 'Lima')
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(onIrParaLogin).toHaveBeenCalledOnce()
    expect(lerUsuarios()).toHaveLength(1)

    unmount()
    render(<Cadastro onIrParaLogin={onIrParaLogin} />)
    await user.type(screen.getByLabelText('Nome'), 'Ana')
    await user.type(screen.getByLabelText('Sobrenome'), 'Lima')
    await user.type(screen.getByLabelText('E-mail'), 'ANA@example.com')
    await user.type(screen.getByLabelText('Senha'), 'senha')
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }))
    expect(screen.getByText('Este e-mail já está cadastrado.')).toBeVisible()
  })

  it('exibe login inválido e trata erro do servidor', async () => {
    const user = userEvent.setup()
    const onLoginSucesso = vi.fn().mockRejectedValue(new Error('offline'))
    cadastrarUsuario('Ana', 'Lima', 'ana@example.com', 'senha')
    render(<Login onIrParaCadastro={vi.fn()} onLoginSucesso={onLoginSucesso} />)

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByText('E-mail ou senha inválidos. Cadastre-se primeiro.')).toBeVisible()
    expect(onLoginSucesso).not.toHaveBeenCalled()

    await user.clear(screen.getByLabelText('Senha'))
    await user.type(screen.getByLabelText('Senha'), 'senha')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Não foi possível conectar ao servidor. Tente novamente.')).toBeVisible()
  })

  it('recupera senha e usa a senha nova para entrar', async () => {
    const user = userEvent.setup()
    const onLoginSucesso = vi.fn().mockResolvedValue(undefined)
    cadastrarUsuario('Ana', 'Lima', 'ana@example.com', 'antiga')
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
    render(<Login onIrParaCadastro={vi.fn()} onLoginSucesso={onLoginSucesso} />)

    await user.click(screen.getByRole('button', { name: 'Esqueci minha senha' }))
    await user.type(screen.getByLabelText('E-mail'), 'desconhecido@example.com')
    await user.type(screen.getByLabelText('Senha'), 'nova')
    await user.click(screen.getByRole('button', { name: 'Salvar Nova Senha' }))
    expect(await screen.findByText(/E-mail não encontrado/)).toBeVisible()

    await user.clear(screen.getByLabelText('E-mail'))
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Salvar Nova Senha' }))
    expect(await screen.findByText('Senha alterada com sucesso! Agora você pode entrar.')).toBeVisible()
    expect(screen.getByLabelText('Senha')).toHaveValue('')

    await user.type(screen.getByLabelText('Senha'), 'nova')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(onLoginSucesso).toHaveBeenCalledWith('ana@example.com'))
  })

  it('permite retornar ao login e navegar ao cadastro', async () => {
    const user = userEvent.setup()
    const onIrParaCadastro = vi.fn()
    render(<Login onIrParaCadastro={onIrParaCadastro} onLoginSucesso={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Esqueci minha senha' }))
    await user.click(screen.getByRole('button', { name: 'Voltar para o login' }))
    expect(screen.getByText('Entrar', { selector: 'p' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Não tem conta? Cadastre-se' }))
    expect(onIrParaCadastro).toHaveBeenCalledOnce()
  })
})

describe('navegação autenticada', () => {
  it('aciona logo, buscas, perfil e saída', async () => {
    const user = userEvent.setup()
    const handlers = {
      onBuscaRestauranteChange: vi.fn(),
      onBuscarRestaurante: vi.fn(),
      onSelecionarUsuario: vi.fn(),
      onIrParaInicio: vi.fn(),
      onMeuPerfil: vi.fn(),
      onLogout: vi.fn(),
    }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 8, username: 'bia', review_count: 2 }],
    } as Response)
    render(
      <NavegacaoLogada
        email="ana@example.com"
        viewerId={4}
        buscaRestaurante="  Cafe  "
        {...handlers}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Ir para a página inicial' }))
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Busque um restaurante' }),
      { target: { value: '  Cafe  novo' } },
    )
    await user.click(screen.getByRole('button', { name: 'Buscar restaurante' }))
    expect(handlers.onBuscarRestaurante).toHaveBeenCalledWith('Cafe')
    expect(handlers.onBuscaRestauranteChange).toHaveBeenCalled()

    await user.type(screen.getByRole('searchbox', { name: 'Busque um usuário' }), 'bia')
    await user.click(screen.getByRole('button', { name: 'Buscar usuário' }))
    await user.click(await screen.findByRole('button', { name: /bia/ }))
    expect(handlers.onSelecionarUsuario).toHaveBeenCalledWith(8)

    await user.click(screen.getByRole('button', { name: 'Meu perfil' }))
    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(handlers.onMeuPerfil).toHaveBeenCalledOnce()
    expect(handlers.onLogout).toHaveBeenCalledOnce()
  })

  it('desativa meu perfil enquanto o usuário ainda não foi carregado', () => {
    render(
      <NavegacaoLogada
        email="ana@example.com"
        viewerId={null}
        buscaRestaurante=""
        onBuscaRestauranteChange={vi.fn()}
        onBuscarRestaurante={vi.fn()}
        onSelecionarUsuario={vi.fn()}
        onIrParaInicio={vi.fn()}
        onMeuPerfil={vi.fn()}
        onLogout={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Meu perfil' })).toBeDisabled()
  })
})
