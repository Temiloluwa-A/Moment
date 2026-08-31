import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Shared by Login and SignUp — both offer "continue with Google" and handle
// the callback identically (exchange the Google access token for our own JWT,
// log the user in, and land them in the creator).
export const useGoogleAuthMutation = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const { showToast } = useToast()

    return useMutation({
        mutationFn: (accessToken) => api.post('/google-auth', { access_token: accessToken }),
        onSuccess: (result) => {
            login(result.data.token)
            showToast({ type: 'success', title: 'Signed in', description: 'Logged in with Google.' })
            navigate('/create/count-down')
        },
        onError: (error) => {
            console.error('Google sign-in error:', error.response?.data || error.message)
            showToast({ type: 'error', title: 'Google sign-in failed', description: 'Something went wrong. Please try again.' })
        },
    })
}
