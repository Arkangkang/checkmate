export function toDateOnly(dateValue) {
  const date = new Date(dateValue)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function getDaysLeft(deadlineDate) {
  const today = toDateOnly(new Date())
  const deadline = toDateOnly(`${deadlineDate}T00:00:00`)
  const diff = deadline.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatDate(dateValue) {
  if (!dateValue) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export function formatDateTime(dateValue) {
  if (!dateValue) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

export function getDayLabel(daysLeft) {
  if (daysLeft < 0) return `Terlewat ${Math.abs(daysLeft)} hari`
  if (daysLeft === 0) return 'Deadline hari ini'
  if (daysLeft === 1) return 'Sisa 1 hari'
  return `Sisa ${daysLeft} hari`
}

export function monthKey(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(key) {
  const [year, month] = key.split('-').map(Number)
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1))
}
