import { createContext, useContext, useState, useCallback } from 'react'
import Cookies from 'js-cookie'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

const AuthContext = createContext()

// The JWT itself expires in 5 hours (backend: jwt.sign(..., { expiresIn: "5hr" })) —
// the cookie must not outlive it, or a "logged in" client silently sends a dead token.
const TOKEN_COOKIE_EXPIRES = 5 / 24

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => Cookies.get('token') || null)
    const queryClient = useQueryClient()

    const logout = useCallback(() => {
        Cookies.remove('token')
        setToken(null)
        queryClient.clear()
    }, [queryClient])

    const { data: user, isLoading: isLoadingUser, isError } = useQuery({
        queryKey: ['profile'],
        enabled: !!token,
        retry: false,
        queryFn: async () => {
            try {
                const response = await api.get('/profile')
                return response.data.data
            } catch (error) {
                // An invalid/expired token — clear it the same way a real logout
                // would, right where the failure happens (not reactively via an
                // effect, which would cause an extra cascading render).
                logout()
                throw error
            }
        },
    })

    const login = useCallback((newToken) => {
        Cookies.set('token', newToken, { expires: TOKEN_COOKIE_EXPIRES })
        setToken(newToken)
    }, [])

    const isLoggedIn = !!token && !isError

    return (
        <AuthContext.Provider value={{ token, isLoggedIn, user, isLoadingUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider')
    }
    return context
}
