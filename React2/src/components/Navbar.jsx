import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import ProfileModal from './ProfileModal'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMode } from '../context/ModeContext'
import Avatar from './Avatar'
import Cookies from 'js-cookie'
import axios from 'axios'

// Mobile speed-dial items — labels kept short so the circles stay small.
const MOBILE_NAV = [
  { to: '/landing-page', label: 'Home', icon: 'home' },
  { to: '/create', label: 'Create', icon: 'add' },
  { to: '/explore', label: 'Explore', icon: 'explore' },
  { to: '/my-moments', label: 'Moments', icon: 'bookmark' },
]

const Navbar = () => {
  const [isProfileOpened, setisProfileOpened] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { mode, toggleMode } = useMode()
  const token = Cookies.get('token')
  const { data:userData, isError} = useQuery({
     queryKey: ['profile'],
     enabled: !!token, // Only fetch if token exists
     queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data.data
     }
  })

  useEffect(() => {
    if (isError) Cookies.remove('token') // If the token is invalid, remove it!
  }, [isError])
  const isloggedIn = !!token && !isError
  const location = useLocation()
  const noNavBar =['/login', '/sign-up', '/forgot-password']
  if (noNavBar.includes(location.pathname) || location.pathname.startsWith('/reset-password')) {
    return null
  }
  const handleProfileClick = () => {
    setisProfileOpened(!isProfileOpened)
  }


  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 bg-surface/40 backdrop-blur rounded-full mt-4 mx-auto max-w-7xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-surface-high/50">
      {/* <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 mt-16 bg-stone-900/40 backdrop-blur-xl rounded-full mx-auto max-w-7xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50"> */}
      <div className="text-3xl font-serif italic text-primary">Moments</div>
      <div className="hidden md:flex items-center space-gap-8 gap-8">
        <NavLink to='/landing-page' className= {({ isActive }) => isActive ?'text-text font-bold border-b border-primary/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-text/70 font-label text-sm uppercase tracking-widest hover:text-primary transition-colors'}>Home</NavLink>

        {/* location.pathname.startsWith('/create') so it stays active on BOTH count-up and count-down! */}
        <NavLink to='/create' className={() => location.pathname.startsWith('/create') ?'text-primary font-bold border-b-2 border-primary/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-text/70 font-label text-sm uppercase tracking-widest hover:text-primary transition-colors' }>Create</NavLink>
        <NavLink to='/explore' className= {({ isActive }) => isActive ?'text-primary font-bold border-b-2 border-primary/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-text/70 font-label text-sm uppercase tracking-widest hover:text-primary transition-colors'}>Explore</NavLink>
        {/* <NavLink className="text-orange-100/70 font-label text-sm uppercase tracking-widest hover:text-orange-200 transition-colors" href="#">Feed</NavLink> */}
        <NavLink to='/my-moments' className= {({ isActive }) => isActive ?'text-primary font-bold border-b-2 border-primary/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-text/70 font-label text-sm uppercase tracking-widest hover:text-primary transition-colors'}>My Moments</NavLink>
      </div>
      {/* Added 'relative' here so the absolute dropdown anchors to this specific div */}
      <div className="relative flex items-center gap-4">
        <button
          onClick={toggleMode}
          aria-label="Toggle light and dark mode"
          className="flex items-center justify-center w-10 h-10 rounded-full text-lg text-text/80 border border-border-mid hover:text-primary hover:border-primary transition-colors"
        >
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
        {isloggedIn ? (
          <>
            <button onClick={handleProfileClick} className="flex items-center transition-transform hover:scale-105 active:scale-95">
              {userData ? (
                <Avatar seed={userData.email} avatarStyle={userData.avatarStyle} options={userData.avatarOptions} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 shrink-0 shadow-lg" />
              ) : (
                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">account_circle</span>
              )}
            </button>
            <ProfileModal open={isProfileOpened} onClose={() => setisProfileOpened(false)} userData={userData} />
          </>
        ) : (
          <NavLink to="/login" className="text-sm font-label uppercase tracking-widest border bg-primary text-on-primary  border-primary-hover px-5 py-2.5 rounded-full hover:bg-primary-hover transition-all shadow-lg hover:scale-105">
            Sign In
          </NavLink>
        )}
      </div>
    </nav>
      {/* Mobile speed-dial menu (hidden on md+). A menu circle floats near the
          top-right and fans the nav items down as small labelled circles;
          tapping one navigates + collapses back to the menu circle. */}
      <div className="md:hidden">
        {/* dim backdrop while open */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
        <div className="fixed top-20 right-4 z-50 flex flex-col items-center gap-3">
          {/* menu circle */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-2xl grid place-items-center active:scale-95 transition-transform"
          >
            <span className={`material-symbols-outlined text-[26px] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          {MOBILE_NAV.map((item, i) => {
            const active = item.to === '/create'
              ? location.pathname.startsWith('/create')
              : location.pathname === item.to
            return (
              <button
                key={item.to}
                onClick={() => { navigate(item.to); setMobileMenuOpen(false) }}
                style={{ transitionDelay: mobileMenuOpen ? `${(i + 1) * 40}ms` : '0ms' }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'}`}
              >
                <span className={`w-12 h-12 rounded-full grid place-items-center shadow-lg border transition-colors ${active ? 'bg-primary text-on-primary border-primary' : 'bg-surface-high/90 backdrop-blur text-text border-border-mid'}`}>
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                </span>
                <span className={`font-label text-[10px] uppercase tracking-wider ${active ? 'text-primary' : 'text-text-muted'}`}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
       </header>

  )
}

export default Navbar