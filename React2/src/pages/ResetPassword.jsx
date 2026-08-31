import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../context/ToastContext'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const resetPasswordMutation = useMutation({
    mutationFn: (password) => api.post(`/reset-password/${token}`, { password }),
    onSuccess: () => {
      showToast({ type: 'success', title: 'Password reset', description: 'You can now sign in with your new password.' })
      navigate('/login')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Could not reset your password. The link may have expired.'
      showToast({ type: 'error', title: 'Reset failed', description: message })
    },
  })
  const loader = resetPasswordMutation.isPending

  const form = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: (values) => resetPasswordMutation.mutate(values.password),
  })

  return (
    <div className="font-body min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center space-y-2">
          <span className="font-serif italic text-4xl tracking-[-0.02em] text-primary">Moments</span>
          <h2 className="font-display text-3xl italic text-primary">Choose a new password</h2>
          <p className="font-light text-text-muted">Make it something you'll remember this time.</p>
        </header>

        <div className="glass-panel p-6 md:p-8 shadow-2xl border rounded-3xl border-border">
          <form onSubmit={form.handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="password">New password</label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  value={form.values.password}
                  className="w-full border py-3 px-4 rounded-lg border-input-border outline-none text-text focus:ring-1 focus:ring-focus/20 bg-input-bg placeholder:text-text-subtle"
                />
                <button
                  type="button"
                  className="absolute right-3 text-text-subtle hover:text-text-muted text-xs uppercase tracking-widest"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {form.touched.password && form.errors.password && <small className="text-error">{form.errors.password}</small>}
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                value={form.values.confirmPassword}
                className="w-full border py-3 px-4 rounded-lg border-input-border outline-none text-text focus:ring-1 focus:ring-focus/20 bg-input-bg placeholder:text-text-subtle"
              />
              {form.touched.confirmPassword && form.errors.confirmPassword && <small className="text-error">{form.errors.confirmPassword}</small>}
            </div>

            <button
              type="submit"
              disabled={loader}
              className="w-full flex items-center justify-center gap-3 text-lg py-4 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-full shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-95 transition-all duration-500 tracking-wide"
            >
              {loader ? 'Resetting...' : 'Reset password'}
            </button>

            <p className="text-center text-sm font-light text-text-muted">
              <Link to="/login"><span className="text-primary font-medium">Back to sign in</span></Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
