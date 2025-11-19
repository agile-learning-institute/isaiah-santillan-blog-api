import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PostEdit from './pages/PostEdit'
import PostNew from './pages/PostNew'
import Comments from './pages/Comments'
import { getToken } from './utils/auth'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Header onLogout={handleLogout} />}
        <main>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/posts/new" 
              element={
                isAuthenticated ? <PostNew /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/posts/:id/edit" 
              element={
                isAuthenticated ? <PostEdit /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/comments" 
              element={
                isAuthenticated ? <Comments /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

