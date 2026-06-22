import { useState } from 'react'
import api from '../utils/api'

// PCL-5 questions (20 items)
const PCL5_QUESTIONS = [
  "Repeated, disturbing, and unwanted memories of a stressful experience from the past?",
  "Repeated, disturbing dreams of a stressful experience from the past?",
  "Suddenly feeling or acting as if a stressful experience were actually happening again?",
  "Feeling very upset when something reminded you of a stressful experience?",
  "Having strong physical reactions when something reminded you of a stressful experience?",
  "Avoiding memories, thoughts, or feelings related to a stressful experience?",
  "Avoiding external reminders of a stressful experience?",
  "Trouble remembering important parts of a stressful experience?",
  "Having strong negative beliefs about yourself, other people, or the world?",
  "Blaming yourself or someone else for a stressful experience?",
  "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
  "Loss of interest in activities that you used to enjoy?",
  "Feeling distant or cut off from other people?",
  "Trouble experiencing positive feelings?",
  "Irritable behavior, angry outbursts, or acting aggressively?",
  "Taking too many risks or doing things that could cause you harm?",
  "Being 'superalert' or watchful or on guard?",
  "Feeling jumpy or easily startled?",
  "Having difficulty concentrating?",
  "Trouble falling or staying asleep?"
]

const LIKERT = [
  { val: 0, label: "Not at all" },
  { val: 1, label: "A little bit" },
  { val: 2, label: "Moderately" },
  { val: 3, label: "Quite a bit" },
  { val: 4, label: "Extremely" }
]

