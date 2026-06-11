import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Bell, LayoutDashboard, ListChecks, LogOut, Menu, PlusCircle, UserRound, X, CalendarCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import mascot from '../assets/horse-mascot.svg'

const links = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/add', label: 'Add Data', icon: PlusCircle },
  { to: '/app/tasks', label: 'List Tugas', icon: ListChecks },
  { to: '/app/activities', label: 'List Kegiatan', icon: Activity },
  { to: '/app/notifications', label: 'Notifikasi', icon: Bell },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
]

export default function Sidebar({ open, setOpen }) {
  const { signOut, profile } = useAuth()
  const { notifications } = useData()
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.is_read).length

  async function handleLogout() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <>
      <button className="sidebar-float-toggle" onClick={() => setOpen(true)} aria-label="Buka menu">
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            className="sidebar glass-card"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="sidebar-top">
              <div className="brand-mini">
                <img src={mascot} alt="CheckMate Mascot" />
                <div>
                  <strong>CheckMate</strong>
                  <small>Priority System</small>
                </div>
              </div>
              <button className="icon-button" onClick={() => setOpen(false)} aria-label="Tutup menu">
                <X size={18} />
              </button>
            </div>

            <div className="user-pill">
              <div className="avatar-small">
                {profile?.avatar_data_url ? <img src={profile.avatar_data_url} alt="Avatar" /> : <CalendarCheck size={18} />}
              </div>
              <div>
                <strong>{profile?.username || 'CheckMate User'}</strong>
                <small>{profile?.email}</small>
              </div>
            </div>

            <nav className="sidebar-nav">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => window.innerWidth < 900 && setOpen(false)}>
                  <Icon size={20} />
                  <span>{label}</span>
                  {label === 'Notifikasi' && unread > 0 && <b>{unread}</b>}
                </NavLink>
              ))}
            </nav>

            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={19} /> Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
