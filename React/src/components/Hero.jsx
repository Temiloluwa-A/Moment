import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../context/ModeContext'

const Hero = () => {
  // const timern = new Date().toLocaleTimeString()
  // console.log(timern);
  console.log('REACT IS RUNNING')

  const navigate = useNavigate()
  const { dispatch } = useMode()

  const [time, settime] = useState(new Date().toLocaleTimeString([], { hour12: false }))
  useEffect(() => {
    const interval = setInterval(() => {
      settime(new Date().toLocaleTimeString([], { hour12: false }))
    }, 1000);
  
    return () => {
      clearInterval(interval)
    }
  }, [])
  

  return (
    <div className="hero d-flex flex-column align-items-center justify-content-center">
      <h4>Every second counts</h4>
      <h1>Mark the wait</h1>
      <p>Turn time into an experience</p>
      <div className='liveTime d-flex align-items-center justify-content-center flex-column '>
        <p className='m-0'>RIGHT NOW, SOMEWHERE</p>
        <h3>{time}</h3>
      </div>
      <div className='d-flex gap-2'>
        <button className="btn btn-primary countUp" onClick={() => {
          dispatch({ type: 'SET_MODE', payload: 'countUp' })
          navigate('/create/countup')
        }}>
          Count-up
        </button>
        <button className="btn btn-secondary countDown" onClick={() => {
          dispatch({ type: 'SET_MODE', payload: 'countDown' })
          navigate('/create/countdown')
        }}>
          Count-down
        </button>
      </div>


    </div>
  )
}

export default Hero