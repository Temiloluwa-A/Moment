import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useToast } from '../context/ToastContext'
import TimeSky from './TimeSky'

const Login = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loader, setloader] = useState(false)
  const [showPassword, setshowPassword] = useState(false)

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setloader(true)
      try {
        const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/google-auth`, {
          access_token: tokenResponse.access_token,
        })
        if (result.status === 200 || result.status === 201) {
          Cookies.set('token', result.data.token, { expires: 5 / 24 })
          showToast({ type: 'success', title: 'Signed in', description: 'Logged in with Google.' })
          navigate('/create/count-down')
        }
      } catch (error) {
        console.error('Google sign-in error:', error.response?.data || error.message)
        showToast({ type: 'error', title: 'Google sign-in failed', description: 'Something went wrong. Please try again.' })
      } finally {
        setloader(false)
      }
    },
    onError: () => {
      showToast({ type: 'error', title: 'Google sign-in failed', description: 'Could not connect to Google. Please try again.' })
    },
  })
  const loginForm = useFormik({
    initialValues: {
      identifier: '',
      password: ''
    },

    onSubmit: async (values) => {
      setloader(true);
      console.log(values);
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/login`, values)
        console.log(response.data);
        if (response.status === 200 || response.status === 201) {
          Cookies.set('token', response.data.Data.token, { expires: 5 / 24 }); // Expires in 5 hours
          showToast({ type: 'success', title: 'Signed in', description: 'Logged in successfully.' });
          navigate('/create/count-down')
        } else {
          showToast({ type: 'error', title: 'Login failed', description: 'Error logging user.' });
        }
      } catch (error) {
        // const serverMessage = error.response?.data?.message;
        const statusCode = error.response?.status;

        console.error('Login error:', {
          message: error.message,
          statusCode,
          responseData: error.response?.data,
          responseHeaders: error.response?.headers,
          config: error.config,
        });

        showToast({
          type: 'error',
          title: 'Login failed',
          description: 'Unable to sign in. Please check your credentials and try again.',
        });
      }
      finally {
        setloader(false);
      }
    },

    validationSchema: Yup.object({
      identifier: Yup.string().required('Username or Email is required'),
      password: Yup.string().required('Password is required')
    })
  })

  return (
    <div className="font-body min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen w-full relative">

        {/* <!-- Right Side: Sign-up Form --> */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative form border border-border">
          <div className="w-full max-w-md space-y-10 relative z-10 ">
            <header className="text-center ">
              <div className="inline-flex items-center justify-center mb-3">
                <span className="font-serif italic text-4xl tracking-[-0.02em]">Moments</span>
              </div>
              <h2 className="font-display text-3xl italic text-primary">Welcome Back</h2>
              <p className="font-light text-text-muted">Sign in to your account to continue.</p>
              <div className="text-center space-y-4">
              <p className="font-light text-text-muted text-sm">
                Don't have an account? <Link to='/sign-up'><span className='text-primary font-medium text-md'>Sign Up</span></Link>
              </p>

            </div>
            </header>
            <div className="glass-panel p-4 md:p-4 shadow-2xl border rounded-3xl border-border">
              <form className="form" onSubmit={loginForm.handleSubmit}>
                <div>

                  {/* <!-- Username or Email Field --> */}
                  <div className="space-y-1.5 mb-1">
                    <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="identifier">Username or Email</label>
                    <input className="w-full border py-3 px-4 rounded-lg border-input-border outline-none text-text focus:ring-1 focus:ring-focus/20 bg-input-bg placeholder:text-text-subtle" id="identifier" name="identifier" placeholder="T3miii or temiade@gmail.com" type="text" onChange={loginForm.handleChange} onBlur={loginForm.handleBlur} value={loginForm.values.identifier} />
                    {(loginForm.touched.identifier && loginForm.errors.identifier) && <small className='text-error'>{loginForm.errors.identifier}</small>}

                  </div>
                  {/* <!-- Password Field --> */}
                  <div className="space-y-1.5 relative">
                    <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="password">Password</label>
                    <div className="relative flex items-center">
                      <input className='w-full border-2 py-3 px-4 rounded-lg outline-none text-text border-input-border focus:ring-1 focus:ring-focus/20 bg-input-bg placeholder:text-text-subtle' type={showPassword ? "text" : "password"} name='password' onChange={loginForm.handleChange} onBlur={loginForm.handleBlur} value={loginForm.values.password} />
                      <button type="button" className="absolute right-3 text-text-subtle hover:text-text-muted " onClick={() => setshowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                          </svg>

                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {(loginForm.touched.password && loginForm.errors.password) && <small className='text-error'>{loginForm.errors.password}</small>}<br />

                  </div>
                  <div className="flex justify-end -mt-1 mb-4">
                    <Link to="/forgot-password" className="text-xs font-label uppercase tracking-widest text-text-subtle hover:text-primary transition-colors">Forgot password?</Link>
                  </div>
                  <button className="w-full flex items-center justify-center gap-3 text-lg py-4 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-full shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-95 transition-all duration-500 tracking-wide" type="submit" disabled={loader}>
                    {loader ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      "Begin Journey"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-10 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-mid"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-label">
                  <span className="backdrop-blur px-4">Or continue with</span>
                </div>
              </div>
              <div className="mt-8 flex justify-center mb-4">
                <button type="button" onClick={() => googleLogin()} disabled={loader} className="btn-glass flex items-center justify-center gap-3 py-4 px-6 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-label text-xs uppercase tracking-widest">Google</span>
                </button>
              </div>
            </div>
            
          </div>
        </section>
        {/* <!-- Left Side: Atmospheric Time-of-Day Sky --> */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-20">
          <TimeSky />
          <div className="relative z-10 max-w-lg text-center space-y-4">
            <h1 className="font-body font-light text-7xl  tracking-tight leading-[1.1]">
              Every sunset is a unique masterpiece...
            </h1>
            <p className="font-body text-xl font-light tracking-wide leading-relaxed">
              Capture the ephemeral beauty of your life's most precious chapters. Join a community dedicated to the art of preservation and the warmth of nostalgia.
            </p>
            <div className="pt-6">
              <div className="inline-block px-6 py-2 rounded-full border font-label text-sm tracking-[0.2em] uppercase glass-panel bg-primary text-on-primary hover:bg-primary-hover">
                Moments Collective
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}


export default Login