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

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

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
      const response = await api.get('/api/student/dashboard/')
      setDashboardData(response.data)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
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
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 64px - 80px)', padding: '2rem 1rem' }}>
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
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
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
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
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
                        rec.type === 'tip' ? 'var(--primary)' : 'var(--border)'
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
                      <button className="btn btn-sm btn-danger">Book Appointment</button>
                    )}
                    {rec.action === 'checkin' && (
                      <button className="btn btn-sm btn-accent">Daily Check-in</button>
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
            <button className="btn btn-sm btn-primary">+ Book Appointment</button>
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
                  <button className="btn btn-sm btn-outline">View Details</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No upcoming appointments</p>
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
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💚</div>
            <div style={{ fontWeight: 600 }}>Wellness Check-in</div>
          </div>

          <div className="card" style={{ 
            padding: '1.5rem', 
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <div style={{ fontWeight: 600 }}>Resources</div>
          </div>
        </div>
      </div>
    </div>
  )
}
