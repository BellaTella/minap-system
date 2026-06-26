import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(4, 17, 12, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  // Feature modals + form state
  const [activeModal, setActiveModal] = useState(null) // 'checkin' | 'appointment' | 'resources'
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')
  const [checkinForm, setCheckinForm] = useState({ mood: 3, stress_level: 5, sleep_quality: 5, notes: '' })
  const [appointmentForm, setAppointmentForm] = useState({ preferred_date: '', preferred_time: '', reason: '' })

  useEffect(() => {
    const userData = localStorage.getItem('minap_user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      if (parsed.role !== 'student') {
        navigate('/')
      }
    }

    fetchDashboard()
  }, [navigate])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/student/dashboard/')
      setDashboardData(response.data)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openModal = (name) => {
    setFormError('')
    setActiveModal(name)
  }

  const closeModal = () => {
    setActiveModal(null)
    setFormError('')
  }

  const handleSubmitCheckin = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await api.post('/student/wellness/', checkinForm)
      closeModal()
      setCheckinForm({ mood: 3, stress_level: 5, sleep_quality: 5, notes: '' })
      showToast('Wellness check-in saved 💚')
      fetchDashboard()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Could not save check-in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAppointment = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await api.post('/student/appointments/', appointmentForm)
      closeModal()
      setAppointmentForm({ preferred_date: '', preferred_time: '', reason: '' })
      showToast('Appointment requested 📅')
      fetchDashboard()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Could not book appointment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment request?')) return
    try {
      await api.patch(`/student/appointments/${id}/`, { status: 'cancelled' })
      showToast('Appointment cancelled')
      fetchDashboard()
    } catch (err) {
      showToast('Could not cancel appointment')
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 64px - 80px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  // Prepare chart data
  const timelineData = dashboardData?.severity_timeline || []
  const chartData = {
    labels: timelineData.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'PCL-5 Score',
        data: timelineData.map(item => item.pcl5_score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 80
      }
    }
  }

  const severityColors = {
    minimal: '#10b981',
    mild: '#3b82f6',
    moderate: '#f59e0b',
    severe: '#ef4444',
    critical: '#991b1b'
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px - 80px)', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's your wellness overview</p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand)' }}>
              {dashboardData?.total_screenings || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Screenings</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {dashboardData?.latest_screening?.severity === 'minimal' ? '😊' :
               dashboardData?.latest_screening?.severity === 'mild' ? '🙂' :
               dashboardData?.latest_screening?.severity === 'moderate' ? '😐' :
               dashboardData?.latest_screening?.severity === 'severe' ? '😟' : '😢'}
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              color: severityColors[dashboardData?.latest_screening?.severity] || 'var(--text-muted)',
              textTransform: 'capitalize'
            }}>
              {dashboardData?.latest_screening?.severity || 'N/A'}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Latest Status</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💚</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
              {dashboardData?.wellness_checkins_count || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Wellness Check-ins</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-accent)' }}>
              {dashboardData?.upcoming_appointments?.length || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Upcoming Appointments</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Screening Timeline Chart */}
          <div className="card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Screening History
            </h2>
            {timelineData.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No screening data yet.</p>
                <Link to="/screening" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Take Your First Screening
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Recommendations */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>💡 Recommendations</h2>
            {dashboardData?.recommendations?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: `2px solid ${
                        rec.type === 'urgent' ? 'var(--danger)' :
                        rec.type === 'tip' ? 'var(--brand)' : 'var(--border)'
                      }`,
                      background: rec.type === 'urgent' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      {rec.type === 'urgent' && '⚠️ '}
                      {rec.type === 'tip' && '💡 '}
                      {rec.type === 'info' && 'ℹ️ '}
                      {rec.title}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {rec.message}
                    </p>
                    {rec.action === 'book_appointment' && (
                      <button className="btn btn-sm btn-danger" onClick={() => openModal('appointment')}>Book Appointment</button>
                    )}
                    {rec.action === 'checkin' && (
                      <button className="btn btn-sm btn-accent" onClick={() => openModal('checkin')}>Daily Check-in</button>
                    )}
                    {rec.action === 'view_resources' && (
                      <button className="btn btn-sm btn-outline" onClick={() => openModal('resources')}>View Resources</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Take a screening to get personalized recommendations.</p>
            )}
          </div>

          {/* Severity Distribution */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>📈 Severity Breakdown</h2>
            {dashboardData?.severity_distribution && Object.keys(dashboardData.severity_distribution).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(dashboardData.severity_distribution).map(([severity, count]) => (
                  <div key={severity}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{severity}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ 
                      height: '8px', 
                      background: 'var(--border)', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(count / dashboardData.total_screenings) * 100}%`,
                        background: severityColors[severity],
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>📅 Upcoming Appointments</h2>
            <button className="btn btn-sm btn-primary" onClick={() => openModal('appointment')}>+ Book Appointment</button>
          </div>
          
          {dashboardData?.upcoming_appointments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dashboardData.upcoming_appointments.map(apt => (
                <div 
                  key={apt.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {new Date(apt.preferred_date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Time: {apt.preferred_time} • Status: <span style={{ 
                        textTransform: 'capitalize',
                        color: apt.status === 'confirmed' ? 'var(--success)' : 'var(--warning)'
                      }}>{apt.status}</span>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => handleCancelAppointment(apt.id)}>Cancel</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>No upcoming appointments</p>
              <button className="btn btn-primary btn-sm" onClick={() => openModal('appointment')}>Book an Appointment</button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Link to="/screening" className="card" style={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>New Screening</div>
          </Link>

          <div className="card" style={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => openModal('checkin')}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💚</div>
            <div style={{ fontWeight: 600 }}>Wellness Check-in</div>
          </div>

          <div className="card" style={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => openModal('resources')}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <div style={{ fontWeight: 600 }}>Resources</div>
          </div>
        </div>
      </div>

      {/* ===== Wellness Check-in Modal ===== */}
      {activeModal === 'checkin' && (
        <Modal title="Daily Wellness Check-in" onClose={closeModal}>
          <form onSubmit={handleSubmitCheckin}>
            {formError && <div className="alert alert-danger">{formError}</div>}

            <div className="form-group">
              <label className="form-label">How are you feeling today?</label>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                {[
                  { v: 1, e: '😢' },
                  { v: 2, e: '😕' },
                  { v: 3, e: '😐' },
                  { v: 4, e: '🙂' },
                  { v: 5, e: '😄' }
                ].map((m) => (
                  <button
                    type="button"
                    key={m.v}
                    onClick={() => setCheckinForm({ ...checkinForm, mood: m.v })}
                    aria-label={`Mood level ${m.v}`}
                    style={{
                      flex: 1,
                      fontSize: '1.6rem',
                      padding: '0.4rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: checkinForm.mood === m.v ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                      background: checkinForm.mood === m.v ? 'var(--primary-lt)' : 'var(--white)'
                    }}
                  >
                    {m.e}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stress level: {checkinForm.stress_level}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={checkinForm.stress_level}
                onChange={(e) => setCheckinForm({ ...checkinForm, stress_level: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sleep quality: {checkinForm.sleep_quality}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={checkinForm.sleep_quality}
                onChange={(e) => setCheckinForm({ ...checkinForm, sleep_quality: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-input"
                rows="3"
                value={checkinForm.notes}
                onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                placeholder="Anything on your mind?"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Check-in'}
            </button>
          </form>
        </Modal>
      )}

      {/* ===== Book Appointment Modal ===== */}
      {activeModal === 'appointment' && (
        <Modal title="Book a Counselling Appointment" onClose={closeModal}>
          <form onSubmit={handleSubmitAppointment}>
            {formError && <div className="alert alert-danger">{formError}</div>}

            <div className="form-group">
              <label className="form-label">Preferred date</label>
              <input
                type="date"
                className="form-input"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentForm.preferred_date}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, preferred_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred time</label>
              <input
                type="time"
                className="form-input"
                required
                value={appointmentForm.preferred_time}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, preferred_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                rows="3"
                required
                value={appointmentForm.reason}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                placeholder="Briefly describe what you'd like support with"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Requesting...' : 'Request Appointment'}
            </button>
          </form>
        </Modal>
      )}

      {/* ===== Resources Modal ===== */}
      {activeModal === 'resources' && (
        <Modal title="Wellness Resources" onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '🌬️', title: 'Breathing & Grounding', desc: 'Box breathing and the 5-4-3-2-1 technique to calm your nervous system in the moment.' },
              { icon: '😴', title: 'Sleep Hygiene', desc: 'Practical steps for more restful sleep — consistent schedule, screen limits, and wind-down routines.' },
              { icon: '🧠', title: 'Managing Intrusive Thoughts', desc: 'CBT-based grounding techniques to cope with distressing memories and flashbacks.' },
              { icon: '📞', title: 'Crisis Support', desc: 'Befrienders Kenya: 0800 723 253 (free, 24/7). Emergency services: 999 / 112.' }
            ].map((r, i) => (
              <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{r.icon} {r.title}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ===== Toast ===== */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--text)',
            color: '#fff',
            padding: '0.75rem 1.25rem',
            borderRadius: '999px',
            zIndex: 200,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
