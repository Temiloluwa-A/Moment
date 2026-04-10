import React, { useState, useEffect } from 'react'
import { useMode } from '../context/ModeContext'
import { Link } from 'react-router-dom'

const formatElapsedTime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `Day ${days} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const countWords = (text) => {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length
}

const CreateCountUp = () => {
  const { mode } = useMode()
  const isValid = mode === 'countUp'
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [moodText, setMoodText] = useState('')

  const maxWords = 280
  const wordCount = countWords(moodText)
  const remaining = maxWords - wordCount

  const handleMoodChange = (event) => {
    const value = event.target.value
    const words = value.trim().split(/\s+/).filter(Boolean)
    if (words.length <= maxWords) {
      setMoodText(value)
      return
    }

    setMoodText(words.slice(0, maxWords).join(' '))
  }

  useEffect(() => {
    if (!isRunning) return undefined

    const interval = setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <main className="create-page create-countup">
      <section className="create-card">
        <div className="create-header">
          <span className="mode-pill mode-countup">Count-up</span>
          <h1>Count-up session</h1>
          <p className="create-copy">Track elapsed time and build momentum.</p>
          {!isValid && (
            <p className="create-copy" style={{ color: 'var(--black-cherry)' }}>
              This page is intended for count-up mode. Return to the landing page and select Count-up.
            </p>
          )}
        </div>

        <div className="create-mode-panel countup-panel">
          <div className="mode-preview" onClick={() => isValid && setIsRunning(true)}>
            <div className="mode-clock">{formatElapsedTime(elapsedSeconds)}</div>
            <p>{isRunning ? 'Timer is running. Keep your mood flowing.' : 'Tap the clock to start counting.'}</p>
          </div>

          <div className="mood-card">
            <div className="waiting-message">
              {isRunning
                ? 'Waiting for your mood as the seconds pass.'
                : 'Waiting for your tap. Add a mood note before the count-up begins.'}
            </div>
            <textarea
              className="mood-textarea"
              value={moodText}
              onChange={handleMoodChange}
              placeholder="Write how you feel while counting up..."
              rows={8}
              disabled={!isValid}
            />
            <div className="mood-footer">
              <span>{remaining} words remaining</span>
              <button className="btn btn-secondary">Save mood</button>
            </div>
          </div>

          <div className="create-actions">
            <button className="btn btn-secondary" disabled>
              Customize
            </button>
            {!isValid && (
              <Link className="btn btn-secondary" to="/">
                Back to landing
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default CreateCountUp
