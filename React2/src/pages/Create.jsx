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
  // Absent when creating fresh (always the owner) or viewing a public /moment/:slug
  // link (a separate, always-read-only route). Only MyMoments passes this
  // explicitly, for a moment that might belong to someone else.
  const isOwner = location.state?.isOwner !== false;
  // A group member can view but not edit someone else's moment settings —
  // the backend already enforces owner-only writes, this just makes the UI
  // honest about it instead of failing silently on save.
  const isReadOnly = isCompleted || !isOwner;

  useEffect(() => {
    // If we navigated here by clicking a card, load that card's data into the timer!
    if (location.state?.savedConfig) {
      loadConfig(location.state.savedConfig);
    }
  }, [location.state, loadConfig]);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">
      
      {/* Top Header Row: Placed perfectly below the navbar */}
      <div className="pt-24 px-8 relative z-40 flex justify-between items-start">
        
        {/* Top Left: Toggle Buttons */}
        <div className="bg-surface/60 p-1.5 mb-3 rounded-full inline-flex items-center gap-1 backdrop-blur-md border border-border shadow-lg">
          <NavLink
            to='count-up'
            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-label font-bold tracking-widest transition-all duration-500 ${isActive ? 'bg-primary text-on-primary shadow-lg pointer-events-none cursor-default' : 'text-text-muted hover:text-text hover:bg-surface-high/50'}`}
          >
            COUNT-UP
          </NavLink>
          <NavLink
            to='count-down'
            className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-label font-bold tracking-widest transition-all duration-500 ${isActive ? 'bg-primary text-on-primary shadow-lg pointer-events-none cursor-default' : 'text-text-muted hover:text-text hover:bg-surface-high/50'}`}
          >
            COUNTDOWN
          </NavLink>
        </div>

        {/* View-only badge: a completed countdown, or someone else's moment, can't be edited */}
        {isReadOnly && (
          <span className="mb-3 bg-success/15 text-success border border-success/30 px-4 py-2 rounded-full font-label text-xs tracking-widest uppercase inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">{isCompleted ? 'lock' : 'group'}</span>
            {isCompleted ? 'Completed · View only' : 'Shared · View only'}
          </span>
        )}
      </div>

      {/* Top Right: Desktop Customize button (visible on lg and up) */}
      {!isReadOnly && (
        <button
          onClick={() => setisPanelOpen(!isPanelOpen)}
          className={`hidden lg:flex absolute top-24 z-[70] bg-surface-high/80 backdrop-blur-md text-primary border border-border px-6 py-2.5 rounded-full shadow-2xl hover:bg-surface-high hover:scale-105 transition-all duration-500 items-center gap-2 font-label text-sm tracking-widest uppercase ${isPanelOpen ? 'right-6 lg:right-[calc(40%+1.5rem)]' : 'right-8'}`}
        >
          <span className="material-symbols-outlined text-xs">{isPanelOpen ? 'close' : 'tune'}</span>
          {isPanelOpen ? 'Close' : 'Customize'}
        </button>
      )}

      {/* Main Content Area (Where the Timers will show up) */}
      <div className={`flex-1 flex justify-center items-start lg:items-center transition-all duration-500 ease-in-out pt-6 lg:pt-0 pb-10 ${isPanelOpen ? 'w-full lg:w-[60%]' : 'w-full'}`}>
        <Outlet context={{ isPanelOpen, readOnly: isReadOnly }} />
      </div>

      {/* Desktop: Full Screen Height Customize Panel Drawer (shown on lg and up) */}
      <div className={`hidden lg:block fixed right-0 top-0 h-screen lg:w-[40%] w-full transition-transform duration-500 ease-in-out z-[60] bg-surface/80 backdrop-blur-3xl shadow-2xl border-l border-border overflow-y-auto ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Customize readOnly={isReadOnly} />
      </div>

      {/* Mobile: render Customize so it can show its floating button + BottomDrawer (hidden on lg) */}
      <div className="block lg:hidden">
        <Customize readOnly={isReadOnly} />
      </div>
    </div>
  )
}

export default Create
