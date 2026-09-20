// Chave usada no navegador para guardar a lista de usuários.
const CHAVE = 'restaurank-usuarios'

export type Usuario = {
  email: string
  senha: string
}

// Lê a lista salva. Se ainda não existir nada, devolve um array vazio.
export function lerUsuarios(): Usuario[] {
  const texto = localStorage.getItem(CHAVE)
  if (!texto) {
    return []
  }
  return JSON.parse(texto) as Usuario[]
}

// Cadastra um usuário novo. Devolve uma mensagem de erro ou null se deu certo.
export function cadastrarUsuario(email: string, senha: string): string | null {
  const usuarios = lerUsuarios()
  const jaExiste = usuarios.some(
    (usuario) => usuario.email.toLowerCase() === email.toLowerCase(),
  )

  if (jaExiste) {
    return 'Este e-mail já está cadastrado.'
  }

  usuarios.push({ email, senha })
  localStorage.setItem(CHAVE, JSON.stringify(usuarios))
  return null
}

// Confere se e-mail e senha existem na lista salva.
export function validarLogin(email: string, senha: string): boolean {
  const usuarios = lerUsuarios()
  return usuarios.some(
    (usuario) =>
      usuario.email.toLowerCase() === email.toLowerCase() &&
      usuario.senha === senha,
  )
}
