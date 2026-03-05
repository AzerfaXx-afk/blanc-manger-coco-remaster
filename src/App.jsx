import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Rules from './pages/Rules'
import { initGlobalAudio } from './utils/audio'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    initGlobalAudio();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </div>
  )
}

export default App
