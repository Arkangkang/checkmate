import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import BackgroundEffects from './components/BackgroundEffects'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import AppLayout from './pages/AppLayout'
import Dashboard from './pages/Dashboard'
import AddData from './pages/AddData'
import TaskList from './pages/TaskList'
import ActivityList from './pages/ActivityList'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

function Protected({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-screen">♞ Menyiapkan papan CheckMate...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default function App() {
  return (
    <>
      <BackgroundEffects />

      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/app"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add" element={<AddData />} />
          <Route path="tasks" element={<TaskList />} />
          <Route path="activities" element={<ActivityList />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}