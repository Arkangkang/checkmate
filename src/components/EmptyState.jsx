import { motion } from 'framer-motion'

export default function EmptyState({ icon = '♘', title, subtitle }) {
  return (
    <motion.div
      className="empty-state glass-card"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </motion.div>
  )
}
