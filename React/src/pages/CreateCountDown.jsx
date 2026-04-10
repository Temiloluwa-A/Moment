import React from 'react'
import { useMode } from '../context/ModeContext'
import { Link } from 'react-router-dom'

const CreateCountDown = () => {
  const { mode } = useMode()
  const isValid = mode === 'countDown'

  return (
    <main className="create-page create-countdown">
      <section className="create-card">
        <div className="create-header">
          <span className="mode-pill mode-countdown">Count-down</span>
          <h1>Count-down session</h1>
          <p className="create-copy">Set a target and feel the countdown energy.</p>
          {!isValid && (
            <p className="create-copy" style={{ color: 'var(--black-cherry)' }}>
              This page is intended for countdown mode. Return to the landing page and select Count-down.
            </p>
          )}
        </div>

        <div className="create-mode-panel countdown-panel">
          <div className="countdown-form">
            <label htmlFor="target-time">Target duration</label>
            <input id="target-time" type="number" min="1" placeholder="Minutes" />
            <small>Set how much time remains until your target event.</small>
          </div>
          <div className="create-actions">
            <button className="btn btn-primary">Start countdown</button>
            <button className="btn btn-secondary">Adjust timer</button>
          </div>
          {!isValid && (
            <div className="create-actions">
              <Link className="btn btn-secondary" to="/">
                Back to landing
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default CreateCountDown
