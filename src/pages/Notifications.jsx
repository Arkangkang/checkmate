import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { formatDateTime } from '../lib/date'

const levelIcon = {
  info: '♙',
  success: '♘',
  warning: '♜',
  danger: '♛',
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllRead, deleteNotification } = useData()

  return (
    <PageTransition>
      <div className="page-header row-header">
        <div>
          <span className="eyebrow">♛ Notifikasi</span>
          <h1>Pusat peringatan CheckMate</h1>
          <p>Semua aktivitas tambah, edit, hapus, prioritas tinggi, sangat tinggi, dan deadline terlewat akan muncul di sini.</p>
        </div>
        <button className="primary-button" onClick={markAllRead}><CheckCheck size={18} /> Tandai Dibaca</button>
      </div>

      {notifications.length ? (
        <div className="notification-list">
          {notifications.map((item) => (
            <motion.article
              className={`notification-card glass-card ${item.level} ${item.is_read ? 'read' : 'unread'}`}
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
            >
              <button className="notification-main" onClick={() => markNotificationRead(item.id)}>
                <div className="notification-piece">{levelIcon[item.level]}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                  <span>{formatDateTime(item.created_at)}</span>
                </div>
              </button>
              <button className="icon-button danger-icon" onClick={() => deleteNotification(item.id)} aria-label="Hapus notifikasi"><Trash2 size={17} /></button>
            </motion.article>
          ))}
        </div>
      ) : (
        <EmptyState icon="♙" title="Belum ada notifikasi" subtitle="Notifikasi akan muncul setelah kamu menambah, mengedit, menghapus, atau saat ada prioritas penting." />
      )}

      <div className="glass-card notification-rules">
        <Bell />
        <div>
          <h3>Aturan peringatan otomatis</h3>
          <p>Prioritas Tinggi memberi peringatan pertama. Prioritas Sangat Tinggi memberi peringatan terakhir. Deadline terlewat akan masuk level bahaya.</p>
        </div>
      </div>
    </PageTransition>
  )
}
