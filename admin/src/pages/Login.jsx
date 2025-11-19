import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { setToken, setUser } from '../utils/auth'
import './Login.css'

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let data
      if (isSignUp) {
        data = await api.register(formData.email, formData.password, formData.username)
      } else {
        data = await api.login(formData.email, formData.password)
      }
      setToken(data.token)
      setUser(data.user)
      onLogin()
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({ email: '', password: '', username: '' })
    setError(null)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Blog Admin</h1>
          <p className="subtitle">
            {isSignUp ? 'Create an account to get started' : 'Sign in to manage your blog'}
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="username">Username (optional)</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
                minLength={isSignUp ? 6 : undefined}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Sign Up' : 'Sign In')
              }
            </button>

            <div className="auth-toggle">
              <button
                type="button"
                onClick={toggleMode}
                className="toggle-link"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

