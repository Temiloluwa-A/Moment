// import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../context/ModeContext'

const Hero = () => {
  const navigate = useNavigate()
  const { dispatch } = useMode()


  return (
    <div>
      <section className='relative flex flex-col lg:flex-row min-h-screen mt-20 ms-6 sunset-gradient overflow-hidden'>
        {/* <div className="absolute inset-0 sunset-gradient opacity-40"></div> */}

        <div className="px-6 w-full lg:w-1/2 mx-auto md:mt-10">
          <span className="inline-block font-label text-sm uppercase tracking-[0.3em] text-tertiary mb-6 animate-pulse">A Sense of Presence</span>
          <h1 className="font-headline italic text-5xl md:text-6xl text-on-surface tracking-tight leading-tight mb-8 text-glow text-amber-300">
            Your time,<br /> beautifully held.
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed max-w-2xl text-parchment-400">
            Whether you're reaching for the future or cherishing the past, we provide the space to visualize your most meaningful milestones.
          </p>
          <button className='px-9 py-3 bg-amber-400 border border-tawny-500 rounded-full md:text-lg mt-6 cursor-pointer' onClick={() => navigate('/sign-up')}>Get Started</button>
        </div>


        <div className="w-full lg:w-1/2 flex flex-wrap justify-center lg:justify-end items-center mt-12 lg:mt-0 relative min-h-[420px] px-6">
          <div className='lg:mt-35'>
            <div className="glass-bubble lg:absolute top-20 lg:right-20 w-64 h-64 md:w-76 md:h-76 rounded-full flex flex-col items-center justify-center p-8 text-center cursor-pointer group transition-all duration-700 hover:scale-110 hover:shadow-[0_0_50px_rgba(201,136,58,0.2)] animate-breathing" onClick={() => {
              dispatch({ type: 'SET_MODE', payload: 'count-up' })
              navigate('/create/count-up')
            }}>
              <span className="text-primary text-xs font-headline tracking-[0.4em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">The Ascension</span>
              <h3 className="text-4xl md:text-5xl font-headline font-italic mb-2">Count Up</h3>
              <p className="text-xs  font-light px-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Witness the accumulation of your growth</p>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary scale-150">expand_less</span>
              </div>
            </div>
            <div className="glass-bubble lg:absolute bottom-0 lg:right-100 w-60 h-60 md:w-68 md:h-68 rounded-full flex flex-col items-center justify-center p-8 mt-10 mb-5 me-15 text-center cursor-pointer group transition-all duration-700 hover:scale-110 hover:shadow-[0_0_50px_rgba(206,140,60,0.2)] animate-breathing" onClick={() => {
              dispatch({ type: 'SET_MODE', payload: 'count-down' })
              navigate('/create/count-down')
            }}>
              <span className="text-primary text-xs font-headline tracking-[0.4em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">The Presence</span>
              <h3 className="text-4xl md:text-5xl font-headline font-italic mb-2">Countdown</h3>
              <p className="text-xs font-light px-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Honoring the finitude of moments that matter most.</p>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary scale-150">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-12">
          <div className="text-center space-y-4 mb-24">
            <span className="text-tertiary font-label tracking-[0.3em] uppercase text-xs">Special</span>
            <h2 className="text-5xl font-serif font-italic text-on-surface">Creating Meaningful Moments</h2>
            <div className="h-1 w-24 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            {/* <!-- Chronos Card --> */}
            <div className="p-8  bg-stone-900/40 transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50 backdrop-blur rounded-lg group transition-all duration-500 hover:translate-y-\[-8px\] cursor-pointer">
            {/* <div className="group relative bg-surface-container-lowest/90 backdrop-blur-2xl rounded-xl p-8 shadow-[0_20px_50px_rgba(53,50,43,0.06)] hover:translate-y-\[-8px\] transition-transform duration-500 cursor-pointer overflow-hidden"> */}
              <div className="w-32 h-28 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
              <div className="flex flex-col justify-between gap-12 ">
                <div>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined" data-icon="hourglass_top" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                  </div>
                  <h2 className="font-headline text-3xl text-on-surface mb-3">Begin a Count-Up</h2>
                  <p className="text-on-surface-variant font-body leading-relaxed">Witness the accumulation of your growth. Perfect for tracking sobriety, meditation streaks, or creative projects.</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold tracking-wide uppercase text-xs">
                  Start Journey <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                </div>

              </div>
            </div>
            {/* <!-- Kairos Card --> */}
            <div className="p-12 rounded-lg group transition-all duration-500 hover:translate-y-\[-8px\] cursor-pointer bg-stone-900/40 transition-all duration-500 hover:backdrop-blur-3xl hover:bg-stone-800/50 backdrop-blur">
              {/* <div className="group relative bg-surface-container-lowest/90 backdrop-blur-2xl rounded-xl p-8 shadow-[0_20px_50px_rgba(53,50,43,0.06)] hover:translate-y-\[-8px\] transition-transform duration-500 cursor-pointer overflow-hidden"> */}
                <div className="  w-32 h-28 bg-secondary-container/30 rounded-bl-[100px] transition-transform group-hover:scale-110"></div>
                <div className="flex flex-col justify-between gap-12 ">
                  <div>
                    <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-6">
                      <span className="material-symbols-outlined" data-icon="auto_fix_high" style={{ fontVariationSettings: "'FILL' 1" }} >auto_fix_high</span>
                    </div>
                    <h2 className="font-headline text-3xl text-on-surface mb-3">Set a Countdown</h2>
                    <p className="text-on-surface-variant font-body leading-relaxed">Nurture the thrill of what's to come. Mark upcoming reunions, travels, or personal milestones.</p>
                  </div>
                  <div className="flex items-center gap-2 text-secondary font-semibold tracking-wide uppercase text-xs">
                    Mark Event <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </div>
  )
}

export default Hero