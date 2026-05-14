// import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMode } from '../context/ModeContext'

const Hero = () => {
  const navigate = useNavigate()
  const { dispatch } = useMode()


  return (
    <div>
      <section className='flex mt-20 ms-6 absolute inset-0 sunset-gradient overflow-hidden'>
      {/* <div class="absolute inset-0 sunset-gradient opacity-40"></div> */}

        <div className="sm:flex-col px-6 w-full mx-auto md:mt-10">
          <span className="inline-block font-label text-sm uppercase tracking-[0.3em] text-tertiary mb-6 animate-pulse">A Sense of Presence</span>
          <h1 className="font-headline italic text-5xl md:text-6xl text-on-surface tracking-tight leading-tight mb-8 text-glow text-amber-300">
            Your time,<br /> beautifully held.
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed w-6/12 text-parchment-400">
            Whether you're reaching for the future or cherishing the past, we provide the space to visualize your most meaningful milestones.
          </p>
          <button className='py-3 bg-amber-500 w-2xs border border-tawny-500 rounded-3xl md:text-lg sm:mt-4 ' >Get Started</button>
        </div>


        <div className="mt-20">
          <div className='md:mt-35'>
            <div className="glass-bubble absolute top-20 right-20 w-64 h-64 md:w-76 md:h-76 rounded-full flex flex-col items-center justify-center p-8 text-center cursor-pointer group transition-all duration-700 hover:scale-110 hover:shadow-[0_0_50px_rgba(201,136,58,0.2)] animate-breathing"  onClick={() => {
         dispatch({ type: 'SET_MODE', payload: 'count-up' })
         navigate('/create/count-up')}}>
              <span className="text-primary text-xs font-headline tracking-[0.4em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">The Ascension</span>
              <h3 className="text-4xl md:text-5xl font-headline font-bold mb-2">Count Up</h3>
              <p className="text-xs  font-light px-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Witness the accumulation of your growth</p>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary scale-150">expand_less</span>
              </div>
            </div>
            <div className="glass-bubble absolute bottom-0 right-70 w-60 h-60 md:w-68 md:h-68 rounded-full flex flex-col items-center justify-center p-8 text-center cursor-pointer group transition-all duration-700 hover:scale-110 hover:shadow-[0_0_50px_rgba(206,140,60,0.2)] animate-breathing" onClick={() => {
         dispatch({ type: 'SET_MODE', payload: 'count-down' })
         navigate('/create/count-down') }}>
              <span className="text-primary text-xs font-headline tracking-[0.4em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">The Presence</span>
              <h3 className="text-4xl md:text-5xl font-headline font-bold mb-2">Countdown</h3>
              <p className="text-xs font-light px-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Honoring the finitude of moments that matter most.</p>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary scale-150">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section> */}

      {/* </section> */}
    </div>
  )
}

export default Hero