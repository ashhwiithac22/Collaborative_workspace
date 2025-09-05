import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const isAuth = !!token
    setIsAuthenticated(isAuth)
    if (isAuth) {
      setCurrentPage('home')
    }
  }, [])

  const handleNavigate = (page) => {
    setCurrentPage(page)
    if (page === 'logout') {
      setIsAuthenticated(false)
    } else if (page === 'home') {
      setIsAuthenticated(true)
    }
  }

  // Optional: Use isAuthenticated for conditional rendering or other logic
  console.log('User authenticated:', isAuthenticated)

  return (
    <div className="app">
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <Signup onNavigate={handleNavigate} />}
      {currentPage === 'home' && <Dashboard onNavigate={handleNavigate} />}
    </div>
  )
}

export default App