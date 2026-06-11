import { motion } from 'framer-motion'

export default function StatCard({ icon, label, value, hint, onClick }) {
  const content = (
    <motion.div
      className="stat-card glass-card"
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        {hint && <span>{hint}</span>}
      </div>
    </motion.div>
  )

  if (!onClick) return content
  return <button className="stat-button" onClick={onClick}>{content}</button>
}
