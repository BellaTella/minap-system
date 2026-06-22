import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('minap_token')
  
  if (!token) {
    return <Navigate to="/counsellor/login" replace />
  }
  
  return children
}
