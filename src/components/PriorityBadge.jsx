import { calculatePriority, getPriorityMeta } from '../lib/priority'

export default function PriorityBadge({ item, value: forcedValue, compact = false }) {
  const value = forcedValue ?? calculatePriority(item)
  const meta = getPriorityMeta(value)

  return (
    <span className={`priority-badge ${meta.tone} ${compact ? 'compact' : ''}`} title={`Value ${value}`}>
      <span>{meta.emoji}</span>
      <strong>{meta.label}</strong>
      <small>{value}</small>
    </span>
  )
}
