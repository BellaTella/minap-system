import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/login/', formData)
      
      // Verify user is an admin or superuser
      if (response.data.user.role !== 'admin' && !response.data.user.is_superuser) {
        setError('Access denied. Administrators only.')
        setLoading(false)
        return
      }
      
      // Store token and user data
      localStorage.setItem('minap_token', response.data.token)
      localStorage.setItem('minap_user', JSON.stringify(response.data.user))
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      if (err.response?.status === 400) {
        setError('Invalid username or password. Please try again.')
      } else {
        setError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 64px - 80px)', 
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>System Administration Access</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Admin Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter admin username"
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter admin password"
            />
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#78350f'
          }}>
            ⚠️ This area is restricted to authorized administrators only.
          </div>

          <button 
            type="submit" 
            className="btn btn-danger" 
            disabled={loading}
            style={{ width: '100%', padding: '0.875rem' }}
          >
            {loading ? 'Authenticating...' : '🔒 Admin Login'}
          </button>
        </form>

        <div style={{ 
          borderTop: '1px solid var(--border)', 
          marginTop: '2rem', 
          paddingTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <Link to="/" style={{ color: 'var(--primary)' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
