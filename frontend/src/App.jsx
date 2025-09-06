import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectEditor from './pages/ProjectEditor';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and is valid
    const token = localStorage.getItem('token');
    
    if (token) {
      // Verify token is valid by making a simple API call
      fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      })
      .catch(error => {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes - only accessible when NOT authenticated */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <Login onAuth={() => setIsAuthenticated(true)} /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/signup" 
            element={
              !isAuthenticated ? 
                <Signup onAuth={() => setIsAuthenticated(true)} /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          
          {/* Protected routes - only accessible when authenticated */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard onLogout={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setIsAuthenticated(false);
                }} /> : 
                <Navigate to="/login" replace />
            } 
          />

          // In your App.jsx, make sure the Dashboard route looks like this:
           <Route 
           path="/dashboard" 
           element={
          isAuthenticated ? 
          <Dashboard onLogout={() => setIsAuthenticated(false)} /> : 
          <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/project/:projectId" 
            element={
              isAuthenticated ? 
                <ProjectEditor /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* 404 page */}
          <Route 
            path="*" 
            element={
              <div className="not-found">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <button onClick={() => window.location.href = '/'}>
                  Go Home
                </button>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;