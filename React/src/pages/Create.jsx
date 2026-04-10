import React from 'react'
import { Link } from 'react-router-dom'
import { useMode } from '../context/ModeContext'

const createConfig = {
  countUp: {
    title: 'Count-up session',
    subtitle: 'Track elapsed time and build momentum.',
    message: 'Elapsed mode helps you log progress as time grows. Your experience expands with every second.',
    badgeClass: 'mode-countup',
  },
  countDown: {
    title: 'Count-down session',
    subtitle: 'Set the target and feel the countdown energy.',
    message: 'Countdown mode helps you focus on the deadline, measuring how much time remains until the moment arrives.',
    badgeClass: 'mode-countdown',
  },
}

const Create = () => {
  const { mode } = useMode()
  const config = createConfig[mode]

  return (
    <main className={`create-page ${config ? `create-${mode}` : ''}`}>
      <section className="create-card">
        <div className="create-header">
          <span className={`mode-pill ${config?.badgeClass ?? ''}`}>{mode ?? 'none'}</span>
          <h1>{config?.title ?? 'Create a new session'}</h1>
          <p className="create-copy">
            {config?.subtitle ?? 'Choose a mode from the landing page first.'}
          </p>
        </div>

        <div className="create-details">
          <p>{config?.message ?? 'Select Count-up or Count-down on the hero page to continue.'}</p>
        </div>

        {!config && (
          <div className="create-actions">
            <Link to="/" className="btn btn-secondary">
              Back to landing
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default Create
