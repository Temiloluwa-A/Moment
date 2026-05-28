import { NavLink, useLocation } from 'react-router-dom'
import Profile from './Profile'
import { useState, useEffect } from 'react'
import Avatar from './Avatar'
import Cookies from 'js-cookie'
import axios from 'axios'

const Navbar = () => {
  const [isProfileOpened, setisProfileOpened] = useState(false)
  const token = Cookies.get('token')
  const [isloggedIn, setisloggedIn] = useState(!!token)
  const [userData, setUserData] = useState(null)
  // Fetch the user's profile to display their Avatar in the Navbar!
  useEffect(() => {
    if (token) {
        axios.get('https://moment-1-h67x.onrender.com/api/v1/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setUserData(res.data.data)
            setisloggedIn(true)
        })
        .catch(() => {
            Cookies.remove('token')
            setisloggedIn(false)
        })
    }
  }, [token])

  // const Navigate = useNavigate()
  const location = useLocation()
  const noNavBar =['/login', '/sign-up']
  if (noNavBar.includes(location.pathname)) {
    return null
  }
  const handleProfileClick = () => {
    setisProfileOpened(!isProfileOpened)
  }
  
  
  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 bg-stone-900/40 backdrop-blur-xl rounded-full mt-4 mx-auto max-w-7xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50">
      {/* <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 mt-16 bg-stone-900/40 backdrop-blur-xl rounded-full mx-auto max-w-7xl transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50"> */}
      <div className="text-3xl font-serif italic text-amber-400">Moments</div>
      <div className="hidden md:flex items-center space-gap-8 gap-8">
        <NavLink to='/landing-page' className= {({ isActive }) => isActive ?'text-parchemnt-400 font-bold border-b border-orange-200/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-parchment-300/70 font-label text-sm uppercase tracking-widest hover:text-amber-200 transition-colors'}>Home</NavLink>

        {/* location.pathname.startsWith('/create') so it stays active on BOTH count-up and count-down! */}
        <NavLink to='/create' className={() => location.pathname.startsWith('/create') ?'text-orange-200 font-bold border-b-2 border-orange-200/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-parchemnt-400/70 font-label text-sm uppercase tracking-widest hover:text-amber-200 transition-colors' }>Create</NavLink>
        <NavLink to='/explore' className= {({ isActive }) => isActive ?'text-orange-200 font-bold border-b-2 border-orange-200/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-parchemnt-300/70 font-label text-sm uppercase tracking-widest hover:text-amber-200 transition-colors'}>Explore</NavLink>
        {/* <NavLink className="text-orange-100/70 font-label text-sm uppercase tracking-widest hover:text-orange-200 transition-colors" href="#">Feed</NavLink> */}
        <NavLink to='/my-moments' className= {({ isActive }) => isActive ?'text-orange-200 font-bold border-b-2 border-orange-200/50 pb-1 font-label text-sm uppercase tracking-widest' :'text-parchemnt-300/70 font-label text-sm uppercase tracking-widest hover:text-orange-200 transition-colors'}>My Moments</NavLink>
      </div>
      {/* Added 'relative' here so the absolute dropdown anchors to this specific div */}
      <div className="relative flex items-center gap-4">
        {isloggedIn ? (
          <>
            <button onClick={handleProfileClick} className="flex items-center transition-transform hover:scale-105 active:scale-95">
              {userData ? (
                <Avatar seed={userData.email} avatarStyle={userData.avatarStyle} options={userData.avatarOptions} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 shrink-0 shadow-lg" />
              ) : (
                <span className="material-symbols-outlined text-orange-200 text-3xl animate-pulse">account_circle</span>
              )}
            </button>
            {isProfileOpened && <Profile />}
          </>
        ) : (
          <NavLink to="/login" className="text-sm font-label uppercase tracking-widest border bg-amber-500 text-stone-900 border-amber-400 px-5 py-2.5 rounded-full hover:bg-amber-400 transition-all shadow-lg hover:scale-105">
            Sign In
          </NavLink>
        )}
      </div>
    </nav>
    </header>
    
  )
}

export default Navbar