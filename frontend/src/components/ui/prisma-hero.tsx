import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

// Calm, dark-enough landscape — reads cleanly with white text (no busy faces/sofa)
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=85&crop=entropy'

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string
  className?: string
  showAsterisk?: boolean
  style?: React.CSSProperties
}

export const WordsPullUp = ({
  text,
  className = '',
  showAsterisk = false,
  style,
}: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const words = text.split(' ')

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : '0.25em' }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        )
      })}
    </div>
  )
}

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string
  className?: string
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[]
  className?: string
  style?: React.CSSProperties
}

export const WordsPullUpMultiStyle = ({
  segments,
  className = '',
  style,
}: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const words: { word: string; className?: string }[] = []
  segments.forEach((seg) => {
    seg.text.split(' ').forEach((w) => {
      if (w) words.push({ word: w, className: seg.className })
    })
  })

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ''}`}
          style={{ marginRight: '0.25em' }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  )
}

/* ---------------- Hero ---------------- */
const PrismaHero = () => {
  return (
    <section className="relative min-h-[calc(100vh-0px)] w-full overflow-hidden bg-[#061510]">
      <img
        src={HERO_IMAGE}
        alt="Calm misty landscape at dawn"
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
      />

      {/* Brand tint + legibility scrims — no grain/noise */}
      <div className="absolute inset-0 bg-[#0f2e22]/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#04110c]/85 via-[#04110c]/25 to-[#04110c]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#04110c]/80 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-0px)] max-w-7xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-16 md:pb-20 lg:px-10">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Imara
            <span className="text-[#f0a500]">*</span>
            <span className="mt-2 block text-3xl font-medium text-white/95 sm:text-4xl md:text-5xl">
              Your mental wellbeing matters
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg"
          >
            A confidential screening platform for trainees — PCL-5 assessment, AI-assisted
            severity insights, and direct referral to counselling when you need support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/screening"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#f0a500] px-6 py-3 text-sm font-semibold text-[#134d36] transition-all hover:bg-[#ffb820] sm:text-base"
            >
              Start screening
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/trainee/login"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15 sm:text-base"
            >
              Trainee login
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 text-xs text-white/50 sm:text-sm"
          >
            Confidential · Login required · Less than 10 minutes
          </motion.p>
        </div>
      </div>
    </section>
  )
}

export { PrismaHero }
