import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useToast } from '../context/ToastContext'

const ForgotPassword = () => {
  const { showToast } = useToast()
  const [sent, setSent] = useState(false)

  const forgotPasswordMutation = useMutation({
    // The API always responds the same way (it won't reveal whether the email exists).
    mutationFn: (values) => api.post('/forgot-password', values),
    onSuccess: () => {
      setSent(true)
      showToast({ type: 'success', title: 'Check your inbox', description: 'If that email is registered, a reset link is on its way.' })
    },
    onError: () => {
      showToast({ type: 'error', title: 'Something went wrong', description: 'Could not send the reset link. Please try again.' })
    },
  })
  const loader = forgotPasswordMutation.isPending

  const form = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Enter a valid email').required('Email is required'),
    }),
    onSubmit: (values) => forgotPasswordMutation.mutate(values),
  })

  return (
    <div className="font-body min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center space-y-2">
          <span className="font-serif italic text-4xl tracking-[-0.02em] text-primary">Moments</span>
          <h2 className="font-display text-3xl italic text-primary">Forgot your password?</h2>
          <p className="font-light text-text-muted">
            Enter your email and we'll send you a link to reset it.
          </p>
        </header>

        <div className="glass-panel p-6 md:p-8 shadow-2xl border rounded-3xl border-border">
          {sent ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <span className="material-symbols-outlined text-2xl">mark_email_read</span>
              </div>
              <p className="text-text-muted font-light">
                If an account exists for <span className="text-text font-medium">{form.values.email}</span>, a reset link has been sent. The link expires in 1 hour.
              </p>
              <Link to="/login" className="inline-block text-primary font-medium hover:text-primary-hover transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="temiade@gmail.com"
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  value={form.values.email}
                  className="w-full border py-3 px-4 rounded-lg border-input-border outline-none text-text focus:ring-1 focus:ring-focus/20 bg-input-bg placeholder:text-text-subtle"
                />
                {form.touched.email && form.errors.email && <small className="text-error">{form.errors.email}</small>}
              </div>

              <button
                type="submit"
                disabled={loader}
                className="w-full flex items-center justify-center gap-3 text-lg py-4 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-full shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-95 transition-all duration-500 tracking-wide"
              >
                {loader ? 'Sending...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm font-light text-text-muted">
                Remembered it? <Link to="/login"><span className="text-primary font-medium">Sign in</span></Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
