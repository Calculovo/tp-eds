import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cadastrarUsuario,
  lerUsuarios,
  redefinirSenha,
  validarLogin,
} from './usuarios'

const email = 'ana@example.com'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.stubGlobal('fetch', vi.fn())
})

describe('cadastro e autenticação locais', () => {
  it('retorna lista vazia quando o navegador não tem usuários', () => {
    expect(lerUsuarios()).toEqual([])
  })

  it('cadastra usuário e rejeita e-mail duplicado sem diferenciar caixa', () => {
    expect(cadastrarUsuario('Ana', 'Lima', email, 'senha')).toBeNull()
    expect(cadastrarUsuario('Outra', 'Pessoa', 'ANA@example.com', 'outra')).toBe(
      'Este e-mail já está cadastrado.',
    )
    expect(lerUsuarios()).toEqual([
      { nome: 'Ana', sobrenome: 'Lima', email, senha: 'senha' },
    ])
  })

  it('valida e-mail sem diferenciar caixa e exige a senha correspondente', () => {
    cadastrarUsuario('Ana', 'Lima', email, 'senha')
    expect(validarLogin('ANA@example.com', 'senha')).toBe(true)
    expect(validarLogin(email, 'incorreta')).toBe(false)
    expect(validarLogin('outra@example.com', 'senha')).toBe(false)
  })
})

describe('redefinição de senha', () => {
  it('informa quando o e-mail não existe', async () => {
    await expect(redefinirSenha(email, 'nova')).resolves.toBe(
      'E-mail não encontrado. Verifique se digitou corretamente.',
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('atualiza a senha local e chama o backend', async () => {
    cadastrarUsuario('Ana', 'Lima', email, 'antiga')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    await expect(redefinirSenha('ANA@example.com', 'nova')).resolves.toBeNull()

    expect(lerUsuarios()[0].senha).toBe('nova')
    expect(fetch).toHaveBeenCalledWith('/api/users/reset-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ANA@example.com', novaSenha: 'nova' }),
    })
  })

  it('mantém a redefinição local e avisa quando o servidor recusa', async () => {
    cadastrarUsuario('Ana', 'Lima', email, 'antiga')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(redefinirSenha(email, 'nova')).resolves.toBeNull()

    expect(lerUsuarios()[0].senha).toBe('nova')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('mantém a redefinição local e registra falha de rede', async () => {
    cadastrarUsuario('Ana', 'Lima', email, 'antiga')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(redefinirSenha(email, 'nova')).resolves.toBeNull()

    expect(lerUsuarios()[0].senha).toBe('nova')
    expect(error).toHaveBeenCalledOnce()
  })
})
