import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>My Blog</h1>
          </Link>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <a href="/admin" className="nav-link">Admin</a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

