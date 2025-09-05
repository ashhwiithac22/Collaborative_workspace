import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')

  return (
    <div className="app">
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'signup' && <Signup onNavigate={setCurrentPage} />}
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
    </div>
  )
}

export default App