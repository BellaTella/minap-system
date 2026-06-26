import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem =
  | { label: string; to: string }
  | { label: string; href: string }

interface User {
  first_name: string
  last_name: string
  role: 'student' | 'counsellor' | 'admin'
}

function getNavItems(user: User | null): NavItem[] {
  const items: NavItem[] = [{ label: 'How it works', href: '/#how-it-works' }]
  if (!user) {
    // Logged out — show entry points to screening and both portals
    items.push({ label: 'Screening', to: '/screening' })
    items.push({ label: 'Trainee', to: '/trainee/login' })
    items.push({ label: 'Counsellor', to: '/counsellor/login' })
  } else if (user.role === 'student') {
    items.push({ label: 'Screening', to: '/screening' })
  }
  return items
}

interface SiteHeaderProps {
  variant?: 'default' | 'overlay'
}

function NavLink({
  item,
  variant,
  onClick,
}: {
  item: NavItem
  variant: 'default' | 'overlay'
  onClick?: () => void
}) {
  const location = useLocation()
  const isActive =
    'to' in item && item.to
      ? location.pathname === item.to
      : location.pathname === '/' && 'href' in item && item.href.includes('#how-it-works')

  return (
    <LinkOrAnchor
      item={item}
      onClick={onClick}
      className={cn(
        'text-sm font-medium transition-colors',
        variant === 'overlay'
          ? cn('text-white/75 hover:text-white', isActive && 'text-white')
          : cn('text-muted-foreground hover:text-[#1a6b4a]', isActive && 'text-[#1a6b4a]')
      )}
    />
  )
}

function LinkOrAnchor({
  item,
  className,
  onClick,
}: {
  item: NavItem
  className: string
  onClick?: () => void
}) {
  if ('to' in item && item.to) {
    return (
      <Link to={item.to} className={className} onClick={onClick}>
        {item.label}
      </Link>
    )
  }

  return (
    <a href={'href' in item ? item.href : '#'} className={className} onClick={onClick}>
      {item.label}
    </a>
  )
}

function Logo({ variant }: { variant: 'default' | 'overlay' }) {
  const isOverlay = variant === 'overlay'

  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-transform group-hover:scale-105',
          isOverlay ? 'bg-[#f0a500] text-[#134d36]' : 'bg-[#1a6b4a] text-white'
        )}
      >
        I
      </div>
      <span
        className={cn(
          'text-base font-semibold tracking-tight',
          isOverlay ? 'text-white' : 'text-[#1a1a2e]'
        )}
      >
        Imara
      </span>
    </Link>
  )
}

export default function SiteHeader({ variant = 'default' }: SiteHeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isOverlay = variant === 'overlay'
  const navItems = getNavItems(user)

  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem('minap_user')
      setUser(raw ? JSON.parse(raw) : null)
    }

    loadUser()
    window.addEventListener('storage', loadUser)
    return () => window.removeEventListener('storage', loadUser)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('minap_token')
    localStorage.removeItem('minap_user')
    setUser(null)
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'counsellor'
      ? '/counsellor/dashboard'
      : user?.role === 'student'
        ? '/trainee/dashboard'
        : null

  return (
    <header
      className={cn(
        'z-50 w-full',
        isOverlay
          ? 'fixed left-0 right-0 top-0 bg-gradient-to-b from-[#04110c]/90 via-[#04110c]/50 to-transparent'
          : 'sticky top-0 border-b border-border/60 bg-white/90 backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Logo variant={variant} />

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} variant={variant} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {dashboardPath && (
                <Link
                  to={dashboardPath}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isOverlay
                      ? 'bg-white/10 text-white hover:bg-white/15'
                      : 'bg-[#e8f5ee] text-[#1a6b4a] hover:bg-[#d4ede0]'
                  )}
                >
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  isOverlay ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-[#1a1a2e]'
                )}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/trainee/register"
                className={cn(
                  'hidden text-sm font-medium transition-colors xl:inline',
                  isOverlay ? 'text-white/75 hover:text-white' : 'text-muted-foreground hover:text-[#1a6b4a]'
                )}
              >
                Register
              </Link>
              <Link
                to="/screening"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  isOverlay
                    ? 'bg-[#f0a500] text-[#134d36] hover:bg-[#ffb820]'
                    : 'bg-[#1a6b4a] text-white hover:bg-[#134d36]'
                )}
              >
                Start screening
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg lg:hidden',
            isOverlay
              ? 'text-white hover:bg-white/10'
              : 'text-[#1a1a2e] hover:bg-muted'
          )}
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            'border-t lg:hidden',
            isOverlay ? 'border-white/10 bg-[#04110c]/95 backdrop-blur-xl' : 'border-border bg-white'
          )}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3 sm:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                variant={variant}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
          <div
            className={cn(
              'mx-auto flex max-w-7xl flex-col gap-2 border-t px-5 py-3 sm:px-8',
              isOverlay ? 'border-white/10' : 'border-border'
            )}
          >
            {user ? (
              <>
                {dashboardPath && (
                  <Link
                    to={dashboardPath}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium',
                      isOverlay ? 'bg-white/10 text-white' : 'bg-[#e8f5ee] text-[#1a6b4a]'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-left text-sm font-medium',
                    isOverlay ? 'text-white/80' : 'text-[#1a1a2e]'
                  )}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/trainee/register"
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isOverlay ? 'text-white/90' : 'text-[#1a1a2e]'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  Register as trainee
                </Link>
                <Link
                  to="/screening"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f0a500] px-3 py-2.5 text-sm font-semibold text-[#134d36]"
                  onClick={() => setMobileOpen(false)}
                >
                  Start screening
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
