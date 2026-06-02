import { createContext, useReducer, useContext, useEffect } from 'react'
import Cookies from 'js-cookie'

const ModeContext = createContext()

// Check for saved preference or system preference
const getInitialMode = () => {
  const saved = Cookies.get('theme-mode')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialMode = getInitialMode()

function modeReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return action.payload
    case 'TOGGLE_MODE':
      return state === 'light' ? 'dark' : 'light'
    default:
      return state
  }
}

export const ModeProvider = ({ children }) => {
  const [mode, dispatch] = useReducer(modeReducer, initialMode)

  // Save to cookie and apply to document
  useEffect(() => {
    Cookies.set('theme-mode', mode, { expires: 365 })
    document.documentElement.setAttribute('data-theme', mode)
    // Optional: Also update document class for Tailwind dark mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  const toggleMode = () => dispatch({ type: 'TOGGLE_MODE' })
  const setMode = (newMode) => dispatch({ type: 'SET_MODE', payload: newMode })

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode, dispatch }}>
      {children}
    </ModeContext.Provider>
  )
}

export const useMode = () => {
  const context = useContext(ModeContext)
  if (!context) {
    throw new Error('useMode must be used inside a ModeProvider')
  }
  return context
}
