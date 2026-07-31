// import React from 'react'
import { useNavigate } from 'react-router-dom'

// How-it-works steps
const STEPS = [
  {
    icon: 'add_circle',
    title: 'Create a moment',
    body: 'Pick a count-up or a countdown, give it a title, and set the date that matters.',
  },
  {
    icon: 'palette',
    title: 'Make it yours',
    body: 'Choose a background, a mood, and a look so the moment feels like the thing it holds.',
  },
  {
    icon: 'ios_share',
    title: 'Share & feel it',
    body: 'Send a link, let others join and root for it, and watch the time unfold together.',
  },
]

const Hero = () => {
  const navigate = useNavigate()

  const startCountUp = () => navigate('/create/count-up')
  const startCountDown = () => navigate('/create/count-down')

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative flex flex-col lg:flex-row items-center min-h-screen pt-24 pb-12 px-5 md:pt-28 md:pb-20 md:px-6 overflow-hidden">
        {/* Warm wash — theme-aware: amber glow on espresso (dark), honey glow on cream (light) */}
        <div className="hero-wash absolute inset-0 z-0 pointer-events-none" />

        <div className="relative z-10 w-full lg:w-1/2 max-w-2xl mx-auto text-center lg:text-left">
          <span className="inline-block font-label text-sm uppercase tracking-[0.3em] text-primary mb-6 animate-pulse">A Sense of Presence</span>
          <h1 className="font-headline italic text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight mb-6 text-glow text-primary">
            Your time,<br /> beautifully held.
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed text-text mb-4">
            Moment turns the dates you care about into living count-ups and countdowns you can feel.
          </p>
          <p className="font-body text-base leading-relaxed text-text-muted mb-8 max-w-xl">
            Track a streak as it grows, count down to the thing you can't wait for, then customize it, share it, and let others root for it alongside you.
          </p>
          <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
            <button
              className="px-9 py-3 bg-primary text-on-primary rounded-full md:text-lg font-medium cursor-pointer transition-all hover:bg-primary-hover hover:scale-105 shadow-lg"
              onClick={() => navigate('/sign-up')}
            >
              Get Started — it's free
            </button>
            <button
              className="btn-glass px-9 py-3 text-text rounded-full md:text-lg cursor-pointer hover:text-primary"
              onClick={() => navigate('/explore')}
            >
              Explore the Collective
            </button>
          </div>
        </div>

        <div className="relative z-10 w-full lg:w-1/2 hidden lg:flex justify-center lg:justify-end mt-16 lg:mt-0">
          {/* Relative frame so the orbs position within the right column only,
              never drifting onto the copy. Stacks vertically on mobile. */}
          <div className="relative flex flex-col items-center gap-10 lg:block lg:w-full lg:max-w-xl lg:h-[\540px]\">
            {/* Count-up — upper right */}
            <div
              className="glass-bubble lg:absolute lg:top-4 lg:right-8 w-60 h-60 md:w-72 md:h-72 rounded-full flex flex-col items-center justify-center p-8 text-center cursor-pointer group transition-all duration-700 hover:scale-110 hover:shadow-[0_0_50px_rgba(201,136,58,0.2)] animate-breathing"
              onClick={startCountUp}
            >
              <span className="text-primary text-xs font-headline tracking-[0.4em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">The Ascension</span>
              <h3 className="text-4xl md:text-5xl font-headline italic mb-2 text-text">Count Up</h3>
              <p className="text-xs font-light px-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Witness the accumulation of your growth</p>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary scale-150">expand_less</span>
              </div>
            </div>
            {/* Countdown — lower left, dropped down so it clears the count-up orb */}
            <div
              className="glass-bubble lg:absolute lg:bottom-6 lg:left-4 w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center p-8 text-center cursor-pointer group transition-all duration-700 hover:scale-110 hover:shadow-[0_0_50px_rgba(206,140,60,0.2)] animate-breathing"
              onClick={startCountDown}
            >
              <span className="text-primary text-xs font-headline tracking-[0.4em] uppercase mb-4 opacity-60 group-hover:opacity-100 transition-opacity">The Presence</span>
              <h3 className="text-4xl md:text-5xl font-headline italic mb-2 text-text">Countdown</h3>
              <p className="text-xs font-light px-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">Honoring the finitude of moments that matter most.</p>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-primary scale-150">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHAT IS MOMENT — value strip
      ══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-bg-deep">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-headline italic text-3xl md:text-4xl text-text mb-4">
            Some things are worth keeping time with.
          </h2>
          <p className="font-body text-text-muted text-lg leading-relaxed max-w-3xl mx-auto">
            A sobriety streak. Days until you see them again. Weeks into a new practice. Moment gives those numbers a home that's beautiful enough to look at every day — and easy enough to share in a tap.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="py-28 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-label tracking-[0.3em] uppercase text-xs">How it works</span>
            <h2 className="font-headline italic text-4xl md:text-5xl text-text mt-3">Three steps to your first moment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative glass rounded-2xl p-8 text-center transition-all duration-500 hover:-translate-y-2">
                <span className="absolute top-6 right-6 font-headline italic text-5xl text-primary/15 leading-none select-none">0{i + 1}</span>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <h3 className="font-headline text-2xl text-text mb-3">{step.title}</h3>
                <p className="text-text-muted font-body leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          THE TWO MODES — feature cards
      ══════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden bg-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <span className="text-primary font-label tracking-[0.3em] uppercase text-xs">Two ways to keep time</span>
            <h2 className="font-headline italic text-4xl md:text-5xl text-text">Creating meaningful moments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Count-Up card */}
            <button
              onClick={startCountUp}
              className="text-left glass rounded-2xl p-10 group transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
              </div>
              <h3 className="font-headline text-3xl text-text mb-3">Begin a Count-Up</h3>
              <p className="text-text-muted font-body leading-relaxed mb-8">
                Witness the accumulation of your growth. Perfect for tracking sobriety, meditation streaks, or creative projects.
              </p>
              <span className="flex items-center gap-2 text-primary font-semibold tracking-wide uppercase text-xs">
                Start journey
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
            </button>

            {/* Countdown card */}
            <button
              onClick={startCountDown}
              className="text-left glass rounded-2xl p-10 group transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
              </div>
              <h3 className="font-headline text-3xl text-text mb-3">Set a Countdown</h3>
              <p className="text-text-muted font-body leading-relaxed mb-8">
                Nurture the thrill of what's to come. Mark upcoming reunions, travels, or personal milestones.
              </p>
              <span className="flex items-center gap-2 text-primary font-semibold tracking-wide uppercase text-xs">
                Mark event
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          THE COLLECTIVE — community / social proof
      ══════════════════════════════════════ */}
      <section className="py-28 px-6 bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-primary font-label tracking-[0.3em] uppercase text-xs">The Collective</span>
          <h2 className="font-headline italic text-4xl md:text-5xl text-text mt-3 mb-6">
            You don't have to keep time alone.
          </h2>
          <p className="font-body text-text-muted text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Share a moment publicly and it joins the Collective, where anyone can witness it and root for it. See what the community is counting toward — and let them cheer you on, too.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: 'groups', label: 'Join others', body: 'Follow a shared moment and watch its time unfold with you.' },
              { icon: 'favorite', label: 'Root for it', body: 'Send support to the moments that move you with a single tap.' },
              { icon: 'public', label: 'Be witnessed', body: 'Let your milestones inspire the people counting alongside you.' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-6">
                <span className="material-symbols-outlined text-primary text-3xl mb-3">{item.icon}</span>
                <h3 className="font-headline text-xl text-text mb-2">{item.label}</h3>
                <p className="text-sm text-text-muted font-body leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="px-8 py-3 border border-border-mid text-text rounded-full transition-all hover:border-primary hover:text-primary cursor-pointer"
          >
            Browse the Collective
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden sunset-gradient">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-headline italic text-4xl md:text-6xl text-primary text-glow mb-6">
            Start with the moment that matters most.
          </h2>
          <p className="font-body text-text-muted text-lg mb-10">
            It takes less than a minute to create your first count-up or countdown.
          </p>
          <button
            className="px-10 py-4 bg-primary text-on-primary rounded-full text-lg font-medium cursor-pointer transition-all hover:bg-primary-hover hover:scale-105 shadow-lg"
            onClick={() => navigate('/sign-up')}
          >
            Create your first moment
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="bg-bg-deep border-t border-border px-6 py-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="text-3xl font-headline italic text-primary mb-3">Moments</div>
            <p className="text-sm text-text-muted font-body leading-relaxed">
              Your time, beautifully held. Count-ups and countdowns for the things that matter.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="font-label text-xs uppercase tracking-[0.2em] text-text-subtle mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={startCountUp} className="text-text-muted hover:text-primary transition-colors cursor-pointer">Count-Up</button></li>
                <li><button onClick={startCountDown} className="text-text-muted hover:text-primary transition-colors cursor-pointer">Countdown</button></li>
                <li><button onClick={() => navigate('/explore')} className="text-text-muted hover:text-primary transition-colors cursor-pointer">The Collective</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label text-xs uppercase tracking-[0.2em] text-text-subtle mb-4">Account</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => navigate('/sign-up')} className="text-text-muted hover:text-primary transition-colors cursor-pointer">Sign up</button></li>
                <li><button onClick={() => navigate('/login')} className="text-text-muted hover:text-primary transition-colors cursor-pointer">Log in</button></li>
                <li><button onClick={() => navigate('/my-moments')} className="text-text-muted hover:text-primary transition-colors cursor-pointer">My Moments</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border text-center text-xs text-text-subtle font-label tracking-widest uppercase">
          © {new Date().getFullYear()} Moment · A sense of presence
        </div>
      </footer>
    </div>
  )
}

export default Hero
