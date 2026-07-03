import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useToast } from '../context/ToastContext'

const SignUp = () => {
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
                    Cookies.set('token', result.data.token, { expires: 1 })
                    showToast({ type: 'success', title: 'Welcome', description: 'Signed in with Google.' })
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
    let signUpArea = useFormik({
        initialValues: {
            fullName: '',
            userName: '',
            email: '',
            password: '',
            gender: ''
        },


        onSubmit: async(values, { setSubmitting, setFieldError }) => {
            setloader(true);
            console.log(values)
            try {
                const result = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/signup`, values)
                console.log(result.status);

                if(result.status == 201 || result.status == 200){
                    showToast({ type: 'success', title: 'Welcome', description: 'Account created successfully.' });
                    // Automatically log the user in by saving the token!
                    Cookies.set('token', result.data.token, { expires: 1 });
                    navigate('/create/count-down')
                    console.log(result.data);
                }
            }
            catch (error) {
                const serverMessage = error.response?.data?.message;
                const statusCode = error.response?.status;

                console.error('Sign up error:', {
                    message: error.message,
                    statusCode,
                    responseData: error.response?.data,
                    responseHeaders: error.response?.headers,
                    config: error.config,
                });

                if (typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('email')) {
                    setFieldError('email', 'Email already exists');
                    showToast({
                        type: 'error',
                        title: 'Sign up failed',
                        description: 'Email already exists. Please use a different email.',
                    });
                } else {
                    showToast({
                        type: 'error',
                        title: 'Sign up failed',
                        description:'Something went wrong. Please try again.',
                    });
                }
            }
            finally {
                setloader(false);
                setSubmitting(false);
            }

        },


        validationSchema: Yup.object({
            fullName: Yup.string().required('FullName is required'),
            userName: Yup.string().required('User Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password too weak"),
            gender: Yup.string()
        })

    })
    return (
        <div className="bg-deep-space-blue-500 font-body min-h-screen overflow-x-hidden">
            <div className="flex min-h-screen w-full relative">
                {/* <!-- Left Side: Atmospheric Sunset Area --> */}
                <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-20">
                    {/* <!-- Atmospheric Image with Grain Overlay --> */}
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                        {/* <img alt="" className="w-full h-full object-cover data-alt="A cinematic wide shot of a deep orange sunset over a vast, calm ocean horizon. The atmosphere is thick with golden haze, and the sun is a soft, glowing orb melting into the dark umber water. Soft, textured grain covers the scene to create a vintage, nostalgic film aesthetic, mimicking a cherished memory captured on old 35mm film during the golden hour." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1YKXE9XqMJNDl2YOKrcTqN9ykniY4KBj1B5UBrn1rIJkB6OoGvVljBJxx1pMDb_-FH_Vy-Avar75_UBOEaKAu-f1Et8qW9r4V8VCK7HOFZqh8fYRtbKVowzUHAXZBI2T8YDX9PFCL0VyfAcPIU9y2ICyqWYezhabR9-bROdAtlGbrfMhoGnEmBroWKJMXeUmKaMoAMUxkkRT19-5jyDRppnCjRvMGVfeMs4AN1vLGiz81kQd8TOXGO-nffPjVY6jxAXZiAb_yuxQ-" /> */}
                    </div>
                    <div className="relative z-10 max-w-lg text-center space-y-4">
                        <h1 className="font-display text-7xl italic text-parchment-500 tracking-tight leading-[1.1]">
                            Every sunset is a unique masterpiece...
                        </h1>
                        <p className="font-body text-xl font-light tracking-wide leading-relaxed">
                            Capture the ephemeral beauty of your life's most precious chapters. Join a community dedicated to the art of preservation and the warmth of nostalgia.
                        </p>
                        <div className="pt-6">
                            <div className="inline-block px-6 py-2 bg-amber-500 text-espresso-900 hover:bg-amber-400 rounded-full border font-label text-sm tracking-[0.2em] uppercase glass-panel">
                                Moments Collective
                            </div>
                        </div>
                    </div>
                </section>
                {/* <!-- Right Side: Sign-up Form --> */}
                <section className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative form">
                    <div className="w-full max-w-md space-y-10 relative z-10">
                        <header className="text-center ">
                            <div className="inline-flex items-center justify-center mb-3">
                                <span className=" font-serif italic text-4xl tracking-[-0.02em] text-amber-300">Moments</span>
                            </div>
                            <h2 className="font-display text-parchment-400 text-3xl font-bold">Create your sanctuary</h2>
                            <p className="font-light">Begin your journey into the archives of memory.</p>
                        </header>
                        <div className="glass-panel p-4 md:p-4 shadow-2xl border border-tawny-800 rounded-3xl">
                            <form className="form" onSubmit={signUpArea.handleSubmit}>
                                <div>
                                    {/* <!-- Name Field --> */}
                                    <div className="space-y-1.5 mb-1.5">
                                        <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="fullName">Full Name</label>
                                        <input className="w-full border py-3 px-4 rounded-lg border-tawny-700 outline-none text-parchment-300 focus:ring-amber-500/20 bg-espresso-950 focus:ring-1 transition-all duration-500 placeholder:text-tawny-500" id="name" name="fullName" placeholder="Temiloluwa Ade" type="text" onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} value={signUpArea.values.fullName} />
                                        {(signUpArea.touched.fullName && signUpArea.errors.fullName) && <small className='text-danger'>{signUpArea.errors.fullName}</small>}

                                    </div>
                                    {/* <!-- Username Field --> */}
                                    <div className="space-y-1.5 mb-1.5">
                                        <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="userName">Username</label>
                                        <input className="w-full border py-3 px-4 rounded-lg border-tawny-700 outline-none text-parchment-300 focus:ring-1 focus:ring-amber-500/20 bg-espresso-950 transition-all duration-500 placeholder:text-tawny-500" id="username" name="userName" placeholder="T3miii" type="text" onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} value={signUpArea.values.userName} />
                                        {(signUpArea.touched.userName && signUpArea.errors.userName) && <small className='text-danger'>{signUpArea.errors.userName}</small>}

                                    </div>
                                    {/* <!-- Gender --> */}
                                    <div className="space-y-1.5 mb-1.5">
                                        <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="gender">Gender</label>
                                        <input className="w-full border py-3 px-4 rounded-lg border-tawny-700 outline-none text-parchment-300 focus:ring-amber-500/20 bg-espresso-950 focus:ring-1 transition-all duration-500 placeholder:text-tawny-500" id="gender" name="gender" placeholder="female" type="text" onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} value={signUpArea.values.gender} />
                                    </div>
                                    {/* <!-- Email Field --> */}
                                    <div className="space-y-1.5 mb-1.5">
                                        <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
                                        <input className="w-full border py-3 px-4 rounded-lg border-tawny-700 outline-none text-parchment-300 focus:ring-amber-500/20 bg-espresso-950 focus:ring-1 transition-all duration-500 placeholder:text-tawny-500" id="email" name="email" placeholder="temiade@gmail.com" type="email" onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} value={signUpArea.values.email} />
                                        {(signUpArea.touched.email && signUpArea.errors.email) && <small className='text-danger'>{signUpArea.errors.email}</small>}

                                    </div>
                                    {/* <!-- Password Field --> */}
                                    <div className="space-y-1.5 relative">
                                        <label className="font-label text-xs uppercase tracking-widest ml-1" htmlFor="password">Password</label>
                                        <div className="relative flex items-center">
                                            <input className='w-full border py-3 px-4 rounded-lg border-tawny-700 outline-none text-parchment-300 focus:ring-1 focus:ring-amber-500/20 bg-espresso-950' type={showPassword ? "text" : "password"} name='password' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} value={signUpArea.values.password} />
                                            <button type="button" className="absolute right-3 text-gray-500 hover:text-gray-700 " onClick={() => setshowPassword(!showPassword)}>
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
                                        {(signUpArea.touched.password && signUpArea.errors.password) && <small className='text-danger'>{signUpArea.errors.password}</small>}<br />

                                    </div>
                                    <button className="w-full flex items-center justify-center bg-amber-500 hover:bg-amber-400 gap-2 text-lg py-4 text-espresso-900 font-semibold rounded-full shadow-lg hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-95 transition-all duration-500 tracking-wide" type="submit" disabled={loader}>
                                        {loader ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Preparing...
                                            </>
                                        ) : (
                                            "Begin Journey"
                                        )}
                                    </button>
                                </div>
                            </form>
                            {/* <p className='flex justify-center pt-2'>Already have an account? <span classNName='ps-1'><Link to={'/login'}>Login</Link></span></p> */}

                            <div className="mt-7 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-tawny-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-label">
                                    <span className="backdrop-blur px-4">Or continue with</span>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4 mb-6">
                                <button type="button" onClick={() => googleLogin()} disabled={loader} className="flex items-center justify-center gap-3 py-3 px-4 glass-panel hover:scale-[1.02] border border-amber-500 rounded-full transition-all duration-500 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    <span className="font-label text-xs uppercase tracking-widest">Google</span>
                                </button>
                                <button className="flex items-center justify-center gap-3 py-3 px-4 glass-panel  border border-amber-500 rounded-full transition-all duration-500 hover:scale-[1.02]">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M17.05 20.28c-.98.95-2.05 1.61-3.21 1.61-1.12 0-1.48-.68-2.84-.68-1.37 0-1.78.66-2.83.68-1.16.02-2.31-.72-3.32-1.74-2.07-2.1-2.45-5.91-.7-7.79 1.15-1.24 2.56-1.9 3.86-1.9 1.1 0 1.9.61 2.76.61s1.78-.65 3.03-.65c1.1 0 2.21.55 3.05 1.48-1.92 1.14-1.61 3.73.43 4.54-.42 1.35-1.29 2.89-2.23 3.84zM12.03 7.25c-.1 0-.19-.01-.29-.01-.06-1.36.65-2.67 1.67-3.48.91-.72 2.2-.99 3.29-.99.11 1.34-.6 2.68-1.57 3.52-.82.72-2.01 1-3.1 0.96z" fill="currentColor"></path>
                                    </svg>
                                    <span className="font-label text-xs uppercase tracking-widest">Phone</span>
                                </button>
                            </div>
                        </div>
                        <div className="text-center space-y-4">
                            <p className="font-light text-sm">
                                Already have an account? <Link to='/login'><span className='text-amber-500 text-md font-medium'>Sign in</span></Link>
                            </p>

                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default SignUp