import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'



const SignUp = () => {
    const [showPassword, setshowPassword] = useState(false)
    let signUpArea = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            userName: '',
            email: '',
            password: '',
            gender: ''
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            userName: Yup.string().required('User Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required').matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password too weak"),
            // gender: Yup.string().required('Gender is required')
        })

    })
    return (
        <div className=' container flex justify-center items-center h-screen'>
            <div className='p-6 rounded-lg w-11/12 max-w-sm md:max-w-lg  bg-stone-900/40 backdrop-blur-xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50'>
                <h1 className='md:text-3xl text-lg'>Create an account</h1>
                <h3>Welcome! Create an account to get started.</h3>
                <div className='md:flex gap-x-8'>
                    <div className=' flex flex-col pt-4 '>
                        <label htmlFor="firstName">First Name</label>
                        <input className='border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500' type="text" name='firstName' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} /><br />
                        {(signUpArea.touched.firstName && signUpArea.errors.firstName) && <small className='text-danger'>{signUpArea.errors.firstName}</small>}
                        {/* above we have a short circuited conditional statement */}
                        {/* //using formik requires name attribute to be the same as the key in initialValues and onChange should be formik.handlechange */}
                    </div>
                    <div className=' flex flex-col pt-4'>
                        <label htmlFor="lastName">Last Name</label>
                        <input className='border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500' type="text" name='lastName' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} /><br />
                        {(signUpArea.touched.lastName && signUpArea.errors.lastName) && <small className='text-danger'>{signUpArea.errors.lastName}</small>}
                    </div>
                </div>
                <div className=' flex flex-col pt-3'>
                    <label htmlFor="userName">User Name</label>
                    <input className='border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500' type="text" name='userName' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} /><br />
                    {(signUpArea.touched.userName && signUpArea.errors.userName) && <small className='text-danger'>{signUpArea.errors.userName}</small>}
                </div>
                <div className=' flex flex-col pt-3'>
                    <label htmlFor="gender">Gender</label>
                    <input className='border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500' type='text' name='gender' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} /><br />
                    {/* {(signUpArea.touched.gender && signUpArea.errors.gender) && <small className='text-danger'>{signUpArea.errors.gender}</small>}<br /> */}
                </div>

                <div className=' flex flex-col pt-3'>
                    <label htmlFor="email">Email</label>
                    <input className='border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500' type="email" name='email' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} /><br />
                    {(signUpArea.touched.email && signUpArea.errors.email) && <small className='text-danger'>{signUpArea.errors.email}</small>}<br />
                </div>
                <div className=' flex flex-col'>
                    <label htmlFor="password" className='text-base'>Password</label>
                    <div className="relative flex items-center">
                        <input className='w-full border-2 border-amber-300 p-1 rounded-lg focus:border-yellow-600 focus:outline focus:outline-yellow-500 pr-8' type={showPassword ? "text" : "password"} name='password' onChange={signUpArea.handleChange} onBlur={signUpArea.handleBlur} />
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
                    {(signUpArea.touched.firstName && signUpArea.errors.firstName) && <small className='text-danger'>{signUpArea.errors.firstName}</small>}<br />
                </div>
                <button type='submit' onClick={signUpArea.handleSubmit} className='py-1 bg-amber-600 border w-full rounded-xl md:text-lg'>Create Account</button>
                {/* <hr className='' /> */}

                <p className='flex justify-center pt-2'>Already have an account? <span className='ps-1'><Link to={'/login'}>Login</Link></span></p>
            </div>
        </div>
    )
}

export default SignUp