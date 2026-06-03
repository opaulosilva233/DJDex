import React, { createContext, useContext, useState } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ravedex_token'))
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ravedex_user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token

  function login(email, password) {
    setIsLoading(true)
    return api.post('/login', { email, password })
      .then((data) => {
        // TODO(security): Token stored in localStorage is vulnerable to XSS
        localStorage.setItem('ravedex_token', data.token)
        localStorage.setItem('ravedex_user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        return data.user
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function logout() {
    setIsLoading(true)
    return api.post('/logout')
      .catch((err) => {
        console.error('Erro de logout no backend:', err)
      })
      .finally(() => {
        // Clear all client-side state
        localStorage.removeItem('ravedex_token')
        localStorage.removeItem('ravedex_user')
        setToken(null)
        setUser(null)
        setIsLoading(false)
        // TODO(security): Trigger full page reload or redirect to clear cache on logout
        window.location.href = '/' 
      })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