export default function Screening() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    consent: false,
    gender: 'prefer_not_to_say',
    department: '',
    programme_duration: '1_year',
    dts_score: 0,
    narrative_text: '',
    ...Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`pcl5_item_${i + 1}`, null]))
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    
    if (currentStep === 1) {
      if (!formData.consent) newErrors.consent = 'You must provide consent to continue'
      if (!formData.department.trim()) newErrors.department = 'Department is required'
    }
    
    if (currentStep === 2) {
      for (let i = 1; i <= 10; i++) {
        if (formData[`pcl5_item_${i}`] === null) {
          newErrors[`pcl5_item_${i}`] = `Please answer question ${i}`
        }
      }
    }
    
    if (currentStep === 3) {
      for (let i = 11; i <= 20; i++) {
        if (formData[`pcl5_item_${i}`] === null) {
          newErrors[`pcl5_item_${i}`] = `Please answer question ${i}`
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 4) {
        submitScreening()
      } else {
        setStep(step + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitScreening = async () => {
    setLoading(true)
    setStep(5)
    
    try {
      const response = await api.post('/screening/submit/', formData)
      setResult(response.data)
    } catch (error) {
      setErrors({ submit: error.response?.data?.detail || 'Submission failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const renderPCL5Item = (index) => {
    const fieldName = `pcl5_item_${index}`
    return (
      <div key={index} style={{
        background: 'var(--white)',
        border: '1.5px solid var(--border)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.9rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, marginRight: '0.4rem' }}>{index}.</span>
          {PCL5_QUESTIONS[index - 1]}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {LIKERT.map(opt => (
            <label key={opt.val} style={{
              flex: 1,
              minWidth: '80px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name={fieldName}
                value={opt.val}
                checked={formData[fieldName] === opt.val}
                onChange={() => handleChange(fieldName, opt.val)}
                style={{ display: 'none' }}
              />
              <div style={{
                padding: '0.5rem 0.25rem',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'all 0.15s',
                background: formData[fieldName] === opt.val ? 'var(--primary)' : 'var(--bg)',
                color: formData[fieldName] === opt.val ? '#fff' : 'var(--text-muted)',
                borderColor: formData[fieldName] === opt.val ? 'var(--primary)' : 'var(--border)',
                lineHeight: 1.3
              }}>
                {opt.val}<br /><small>{opt.label}</small>
              </div>
            </label>
          ))}
        </div>
        {errors[fieldName] && <div className="form-error">{errors[fieldName]}</div>}
      </div>
    )
  }

  const progress = ((step - 1) / 4) * 100

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      {/* Progress */}
      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <div className="progress-bar-wrap mb-2">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-muted text-center" style={{ fontSize: '0.85rem' }}>
          Step {step} of 5
        </p>
      </div>

      {/* Step 1: Consent */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2>Welcome to the MiNaP PTSD Screening</h2>
            <p>Before we begin, please read the information below and provide your consent.</p>
          </div>

          <div className="alert alert-info">
            <span>ℹ️</span>
            <div>
              <strong>About this screening:</strong> This tool uses the validated PCL-5 questionnaire
              to assess PTSD symptoms. It is <strong>not a clinical diagnosis</strong> — it is a
              screening tool to help connect you with appropriate support.
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Gender (optional)</label>
            <select
              className="form-control"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Department / Course</label>
            <input
              type="text"
              className={`form-control ${errors.department ? 'error' : ''}`}
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="e.g. Engineering, Business, ICT..."
            />
            {errors.department && <div className="form-error">{errors.department}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Programme Duration</label>
            <select
              className="form-control"
              value={formData.programme_duration}
              onChange={(e) => handleChange('programme_duration', e.target.value)}
            >
              <option value="6_months">6 Months</option>
              <option value="1_year">1 Year</option>
              <option value="2_years">2 Years</option>
              <option value="3_years">3 Years</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => handleChange('consent', e.target.checked)}
                style={{ marginTop: '0.2rem', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.9rem' }}>
                I understand this is an anonymous screening tool. I consent to my anonymised
                responses being used to generate a severity assessment.
              </span>
            </label>
            {errors.consent && <div className="form-error">{errors.consent}</div>}
          </div>

          <button className="btn btn-primary btn-lg w-100 mt-2" onClick={nextStep}>
            I Consent — Begin Screening →
          </button>
        </div>
      )}

      {/* Step 2: PCL-5 Part 1 */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h2>PCL-5 Questionnaire — Part 1</h2>
            <p>In the past month, how much were you bothered by the following problems?</p>
          </div>
          {Array.from({ length: 10 }, (_, i) => renderPCL5Item(i + 1))}
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline" onClick={prevStep}>← Back</button>
            <button className="btn btn-primary w-100" onClick={nextStep}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: PCL-5 Part 2 */}
      {step === 3 && (
        <div className="card">
          <div className="card-header">
            <h2>PCL-5 Questionnaire — Part 2</h2>
            <p>In the past month, how much were you bothered by the following problems?</p>
          </div>
          {Array.from({ length: 10 }, (_, i) => renderPCL5Item(i + 11))}
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline" onClick={prevStep}>← Back</button>
            <button className="btn btn-primary w-100" onClick={nextStep}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: DTS + Narrative */}
      {step === 4 && (
        <div className="card">
          <div className="card-header">
            <h2>Additional Information</h2>
            <p>A few more questions to help us understand your experience.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Overall Distress Level (0-136)</label>
            <input
              type="range"
              min="0"
              max="136"
              value={formData.dts_score}
              onChange={(e) => handleChange('dts_score', parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>0 — No distress</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formData.dts_score}</span>
              <span>136 — Extreme distress</span>
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Optional: Share your experience</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.narrative_text}
              onChange={(e) => handleChange('narrative_text', e.target.value)}
              placeholder="You may briefly describe what you have been experiencing..."
              style={{ resize: 'vertical' }}
            />
            <div className="form-hint">🔒 This text is analysed but never stored.</div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-outline" onClick={prevStep}>← Back</button>
            <button className="btn btn-primary w-100" onClick={nextStep}>Submit Screening →</button>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 5 && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '5px', margin: '0 auto 1rem' }} />
              <p className="text-muted">Analysing your responses…</p>
            </div>
          ) : result ? (
            <div>
              <div className="card" style={{
                background: result.severity === 'critical' ? '#c0392b' : 'var(--white)',
                color: result.severity === 'critical' ? '#fff' : 'inherit',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  border: '6px solid currentColor'
                }}>
                  {result.pcl5_score}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {result.feedback.headline}
                </h2>
                <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '500px', margin: '0 auto' }}>
                  {result.feedback.message}
                </p>
              </div>

              {result.crisis_alert && (
                <div className="alert alert-danger mt-2">
                  <span>🚨</span>
                  <div>
                    <strong>Immediate Support Available:</strong> Please contact the MiNaP Guidance & Counselling office
                    or call <strong>Befrienders Kenya: 0800 723 253</strong> (free, 24/7).
                  </div>
                </div>
              )}

              {result.referral_triggered && (
                <div className="alert alert-warning mt-2">
                  <span>📋</span>
                  <div>A referral has been sent to the MiNaP Guidance & Counselling office.</div>
                </div>
              )}

              <div className="card mt-3">
                <div className="card-header">
                  <h2>Recommended Resources</h2>
                  <p>{result.feedback.action}</p>
                </div>
                <ul style={{ listStyle: 'none' }}>
                  {result.feedback.resources.map((resource, i) => (
                    <li key={i} style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      marginBottom: '0.4rem',
                      background: 'rgba(0,0,0,0.02)',
                      fontSize: '0.9rem'
                    }}>
                      → {resource}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mt-4">
                <a href="/" className="btn btn-outline">← Back to Home</a>
              </div>
            </div>
          ) : errors.submit ? (
            <div className="alert alert-danger">
              <span>⚠️</span>
              <div>{errors.submit}</div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
