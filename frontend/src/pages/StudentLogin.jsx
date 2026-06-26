import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function StudentLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  useEffect(() => {
    // Redirect already-authenticated users to their own dashboard
    if (localStorage.getItem('minap_token')) {
      let role = null
      try { role = JSON.parse(localStorage.getItem('minap_user'))?.role } catch { role = null }
      navigate(role === 'counsellor' ? '/counsellor/dashboard' : '/trainee/dashboard', { replace: true })
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login/', formData)
      
      // Verify user is a student
      if (response.data.user.role !== 'student') {
        setError('This login is for students only. Please use the appropriate login page.')
        setLoading(false)
        return
      }
      
      // Store token and user data
      localStorage.setItem('minap_token', response.data.token)
      localStorage.setItem('minap_user', JSON.stringify(response.data.user))
      
      // Redirect to student dashboard
      navigate('/trainee/dashboard')
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
      background: 'linear-gradient(135deg, var(--primary-lt) 0%, var(--accent-lt) 100%)',
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
            background: 'var(--brand)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            color: 'white'
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Login</h1>
          <p style={{ color: 'var(--text-muted)' }}>Access your wellness dashboard</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.875rem' }}
          >
            {loading ? 'Signing in...' : '🔓 Sign In'}
          </button>
        </form>

        <div style={{ 
          borderTop: '1px solid var(--border)', 
          marginTop: '2rem', 
          paddingTop: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Don't have an account?
          </p>
          <Link to="/trainee/register" className="btn btn-accent" style={{ marginBottom: '0.75rem' }}>
            ✨ Create Student Account
          </Link>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            <Link to="/counsellor/login" style={{ color: 'var(--brand)' }}>
              Counsellor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
