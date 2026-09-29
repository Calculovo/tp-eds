import { useEffect } from 'react'

function useEscapeKey(onEscape: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    function fechar(event: KeyboardEvent) {
      if (event.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', fechar)
    return () => window.removeEventListener('keydown', fechar)
  }, [enabled, onEscape])
}

export default useEscapeKey
