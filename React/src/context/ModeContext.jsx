import React, { createContext, useReducer, useContext } from 'react'

const ModeContext = createContext()
const initialMode = null

function modeReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return action.payload
    default:
      return state
  }
}

export const ModeProvider = ({ children }) => {
  const [mode, dispatch] = useReducer(modeReducer, initialMode)

  return (
    <ModeContext.Provider value={{ mode, dispatch }}>
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
