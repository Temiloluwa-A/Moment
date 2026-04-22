import React, { useState } from 'react'

const timezones = ['Africa/Lagos', 'UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo']

const TitleField = ({ value, onChange }) => (
  <label className="title-field">
    <span>Timer title</span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Enter a title for this count-up"
      maxLength={60}
    />
  </label>
)

const Customize = ({
  isValid,
  moodText,
  onMoodChange,
  displayUnits,
  setDisplayUnits,
  timerTitle,
  setTimerTitle,
  targetDate,
  setTargetDate,
  targetTime,
  setTargetTime,
  noEndDate,
  setNoEndDate,
  timezone,
  setTimezone,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Basics')

  return (
    <>
      <div className="drawer-actions">
        <button
          className="btn btn-secondary drawer-toggle-button"
          type="button"
          onClick={() => setDrawerOpen((prev) => !prev)}
          disabled={!isValid}
        >
          DrawerToggleButton
        </button>
        {!isValid && <small className="drawer-hint">Open drawer after selecting Count-up mode.</small>}
      </div>

      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`customization-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <h2>Customization</h2>
            <p>Fine-tune your count-up session.</p>
          </div>
          <button className="drawer-close" type="button" onClick={() => setDrawerOpen(false)}>
            Close
          </button>
        </div>

        <div className="drawer-tabs">
          {['Basics', 'Timer', 'Mood', 'Settings'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`drawer-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="drawer-panels">
          <section className={`drawer-panel ${activeTab === 'Basics' ? 'active' : ''}`}>
            <h3>Basics</h3>
            <TitleField value={timerTitle} onChange={(e) => setTimerTitle(e.target.value)} />
            <div className="datetime-row">
              <label>
                Date
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} disabled={noEndDate} />
              </label>
              <label>
                Time
                <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} disabled={noEndDate} />
              </label>
            </div>
            <label className="drawer-switch">
              <span>No end date</span>
              <input type="checkbox" checked={noEndDate} onChange={() => setNoEndDate((prev) => !prev)} />
            </label>
            <label className="timezone-field">
              <span>Time for location</span>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className={`drawer-panel ${activeTab === 'Look' ? 'active' : ''}`}>
            <h3>Timer</h3>
            <p>Auto-start is enabled when tapping the clock.</p>
            <div className="unit-toggle-grid">
              {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                <label key={unit} className="drawer-switch unit-toggle">
                  <span>{unit}</span>
                  <input
                    type="checkbox"
                    checked={displayUnits.includes(unit)}
                    onChange={() =>
                      setDisplayUnits((prev) =>
                        prev.includes(unit) ? prev.filter((item) => item !== unit) : [...prev, unit]
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className={`drawer-panel ${activeTab === 'Mood' ? 'active' : ''}`}>
            <h3>Mood</h3>
            <p>Customize the prompt that appears while counting.</p>
            <textarea
              rows={4}
              value={moodText}
              onChange={onMoodChange}
              placeholder="Mood prompt for this session"
            />
          </section>

          <section className={`drawer-panel ${activeTab === 'Settings' ? 'active' : ''}`}>
            <h3>Settings</h3>
            <p>Additional session options.</p>
            <label className="drawer-switch">
              <span>Sound on complete</span>
              <input type="checkbox" />
            </label>
          </section>
        </div>
      </aside>
    </>
  )
}

export default Customize
