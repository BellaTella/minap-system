import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Screening from './pages/Screening'
import CounsellorLogin from './pages/CounsellorLogin'
import CounsellorDashboard from './pages/CounsellorDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/screening" element={<Screening />} />
            <Route path="/counsellor/login" element={<CounsellorLogin />} />
            <Route
              path="/counsellor/dashboard"
              element={
                <ProtectedRoute>
                  <CounsellorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
