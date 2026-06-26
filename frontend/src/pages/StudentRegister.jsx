import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function StudentRegister() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    student_id: '',
    department: '',
    programme: '',
    year_of_study: 1,
    gender: '',
    phone_number: '',
    emergency_contact: '',
    date_of_birth: '',
    allow_longitudinal_tracking: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/register/student/', formData)
      
      // Store token and user data
      localStorage.setItem('minap_token', response.data.token)
      localStorage.setItem('minap_user', JSON.stringify(response.data.user))
      
      // Redirect to student dashboard
      navigate('/student/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
      if (err.response?.data) {
        const errors = err.response.data
        const errorMessages = Object.entries(errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n')
        setError(errorMessages || 'Registration failed. Please check your information.')
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
      padding: '3rem 1rem'
    }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Registration</h1>
            <p style={{ color: 'var(--text-muted)' }}>Create your Imara account to track your wellness journey</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ whiteSpace: 'pre-line' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account Information */}
            <fieldset style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <legend style={{ fontSize: '1.1rem', fontWeight: 600, padding: '0 0.5rem' }}>Account Information</legend>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Username <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Choose a username"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Email <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="your.email@jkuat.ac.ke"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="form-input"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </fieldset>

            {/* Personal Information */}
            <fieldset style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <legend style={{ fontSize: '1.1rem', fontWeight: 600, padding: '0 0.5rem' }}>Personal Information</legend>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    First Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Last Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Student ID <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="e.g., SCT211-0001/2024"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+254712345678"
                  />
                </div>
              </div>
            </fieldset>

            {/* Academic Information */}
            <fieldset style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <legend style={{ fontSize: '1.1rem', fontWeight: 600, padding: '0 0.5rem' }}>Academic Information</legend>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Department <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Programme <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="programme"
                  value={formData.programme}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="e.g., BSc Computer Science"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Year of Study <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5+</option>
                </select>
              </div>
            </fieldset>

            {/* Emergency Contact */}
            <fieldset style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <legend style={{ fontSize: '1.1rem', fontWeight: 600, padding: '0 0.5rem' }}>Emergency Contact</legend>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Emergency Contact Number
                </label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+254700000000"
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  This will only be used in case of emergency
                </small>
              </div>
            </fieldset>

            {/* Privacy Settings */}
            <div style={{ 
              background: 'var(--primary-lt)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="allow_longitudinal_tracking"
                  checked={formData.allow_longitudinal_tracking}
                  onChange={handleChange}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    📊 Allow Progress Tracking
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Link your screening results to your account for personalized insights and progress tracking over time. 
                    You can disable this at any time from your dashboard.
                  </div>
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem' }}
            >
              {loading ? 'Creating Account...' : '✨ Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/student/login" style={{ color: 'var(--brand)', fontWeight: 500 }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
