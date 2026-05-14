import React, { useEffect, useState } from 'react'

const Welcome = () => {
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
    <div>
        <div>
            <span>{time}</span>
        </div>
    </div>
  )
}

export default Welcome