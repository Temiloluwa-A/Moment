import React from 'react'

const Panels = ({ children, className}) => { //children for any nested elements passed into it amd classname for additional styling
    //classname in div conatiner appends any other styling
  return (
    <div tabIndex={0} className={`
        focus:outline-none focus:border *:rounded-full px-4 py-3 focus:border-primary-subtle border focus:text-primary
        ${className} 
    `}>

        {children}
    </div>
  )
}

export default Panels