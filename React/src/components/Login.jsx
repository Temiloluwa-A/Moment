import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'

const Login = () => {
  const [showPassword, setshowPassword] = useState(false)
  const loginForm = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required')
    })
  })

  return (
    <div className='container flex justify-center items-center h-screen'>
      <div className='p-8 rounded-lg w-96 sm:max-w-96  bg-stone-900/40 backdrop-blur-xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50'>
        <h1 className='md:text-3xl text-lg'>Welcome back</h1>
        <h3>Sign in to your account</h3>
        <div className=' flex flex-col pt-3'>
          <label htmlFor="email" className='text-base'>Email</label>
          <input className='border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500' type="text" name='email' onChange={loginForm.handleChange} onBlur={loginForm.handleBlur} />
          {(loginForm.touched.email && loginForm.errors.firstName) && <small className='text-danger'>{loginForm.errors.firstName}</small>}<br />
        </div>
        <div className=' flex flex-col'>
          <label htmlFor="password" className='text-base'>Password</label>
          <div className="relative flex items-center">
            <input className='w-full border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500 pr-8' type={showPassword ? "text" : "password"} name='password' onChange={loginForm.handleChange} onBlur={loginForm.handleBlur} />
            <button type="button" className="absolute right-3 text-gray-500 hover:text-gray-700 " onClick={() => setshowPassword(!showPassword)}>
              {showPassword?(
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
              </svg>

              ):(
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
              </svg> 
              )}
            </button>
          </div>
          {(loginForm.touched.firstName && loginForm.errors.firstName) && <small className='text-danger'>{loginForm.errors.firstName}</small>}<br />
        </div>
        <div className='flex justify-between pb-5'>
          <p> <input type="checkbox" name="checkbox" id="checkbox" className='text-base' />Remember me</p>
          <p className='text-base'>Forgot password?</p>
        </div>
        <button onClick={loginForm.handleSubmit} className='py-2 bg-amber-600 border w-full rounded-xl md:text-lg'>Sign in</button>
        <div className='flex items-center my-5'>
          <div className='border-yellow-950 border-t grow'></div>
          <p className='text-sm mx-3'>Or continue with</p>
          <div className='border-yellow-950 border-t grow'></div>

        </div>
        <button className='p-2 bg-amber-600 border w-full rounded-xl mb-2'>Continue with google</button>
        <p className=' flex justify-center'>Don't have an Account?<span className='px-1 '><Link to={'/sign-up'}>Create one</Link></span></p>
      </div>
    </div>

  )
}


export default Login