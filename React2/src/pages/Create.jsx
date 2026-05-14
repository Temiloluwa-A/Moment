import { useState, useEffect } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import Customize from "../components/Customize"
import { useTimer } from "../context/TimerContext"

const Create = () => {
  // We manage the panel open/close state here in the parent!
  const [isPanelOpen, setisPanelOpen] = useState(false)
  const location = useLocation();
  const { loadConfig } = useTimer();
  
  // Check if the router passed us an "isCompleted" flag
  const isCompleted = location.state?.isCompleted || false;

  useEffect(() => {
    // If we navigated here by clicking a card, load that card's data into the timer!
    if (location.state?.savedConfig) {
      loadConfig(location.state.savedConfig);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      
      {/* Top Header Row: Placed perfectly below the navbar */}
      <div className="pt-24 px-8 relative z-40 flex justify-between items-start">
        
        {/* Top Left: Toggle Buttons */}
        <div className="bg-stone-800/60 p-1.5 mb-3 rounded-full inline-flex items-center gap-1 backdrop-blur-md border border-white/5 shadow-lg">
          <NavLink 
            to='count-up' 
            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-label font-bold tracking-widest transition-all duration-500 ${isActive ? 'bg-amber-300 text-stone-900 shadow-lg pointer-events-none cursor-default' : 'text-amber-100/50 hover:text-expresso-100 hover:bg-white/5'}`} 
          >
            COUNT-UP
          </NavLink>
          <NavLink 
            to='count-down' 
            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-label font-bold tracking-widest transition-all duration-500 ${isActive ? 'bg-amber-300 text-stone-900 shadow-lg pointer-events-none cursor-default' : 'text-amber-100/50 hover:text-expresso-100 hover:bg-white/5'}`} 
          >
            COUNTDOWN
          </NavLink>
        </div>
      </div>

      {/* Top Right: Floating Customize Button */}
      {!isCompleted && (
        <button 
          onClick={() => setisPanelOpen(!isPanelOpen)} 
          className={`absolute top-24 z-[70] bg-stone-800/80 backdrop-blur-md text-orange-200 border border-white/10 px-6 py-2.5 rounded-full shadow-2xl hover:bg-stone-700 hover:scale-105 transition-all duration-500 flex items-center gap-2 font-label text-sm tracking-widest uppercase ${isPanelOpen ? 'right-6 lg:right-[calc(40%+1.5rem)]' : 'right-8'}`}
        >
          <span className="material-symbols-outlined text-xs">{isPanelOpen ? 'close' : 'tune'}</span>
          {isPanelOpen ? 'Close' : 'Customize'}
        </button>
      )}

      {/* Main Content Area (Where the Timers will show up) */}
      <div className={`flex-1 flex justify-center items-center transition-all duration-500 ease-in-out pb-10 ${isPanelOpen ? 'w-full lg:w-[60%]' : 'w-full'}`}>
        <Outlet context={{ isPanelOpen }} />
      </div>

      {/* Full Screen Height Customize Panel Drawer */}
      <div className={`fixed right-0 top-0 h-screen w-full lg:w-[40%] transition-transform duration-500 ease-in-out z-[60] bg-stone-900/80 backdrop-blur-3xl shadow-2xl border-l border-white/10 overflow-y-auto ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Customize />
      </div>
    </div>
  )
}

export default Create
