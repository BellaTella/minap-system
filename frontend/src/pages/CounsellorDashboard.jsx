import { useState, useEffect, useCallback } from 'react'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const SEVERITIES = ['minimal', 'mild', 'moderate', 'severe', 'critical']
const REF_STATUSES = ['pending', 'in_progress', 'resolved', 'escalated']
const APPT_STATUSES = ['requested', 'confirmed', 'completed', 'cancelled']

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('minap_user'))
  } catch {
    return null
  }
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(4, 17, 12, 0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ maxWidth: '560px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function CounsellorDashboard() {
  const me = getUser()

  const [tab, setTab] = useState('overview')
  const [toast, setToast] = useState('')
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  // Overview
  const [summary, setSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  // Cases
  const [cases, setCases] = useState([])
  const [casesMeta, setCasesMeta] = useState({ count: 0, next: null, previous: null })
  const [casesPage, setCasesPage] = useState(1)
  const [filters, setFilters] = useState({ severity: '', referral_status: '' })
  const [loadingCases, setLoadingCases] = useState(false)

  // Alerts
  const [alerts, setAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(false)

  // Appointments
  const [appointments, setAppointments] = useState([])
  const [apptStatusFilter, setApptStatusFilter] = useState('')
  const [loadingAppts, setLoadingAppts] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [apptForm, setApptForm] = useState({ status: 'requested', counsellor_notes: '' })
  const [savingAppt, setSavingAppt] = useState(false)
  const [apptError, setApptError] = useState('')

  // Case / referral modal
  const [selected, setSelected] = useState(null) // { screening, referralId, manageable }
  const [refForm, setRefForm] = useState({ status: 'pending', follow_up_date: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true)
    try {
      const { data } = await api.get('/dashboard/summary/')
      setSummary(data)
    } catch (e) {
      console.error('summary error', e)
    } finally {
      setLoadingSummary(false)
    }
  }, [])

  const loadCases = useCallback(async (page, f) => {
    setLoadingCases(true)
    try {
      const params = { page }
      if (f.severity) params.severity = f.severity
      if (f.referral_status) params.referral_status = f.referral_status
      const { data } = await api.get('/dashboard/cases/', { params })
      setCases(data.results || [])
      setCasesMeta({ count: data.count, next: data.next, previous: data.previous })
    } catch (e) {
      console.error('cases error', e)
      setCases([])
    } finally {
      setLoadingCases(false)
    }
  }, [])

  const loadAlerts = useCallback(async () => {
    setLoadingAlerts(true)
    try {
      const { data } = await api.get('/dashboard/alerts/')
      setAlerts(data.alerts || [])
    } catch (e) {
      console.error('alerts error', e)
      setAlerts([])
    } finally {
      setLoadingAlerts(false)
    }
  }, [])

  const loadAppointments = useCallback(async (statusFilter) => {
    setLoadingAppts(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/counsellor/appointments/', { params })
      setAppointments(data.results || [])
    } catch (e) {
      console.error('appointments error', e)
      setAppointments([])
    } finally {
      setLoadingAppts(false)
    }
  }, [])

  useEffect(() => { loadSummary() }, [loadSummary])
  useEffect(() => { if (tab === 'cases') loadCases(casesPage, filters) }, [tab, casesPage, filters, loadCases])
  useEffect(() => { if (tab === 'alerts') loadAlerts() }, [tab, loadAlerts])
  useEffect(() => { if (tab === 'appointments') loadAppointments(apptStatusFilter) }, [tab, apptStatusFilter, loadAppointments])

  const refreshAll = () => {
    loadSummary()
    if (tab === 'cases') loadCases(casesPage, filters)
    if (tab === 'alerts') loadAlerts()
    if (tab === 'appointments') loadAppointments(apptStatusFilter)
  }

  const setFilter = (key, value) => {
    setCasesPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const openCase = async (c) => {
    setModalError('')
    if (c.referral?.id) {
      try {
        const { data } = await api.get(`/referrals/${c.referral.id}/`)
        setSelected({
          referralId: c.referral.id,
          manageable: true,
          screening: { ...data.screening_detail, department: c.department, gender: c.gender, crisis_flag: c.crisis_flag }
        })
        setRefForm({
          status: data.status || 'pending',
          follow_up_date: data.follow_up_date || '',
          notes: data.notes || ''
        })
      } catch {
        showToast('Could not load case')
      }
    } else {
      setSelected({ referralId: null, manageable: false, screening: c })
    }
  }

  const openAlert = async (a) => {
    setModalError('')
    try {
      const { data } = await api.get(`/referrals/${a.referral_id}/`)
      setSelected({
        referralId: a.referral_id,
        manageable: true,
        screening: { ...data.screening_detail, department: a.department, gender: a.gender }
      })
      setRefForm({
        status: data.status || 'pending',
        follow_up_date: data.follow_up_date || '',
        notes: data.notes || ''
      })
    } catch {
      showToast('Could not load case')
    }
  }

  const saveReferral = async (assignMe = false) => {
    if (!selected?.referralId) return
    setSaving(true)
    setModalError('')
    try {
      const payload = { status: refForm.status, notes: refForm.notes }
      payload.follow_up_date = refForm.follow_up_date || null
      if (assignMe && me?.id) payload.counsellor = me.id
      await api.post(`/referrals/${selected.referralId}/update/`, payload)
      showToast(assignMe ? 'Case assigned to you' : 'Case updated')
      setSelected(null)
      refreshAll()
    } catch (e) {
      setModalError(e.response?.data?.detail || 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const openAppt = (a) => {
    setApptError('')
    setSelectedAppt(a)
    setApptForm({ status: a.status, counsellor_notes: a.counsellor_notes || '' })
  }

  const saveAppt = async (assignMe = false) => {
    if (!selectedAppt) return
    setSavingAppt(true)
    setApptError('')
    try {
      const payload = { status: apptForm.status, counsellor_notes: apptForm.counsellor_notes }
      if (assignMe && me?.id) payload.counsellor = me.id
      await api.patch(`/counsellor/appointments/${selectedAppt.id}/`, payload)
      showToast(assignMe ? 'Appointment assigned to you' : 'Appointment updated')
      setSelectedAppt(null)
      loadAppointments(apptStatusFilter)
    } catch (e) {
      setApptError(e.response?.data?.detail || 'Could not save changes. Please try again.')
    } finally {
      setSavingAppt(false)
    }
  }

  // ── Chart data for daily trend ────────────────────────────────────────────
  const trend = summary?.daily_trend || []
  const chartData = {
    labels: trend.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: 'Screenings',
        data: trend.map((d) => d.count),
        borderColor: 'rgb(26, 107, 74)',
        backgroundColor: 'rgba(26, 107, 74, 0.12)',
        fill: true,
        tension: 0.4
      }
    ]
  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  }

  const pendingCount = summary?.referral_status?.find((r) => r.status === 'pending')?.count || 0

  const statCards = [
    { label: 'Total Screenings', value: summary?.total_screenings || 0, sub: 'All time' },
    { label: 'This Month', value: summary?.recent_screenings || 0, sub: 'Last 30 days' },
    { label: 'Pending Referrals', value: pendingCount, sub: 'Awaiting counsellor', warn: true },
    { label: 'High Priority', value: summary?.high_priority_unresolved || 0, sub: 'Severe / Critical', danger: true },
    { label: 'Crisis Alerts', value: summary?.crisis_alerts_total || 0, sub: 'NLP-detected', danger: true }
  ]

  if (loadingSummary && !summary) {
    return (
      <div className="container-wide" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '5px', margin: '0 auto 1rem' }} />
        <p className="text-muted">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container-wide" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="d-flex justify-between align-center mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Counsellor Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Welcome{me?.first_name ? `, ${me.first_name}` : ''} — Case Management
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={refreshAll}>↻ Refresh</button>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          📊 Overview
        </button>
        <button className={`dash-tab ${tab === 'cases' ? 'active' : ''}`} onClick={() => setTab('cases')}>
          🗂️ Cases
        </button>
        <button className={`dash-tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
          🚨 Alerts
          {summary?.high_priority_unresolved > 0 && (
            <span className="tab-count">{summary.high_priority_unresolved}</span>
          )}
        </button>
        <button className={`dash-tab ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>
          📅 Appointments
        </button>
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {statCards.map((stat, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, color: stat.danger ? 'var(--danger)' : stat.warn ? 'var(--warning)' : 'var(--brand)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📈 Daily Screenings — Last 7 Days</h2>
            <div style={{ height: '260px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Severity Distribution</h2>
              {summary?.severity_distribution?.length > 0 ? summary.severity_distribution.map((item, i) => (
                <div key={i} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span className={`badge badge-${item.severity}`}>{item.severity}</span>
                    <span style={{ fontWeight: 600 }}>{item.count}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${(item.count / (summary.total_screenings || 1)) * 100}%` }} />
                  </div>
                </div>
              )) : <p className="text-muted" style={{ fontSize: '0.9rem' }}>No data available</p>}
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Referral Status</h2>
              {summary?.referral_status?.length > 0 ? summary.referral_status.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className={`badge badge-${item.status}`}>{item.status.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 600 }}>{item.count}</span>
                </div>
              )) : <p className="text-muted" style={{ fontSize: '0.9rem' }}>No referrals yet</p>}
            </div>
          </div>
        </>
      )}

      {/* ===== CASES ===== */}
      {tab === 'cases' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="d-flex justify-between align-center mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>All Cases <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 400 }}>({casesMeta.count})</span></h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select className="form-input" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} value={filters.severity} onChange={(e) => setFilter('severity', e.target.value)}>
                <option value="">All severities</option>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="form-input" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} value={filters.referral_status} onChange={(e) => setFilter('referral_status', e.target.value)}>
                <option value="">All referral statuses</option>
                {REF_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {loadingCases ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : cases.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No cases match these filters.</p>
          ) : (
            <>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Severity</th>
                      <th>PCL-5</th>
                      <th>Department</th>
                      <th>Referral</th>
                      <th>Flags</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c.id}>
                        <td>{fmtDate(c.created_at)}</td>
                        <td><span className={`badge badge-${c.severity}`}>{c.severity}</span></td>
                        <td style={{ fontWeight: 600 }}>{c.pcl5_score}</td>
                        <td>{c.department || '—'}</td>
                        <td>{c.referral ? <span className={`badge badge-${c.referral.status}`}>{c.referral.status.replace('_', ' ')}</span> : <span className="text-muted">—</span>}</td>
                        <td>{c.crisis_flag ? <span title="Crisis flag" style={{ color: 'var(--danger)' }}>🚨</span> : ''}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => openCase(c)}>
                            {c.referral ? 'Manage' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-between align-center mt-3" style={{ fontSize: '0.85rem' }}>
                <button className="btn btn-sm btn-outline" disabled={!casesMeta.previous} onClick={() => setCasesPage((p) => Math.max(1, p - 1))}>← Prev</button>
                <span className="text-muted">Page {casesPage}</span>
                <button className="btn btn-sm btn-outline" disabled={!casesMeta.next} onClick={() => setCasesPage((p) => p + 1)}>Next →</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== ALERTS ===== */}
      {tab === 'alerts' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🚨 High-Priority Alerts</h2>
          {loadingAlerts ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : alerts.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No unresolved high-priority cases. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {alerts.map((a) => (
                <div key={a.referral_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderLeft: `4px solid var(--danger)`, borderRadius: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                      <span style={{ fontWeight: 600 }}>PCL-5: {a.pcl5_score}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {a.department || 'Unknown dept'} • {fmtDate(a.created_at)} • {a.counsellor || 'Unassigned'}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => openAlert(a)}>Manage Case</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== APPOINTMENTS ===== */}
      {tab === 'appointments' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="d-flex justify-between align-center mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Appointment Requests</h2>
            <select className="form-input" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} value={apptStatusFilter} onChange={(e) => setApptStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {APPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loadingAppts ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : appointments.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No appointments found.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Counsellor</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.student_name || `#${a.student}`}</td>
                      <td>{fmtDate(a.preferred_date)}</td>
                      <td>{a.preferred_time?.slice(0, 5)}</td>
                      <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.reason}>{a.reason}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                      <td>{a.counsellor_name || <span className="text-muted">Unassigned</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openAppt(a)}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== Appointment Modal ===== */}
      {selectedAppt && (
        <Modal title="Manage Appointment" onClose={() => setSelectedAppt(null)}>
          {apptError && <div className="alert alert-danger">{apptError}</div>}

          <div style={{ background: '#f8fafb', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600 }}>{selectedAppt.student_name || `Student #${selectedAppt.student}`}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {fmtDate(selectedAppt.preferred_date)} at {selectedAppt.preferred_time?.slice(0, 5)}
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{selectedAppt.reason}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={apptForm.status} onChange={(e) => setApptForm({ ...apptForm, status: e.target.value })}>
              {APPT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes for student</label>
            <textarea className="form-input" rows="3" value={apptForm.counsellor_notes} onChange={(e) => setApptForm({ ...apptForm, counsellor_notes: e.target.value })} placeholder="e.g. confirmed location, what to bring..." />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={savingAppt} onClick={() => saveAppt(false)}>
              {savingAppt ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-outline" disabled={savingAppt} onClick={() => saveAppt(true)}>
              Assign to me
            </button>
          </div>
        </Modal>
      )}

      {/* ===== Case / Referral Modal ===== */}      {selected && (
        <Modal title="Case Details" onClose={() => setSelected(null)}>
          {modalError && <div className="alert alert-danger">{modalError}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className={`badge badge-${selected.screening.severity}`}>{selected.screening.severity}</span>
            {selected.screening.crisis_flag && <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem' }}>🚨 Crisis flag</span>}
            <span className="text-muted" style={{ fontSize: '0.85rem', marginLeft: 'auto' }}>{fmtDate(selected.screening.created_at)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'PCL-5 Score', value: selected.screening.pcl5_score },
              { label: 'DTS Score', value: selected.screening.dts_score },
              { label: 'Confidence', value: `${Math.round((selected.screening.prediction_confidence || 0) * 100)}%` },
              { label: 'Department', value: selected.screening.department || '—' },
              { label: 'Intrusion', value: selected.screening.cluster_intrusion },
              { label: 'Avoidance', value: selected.screening.cluster_avoidance },
              { label: 'Cognition / Mood', value: selected.screening.cluster_cognition_mood },
              { label: 'Arousal / Reactivity', value: selected.screening.cluster_arousal_reactivity }
            ].map((f, i) => (
              <div key={i} style={{ background: '#f8fafb', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{f.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{f.value}</div>
              </div>
            ))}
          </div>

          {selected.manageable ? (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Manage Referral</h3>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={refForm.status} onChange={(e) => setRefForm({ ...refForm, status: e.target.value })}>
                  {REF_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up date</label>
                <input type="date" className="form-input" value={refForm.follow_up_date || ''} onChange={(e) => setRefForm({ ...refForm, follow_up_date: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Case notes</label>
                <textarea className="form-input" rows="3" value={refForm.notes} onChange={(e) => setRefForm({ ...refForm, notes: e.target.value })} placeholder="Add private case notes..." />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" disabled={saving} onClick={() => saveReferral(false)}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn btn-outline" disabled={saving} onClick={() => saveReferral(true)}>
                  Assign to me
                </button>
              </div>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              This screening did not trigger a referral (low severity), so there is no case to manage.
            </p>
          )}
        </Modal>
      )}

      {/* ===== Toast ===== */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--text)', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '999px', zIndex: 200, fontSize: '0.9rem', boxShadow: 'var(--shadow-lg)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
