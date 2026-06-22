import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a6b4a 0%, #134d36 100%)',
        color: '#fff',
        padding: '5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,.15)',
            borderRadius: '50px',
            padding: '0.4rem 1.2rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            letterSpacing: '0.05em'
          }}>
            🏫 The Michuki National Polytechnic
          </div>
          <h1 style={{
            fontSize: '2.6rem',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '1rem'
          }}>
            Your Mental Wellbeing<br />Matters Here
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            maxWidth: '560px',
            margin: '0 auto 2rem'
          }}>
            A confidential, anonymous screening tool to help identify and support
            trainees experiencing PTSD symptoms. Takes less than 10 minutes.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link to="/screening" className="btn btn-accent btn-lg">
              ✦ Start Screening
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg" style={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,.5)'
            }}>
              How it works
            </a>
          </div>
          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.82rem',
            opacity: 0.7
          }}>
            🔒 Completely anonymous · No login required · Results are confidential
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          textAlign: 'center'
        }}>
          {[
            { value: '~10 min', label: 'To complete' },
            { value: '100%', label: 'Anonymous' },
            { value: '5', label: 'Severity levels assessed' },
            { value: 'AI', label: 'Powered analysis' }
          ].map((stat, i) => (
            <div key={i}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#1a6b4a'
              }}>{stat.value}</div>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>How It Works</h2>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '3rem'
          }}>Three simple steps to get personalised support</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                icon: '📋',
                title: '1. Answer Questions',
                desc: 'Complete the validated PCL-5 questionnaire — 20 questions about how you\'ve been feeling over the past month.'
              },
              {
                icon: '🤖',
                title: '2. AI Analysis',
                desc: 'Our AI model analyses your responses and classifies your symptom severity level instantly.'
              },
              {
                icon: '💚',
                title: '3. Get Support',
                desc: 'Receive personalised feedback, coping resources, and — if needed — a referral to MiNaP counselling services.'
              }
            ].map((step, i) => (
              <div key={i} className="card" style={{
                textAlign: 'center',
                padding: '2rem 1.5rem'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#e8f5ee',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>{step.icon}</div>
                <h3 style={{
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>{step.title}</h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.9rem'
                }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section style={{ padding: '0 1.5rem 4rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg,#e8f5ee,#f0faf4)',
            borderColor: '#b7dfc8'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: '2rem' }}>🔐</div>
              <div>
                <h3 style={{
                  fontWeight: 600,
                  color: '#1a6b4a',
                  marginBottom: '0.5rem'
                }}>Your Privacy is Protected</h3>
                <p style={{
                  color: '#2d6a4f',
                  fontSize: '0.9rem',
                  lineHeight: 1.7
                }}>
                  This screening is completely <strong>anonymous</strong>. No names, student IDs, or personal identifiers are collected.
                  Your responses are encrypted and stored securely in compliance with Kenya's Data Protection Act (2019).
                  Only aggregated, anonymised data is visible to counsellors — your individual responses are never linked to your identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: '#1a6b4a',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: '0.75rem'
        }}>Ready to check in with yourself?</h2>
        <p style={{
          opacity: 0.85,
          marginBottom: '1.5rem'
        }}>It's free, anonymous, and takes less than 10 minutes.</p>
        <Link to="/screening" className="btn btn-accent btn-lg">
          Start the Screening →
        </Link>
      </section>
    </>
  )
}
