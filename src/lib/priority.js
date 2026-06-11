import { getDaysLeft } from './date'

export const TASK_TYPE_VALUES = {
  Individu: 33,
  Kelompok: 67,
  Ujian: 100,
}

export const IMPACT_VALUES = {
  Besar: 100,
  Sedang: 67,
  Kecil: 33,
}

export const LATE_VALUES = {
  Tinggi: 100,
  Sedang: 67,
  Rendah: 33,
}

export const DIFFICULTY_VALUES = {
  Sulit: 100,
  Sedang: 67,
  Mudah: 33,
}

export function getDeadlineScore(daysLeft) {
  if (daysLeft < 0) return 100
  if (daysLeft <= 1) return 100
  if (daysLeft <= 3) return 87.5
  if (daysLeft <= 7) return 75
  if (daysLeft <= 14) return 62.5
  if (daysLeft <= 21) return 50
  if (daysLeft <= 30) return 37.5
  if (daysLeft <= 60) return 25
  return 12.5
}

export function calculatePriority(item) {
  const daysLeft = getDaysLeft(item.deadline_date)
  const deadlineScore = getDeadlineScore(daysLeft)

  if (item.type === 'activity') {
    return Number(deadlineScore.toFixed(2))
  }

  const taskType = TASK_TYPE_VALUES[item.task_type] || 0
  const impact = IMPACT_VALUES[item.impact] || 0
  const late = LATE_VALUES[item.late_consequence] || 0
  const difficulty = DIFFICULTY_VALUES[item.difficulty] || 0

  const value = taskType * 0.05 + deadlineScore * 0.5 + impact * 0.15 + late * 0.15 + difficulty * 0.15
  return Number(value.toFixed(2))
}

export function getPriorityMeta(value) {
  if (value > 85) {
    return { label: 'Sangat Tinggi', tone: 'critical', colorName: 'Merah', emoji: '♛' }
  }
  if (value > 75) {
    return { label: 'Tinggi', tone: 'high', colorName: 'Kuning', emoji: '♜' }
  }
  if (value > 55) {
    return { label: 'Sedang', tone: 'medium', colorName: 'Hijau', emoji: '♞' }
  }
  return { label: 'Rendah', tone: 'low', colorName: 'Biru', emoji: '♙' }
}

export function sortByPriority(items) {
  return [...items].sort((a, b) => calculatePriority(b) - calculatePriority(a))
}
