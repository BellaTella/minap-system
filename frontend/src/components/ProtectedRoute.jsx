import { Navigate } from 'react-router-dom'

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('minap_user'))
  } catch {
    return null
  }
}

function dashboardFor(role) {
  if (role === 'counsellor') return '/counsellor/dashboard'
  if (role === 'student') return '/trainee/dashboard'
  return '/'
}

export default function ProtectedRoute({ children, redirectTo, requiredRole }) {
  const token = localStorage.getItem('minap_token')

  if (!token) {
    return <Navigate to={redirectTo || '/trainee/login'} replace />
  }

  if (requiredRole) {
    const role = getUser()?.role
    if (role && role !== requiredRole) {
      // Logged in, but wrong role for this page — send them to their own dashboard
      return <Navigate to={dashboardFor(role)} replace />
    }
  }

  return children
}
