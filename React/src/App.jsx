import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Create from './pages/Create'
import CreateCountUp from './pages/CreateCountUp'
import CreateCountDown from './pages/CreateCountDown'
import { ModeProvider } from './context/ModeContext'

const App = () => {
  return (
    <ModeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/create" element={<Create />} />
          <Route path="/create/countup" element={<CreateCountUp />} />
          <Route path="/create/countdown" element={<CreateCountDown />} />
        </Routes>
      </BrowserRouter>
    </ModeProvider>
  )
}

export default App
