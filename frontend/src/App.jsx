import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SiteHeader from './components/SiteHeader'
import Footer from './components/Footer'
import Home from './pages/Home'
import Screening from './pages/Screening'
import CounsellorLogin from './pages/CounsellorLogin'
import CounsellorDashboard from './pages/CounsellorDashboard'
import StudentLogin from './pages/StudentLogin'
import StudentRegister from './pages/StudentRegister'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function AppLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader variant={isHome ? 'overlay' : 'default'} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
            <Route
              path="/screening"
              element={
                <ProtectedRoute redirectTo="/trainee/login" requiredRole="student">
                  <Screening />
                </ProtectedRoute>
              }
            />
            <Route path="/trainee/login" element={<StudentLogin />} />
            <Route path="/trainee/register" element={<StudentRegister />} />
            <Route
              path="/trainee/dashboard"
              element={
                <ProtectedRoute redirectTo="/trainee/login" requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/counsellor/login" element={<CounsellorLogin />} />
            <Route
              path="/counsellor/dashboard"
              element={
                <ProtectedRoute redirectTo="/counsellor/login" requiredRole="counsellor">
                  <CounsellorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
