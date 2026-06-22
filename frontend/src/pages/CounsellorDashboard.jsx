import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function CounsellorDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard/summary/')
      setSummary(response.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container-wide" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '5px', margin: '0 auto 1rem' }} />
        <p className="text-muted">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container-wide">
      <div className="d-flex justify-between align-center mt-3 mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Counsellor Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>MiNaP PTSD Indicator System — Case Management</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadDashboard}>↻ Refresh</button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Screenings', value: summary?.total_screenings || 0, sub: 'All time' },
          { label: 'This Month', value: summary?.recent_screenings || 0, sub: 'Last 30 days' },
          { label: 'Pending Referrals', value: summary?.referral_status?.find(r => r.status === 'pending')?.count || 0, sub: 'Awaiting counsellor', warn: true },
          { label: 'High Priority', value: summary?.high_priority_unresolved || 0, sub: 'Severe / Critical', danger: true },
          { label: 'Crisis Alerts', value: summary?.crisis_alerts_total || 0, sub: 'NLP-detected', danger: true }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: stat.danger ? 'var(--danger)' : stat.warn ? 'var(--warn)' : 'var(--primary)',
              lineHeight: 1
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="card mb-3">
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📈 Daily Screenings — Last 7 Days
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
          {summary?.daily_trend?.map((day, i) => {
            const max = Math.max(...(summary.daily_trend.map(d => d.count) || [1]))
            const height = Math.max(Math.round((day.count / max) * 56), 4)
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: 'var(--primary-lt)',
                  borderRadius: '4px 4px 0 0',
                  height: `${height}px`,
                  minHeight: '4px',
                  position: 'relative'
                }}
                title={`${day.date}: ${day.count}`}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '0.25rem' }}>
          {summary?.daily_trend?.map((day, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {day.date.slice(8)}
            </span>
          ))}
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="card">
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          📊 Severity Distribution
        </div>
        {summary?.severity_distribution?.map((item, i) => (
          <div key={i} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              <span className={`badge badge-${item.severity}`}>{item.severity}</span>
              <span>{item.count}</span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${(item.count / (summary.total_screenings || 1)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Full case management features (cases list, referrals, alerts) coming soon.<br />
          For now, use the Django admin panel or API endpoints directly.
        </p>
      </div>
    </div>
  )
}
