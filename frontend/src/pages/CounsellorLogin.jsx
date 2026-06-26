import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function CounsellorLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect already-authenticated users to their own dashboard
    if (localStorage.getItem('minap_token')) {
      let role = null
      try { role = JSON.parse(localStorage.getItem('minap_user'))?.role } catch { role = null }
      navigate(role === 'student' ? '/trainee/dashboard' : '/counsellor/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please enter your username and password.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/login/', { username, password })

      // Verify user is a counsellor (or admin/staff)
      const { role, is_staff } = response.data.user
      if (role !== 'counsellor' && role !== 'admin' && !is_staff) {
        setError('This portal is for counselling staff only. Please use the student login.')
        setLoading(false)
        return
      }

      localStorage.setItem('minap_token', response.data.token)
      localStorage.setItem('minap_user', JSON.stringify(response.data.user))
      navigate('/counsellor/dashboard')
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '4rem' }}>
      <div className="text-center mb-2">
        <div style={{
          width: '64px',
          height: '64px',
          background: 'var(--brand)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.8rem'
        }}>🏥</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Counsellor Portal</h1>
        <p className="text-muted mt-1">Sign in to access the Imara dashboard</p>
      </div>

      <div className="card mt-3">
        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mt-2"
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In →'}
          </button>
        </form>
      </div>

      <p className="text-center text-muted mt-3" style={{ fontSize: '0.85rem' }}>
        This portal is for authorised counselling staff only.<br />
        Contact your administrator if you need access.
      </p>
    </div>
  )
}
