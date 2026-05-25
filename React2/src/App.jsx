// import tailw from './index.css'
// import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Create from './pages/Create'
import CreateCountUp from './pages/CreateCountUp'
import CreateCountDown from './pages/CreateCountDown'
import { ModeProvider } from './context/ModeContext'
import { TimerProvider } from './context/TimerContext'
import SignUp from './components/SignUp'
import Login from './components/Login'
import Explore from './pages/Explore'
import MyMoments from './pages/MyMoments'
import SharedMoment from './pages/SharedMoment'
import JoinMoment from './pages/JoinMoment'

const App = () => {
  return (
    <ModeProvider>
      <TimerProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/landing-page" replace={true} />} />
            {/* replace true means that the current page will be replaced in the history stack */}
            <Route path="/landing-page" element={<Hero />} />
            <Route path="*" element={<h1>404 page not found</h1>} />
            <Route path="/create" element={<Create />} >
              <Route index element={<Navigate to= 'count-up' replace={true} />} />
              <Route path="count-up" element={<CreateCountUp />} />
              <Route path="count-down" element={<CreateCountDown />} />
            </Route>
            <Route path='/sign-up' element={<SignUp />} />
            <Route path='/login' element={<Login />} />
            <Route path='/explore' element={<Explore />} />
            <Route path='/my-moments' element={<MyMoments />} /> 
            {/* dynamic routing */}
            <Route path='/moment/:slug' element={<SharedMoment />} />
            <Route path='/join/:slug' element={<JoinMoment />} />
          </Routes>
        </BrowserRouter>
      </TimerProvider>
    </ModeProvider>
  )
}

export default App
