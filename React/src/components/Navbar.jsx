import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const Navigate = useNavigate()
  const Location = useLocation()
  const noNavBar =['/login', '/sign-up']
  if (noNavBar.includes(Location.pathname)) {
    return null
  }
  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 bg-stone-900/40 backdrop-blur-xl rounded-full mt-4 mx-auto max-w-7xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50">
      <div className="text-2xl font-serif italic text-orange-100">Moments</div>
      <div className="hidden md:flex items-center space-gap-8 gap-8">
        <a className="text-orange-200 font-bold border-b-2 border-orange-200/50 pb-1 font-label text-sm uppercase tracking-widest" href="#">Explore</a>
        <a className="text-orange-100/70 font-label text-sm uppercase tracking-widest hover:text-orange-200 transition-colors" href="#">Feed</a>
        <a className="text-orange-100/70 font-label text-sm uppercase tracking-widest hover:text-orange-200 transition-colors" href="#">My Moments</a>
      </div>
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-orange-200 text-2xl">account_circle</button>
      </div>
    </nav>
    </header>
    
  )
}

export default Navbar