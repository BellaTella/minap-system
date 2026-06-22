import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('minap_user')
    if (userData) setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('minap_token')
    localStorage.removeItem('minap_user')
    setUser(null)
    navigate('/counsellor/login')
  }

  return (
    <nav style={{
      background: 'var(--primary)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 2px 8px rgba(0,0,0,.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textDecoration: 'none',
        color: 'var(--white)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'var(--accent)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--primary-dk)'
        }}>M</div>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>MiNaP</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>PTSD Indicator System</div>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span className="hide-mobile" style={{ color: 'rgba(255,255,255,.8)', fontSize: '0.9rem' }}>
              👤 {user.first_name} {user.last_name}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)', background: 'transparent', border: '2px solid' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/screening" className="btn btn-accent btn-sm">
              ✦ Take Screening
            </Link>
            <Link
              to="/counsellor/login"
              className="hide-mobile"
              style={{ color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Counsellor Login
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
