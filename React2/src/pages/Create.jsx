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

      {/* Top Right: floating button removed here; Customize handles mobile toggle */}

      {/* Main Content Area (Where the Timers will show up) */}
      <div className={`flex-1 flex justify-center items-center transition-all duration-500 ease-in-out pb-10 ${isPanelOpen ? 'w-full lg:w-[60%]' : 'w-full'}`}>
        <Outlet context={{ isPanelOpen }} />
      </div>

      {/* Desktop: Full Screen Height Customize Panel Drawer (shown on lg and up) */}
      <div className={`hidden lg:block fixed right-0 top-0 h-screen lg:w-[40%] w-full transition-transform duration-500 ease-in-out z-[60] bg-stone-900/80 backdrop-blur-3xl shadow-2xl border-l border-white/10 overflow-y-auto ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Customize />
      </div>

      {/* Mobile: render Customize so it can show its floating button + BottomDrawer (hidden on lg) */}
      <div className="block lg:hidden">
        <Customize />
      </div>
    </div>
  )
}

export default Create
