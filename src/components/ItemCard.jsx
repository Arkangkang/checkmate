import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import PriorityBadge from './PriorityBadge'
import { formatDate, formatDateTime, getDayLabel, getDaysLeft } from '../lib/date'

export default function ItemCard({ item, onOpen, onToggle, mode = 'list' }) {
  const daysLeft = getDaysLeft(item.deadline_date)
  const typeLabel = item.type === 'task' ? 'Tugas' : 'Kegiatan'
  const isHistory = mode === 'history'
  const isLate = item.status !== 'completed' && daysLeft < 0
  const completedAt = item.completed_at || item.updated_at

  return (
    <motion.article
      className={`item-card glass-card ${item.status === 'completed' ? 'done' : ''} ${isHistory ? 'history' : ''} ${isLate ? 'late' : ''}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <button className="item-main" onClick={() => onOpen(item)}>
        <div className="item-chess">{item.type === 'task' ? '♜' : '♞'}</div>
        <div className="item-info">
          <span className="eyebrow">{typeLabel}</span>
          <h3>{item.title}</h3>

          {isHistory ? (
            <div className="item-meta history-meta">
              {item.status === 'completed' ? (
                <span><Calendar size={15} /> Selesai: {formatDateTime(completedAt)}</span>
              ) : (
                <span><Calendar size={15} /> Terlambat sejak: {formatDate(item.deadline_date)}</span>
              )}
            </div>
          ) : (
            <div className="item-meta">
              <span><Calendar size={15} /> {formatDate(item.deadline_date)}</span>
              <span><Clock size={15} /> {getDayLabel(daysLeft)}</span>
            </div>
          )}
        </div>
      </button>

      <div className="item-side">
        {isHistory ? (
          <span className={`history-status-chip ${isLate ? 'late' : 'completed'}`}>
            {isLate ? 'Terlambat' : 'Selesai'}
          </span>
        ) : (
          <PriorityBadge item={item} compact />
        )}

        <button className="soft-button tiny" onClick={() => onToggle(item)}>
          {item.status === 'completed' ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
          {item.status === 'completed' ? 'Buka' : 'Selesai'}
        </button>
      </div>
    </motion.article>
  )
}
