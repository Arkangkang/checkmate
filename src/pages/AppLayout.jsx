import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function AppLayout() {
  const [open, setOpen] = useState(() => window.innerWidth >= 900)

  return (
    <div className="app-shell">
      <Sidebar open={open} setOpen={setOpen} />
      <div className={`app-content ${open ? 'with-sidebar' : ''}`}>
        <Outlet />
      </div>
    </div>
  )
}
