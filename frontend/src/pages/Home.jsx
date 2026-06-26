import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PrismaHero } from '@/components/ui/prisma-hero'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' }
  })
}

export default function Home() {
  return (
    <>
      <PrismaHero />

      {/* ===== Stats ===== */}
      <section className="stats-band -mt-1">
        <div className="stats-inner">
          {[
            { value: '~10', unit: 'min', label: 'To complete' },
            { value: '100', unit: '%', label: 'Confidential' },
            { value: '5', unit: '', label: 'Severity levels' },
            { value: 'AI', unit: '', label: 'Powered analysis' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="stat"
            >
              <div className="stat-value">
                {stat.value}<span className="stat-unit">{stat.unit}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how-it-works" className="section">
        <div className="section-inner">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="section-head"
          >
            <span className="eyebrow">Simple & supportive</span>
            <h2>How It Works</h2>
            <p>Three steps to understand how you're doing and get personalised support.</p>
          </motion.div>

          <div className="steps-grid">
            {[
              {
                icon: '📋',
                title: 'Answer Questions',
                desc: 'Complete the validated PCL-5 questionnaire — 20 questions about how you have been feeling over the past month.'
              },
              {
                icon: '🤖',
                title: 'AI Analysis',
                desc: 'Our model analyses your responses and classifies your symptom severity instantly across five levels.'
              },
              {
                icon: '💚',
                title: 'Get Support',
                desc: 'Receive personalised feedback, coping resources, and — when needed — a referral to the Guidance & Counselling office.'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="step-card"
              >
                <div className="step-num">{i + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Who it's for ===== */}
      <section className="section section-alt">
        <div className="section-inner">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="section-head"
          >
            <span className="eyebrow">Built for everyone</span>
            <h2>Who It's For</h2>
            <p>One platform connecting trainees who need support with the counsellors who provide it.</p>
          </motion.div>

          <div className="audience-grid">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="audience-card"
            >
              <div className="audience-icon">🎓</div>
              <h3>For Trainees</h3>
              <ul>
                <li>Confidential PTSD self-screening</li>
                <li>Track your wellbeing over time</li>
                <li>Personalised coping resources</li>
                <li>Direct line to counselling support</li>
              </ul>
              <Link to="/trainee/login" className="btn btn-primary">Trainee Login →</Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="audience-card"
            >
              <div className="audience-icon">🩺</div>
              <h3>For Counsellors</h3>
              <ul>
                <li>Receive automatic referrals</li>
                <li>Prioritise high-severity cases</li>
                <li>View anonymised trends & analytics</li>
                <li>Reach out and follow up faster</li>
              </ul>
              <Link to="/counsellor/login" className="btn btn-outline">Counsellor Portal →</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Privacy ===== */}
      <section className="section">
        <div className="section-inner">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="privacy-card"
          >
            <div className="privacy-icon">🔐</div>
            <div>
              <h3>Your Privacy is Protected</h3>
              <p>
                Your responses are encrypted and stored securely in compliance with Kenya's
                Data Protection Act (2019). Screening results are linked to your account so
                counsellors can reach out with support — but only authorised counselling staff
                can access them, and aggregate reporting is always anonymised.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta">
        <div className="cta-glow" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="cta-inner"
        >
          <h2>Ready to check in with yourself?</h2>
          <p>It's confidential, supportive, and takes less than 10 minutes.</p>
          <Link to="/screening" className="btn btn-accent btn-lg">
            Start the Screening →
          </Link>
        </motion.div>
      </section>
    </>
  )
}
