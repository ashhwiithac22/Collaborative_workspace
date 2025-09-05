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
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
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
          
          {/* Protected routes */}
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
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;