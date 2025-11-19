import { Link, useLocation } from 'react-router-dom'
import { getUser } from '../utils/auth'
import './Header.css'

function Header({ onLogout }) {
  const location = useLocation()
  const user = getUser()

  const isActive = (path) => location.pathname === path

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Blog Admin</h1>
          </Link>
          <nav>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Posts
            </Link>
            <Link 
              to="/comments" 
              className={`nav-link ${isActive('/comments') ? 'active' : ''}`}
            >
              Comments
            </Link>
            {user && (
              <span className="user-info">
                {user.username || user.email}
              </span>
            )}
            <button onClick={onLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

