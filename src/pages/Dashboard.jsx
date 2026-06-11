import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, BadgeCheck, CalendarClock, CheckCircle2, ListTodo, TrendingUp } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import StatCard from '../components/StatCard'
import ItemCard from '../components/ItemCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { calculatePriority, getPriorityMeta, sortByPriority } from '../lib/priority'
import { getDaysLeft, monthKey, monthLabel } from '../lib/date'

const chartColors = ['#e95b5b', '#f2c94c', '#69923e', '#4f8ddf']

export default function Dashboard() {
  const navigate = useNavigate()
  const { items, toggleComplete } = useData()

  const analytics = useMemo(() => {
    const enriched = items.map((item) => ({ ...item, value: calculatePriority(item), daysLeft: getDaysLeft(item.deadline_date), meta: getPriorityMeta(calculatePriority(item)) }))
    const completed = enriched.filter((item) => item.status === 'completed')
    const overdueItems = enriched.filter((item) => item.status === 'remaining' && item.daysLeft < 0)
    const remaining = enriched.filter((item) => item.status === 'remaining' && item.daysLeft >= 0)
    const history = [...completed, ...overdueItems]
    const values = enriched.map((item) => item.value)
    const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
    const max = values.length ? Math.max(...values) : 0
    const min = values.length ? Math.min(...values) : 0
    const overdue = overdueItems.length
    const completionRate = enriched.length ? (completed.length / enriched.length) * 100 : 0

    const priorityMap = ['Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah'].map((name) => ({ name, value: enriched.filter((item) => item.meta.label === name).length }))
    const typeData = [
      { name: 'Tugas', remaining: remaining.filter((item) => item.type === 'task').length, history: history.filter((item) => item.type === 'task').length },
      { name: 'Kegiatan', remaining: remaining.filter((item) => item.type === 'activity').length, history: history.filter((item) => item.type === 'activity').length },
    ]

    const monthMap = {}
    enriched.forEach((item) => {
      const key = monthKey(item.deadline_date)
      if (!monthMap[key]) monthMap[key] = { month: monthLabel(key), tugas: 0, kegiatan: 0, value: 0, count: 0 }
      if (item.type === 'task') monthMap[key].tugas += 1
      else monthMap[key].kegiatan += 1
      monthMap[key].value += item.value
      monthMap[key].count += 1
    })
    const monthly = Object.keys(monthMap).sort().map((key) => ({
      ...monthMap[key],
      rataRata: Number((monthMap[key].value / monthMap[key].count).toFixed(1)),
    }))

    return { enriched, remaining, completed, history, average, max, min, overdue, completionRate, priorityMap, typeData, monthly, topFive: sortByPriority(remaining).slice(0, 5) }
  }, [items])

  return (
    <PageTransition>
      <div className="page-header">
        <div>
          <span className="eyebrow">♛ Recap dan Analitik</span>
          <h1>Dashboard CheckMate</h1>
          <p>Lihat kondisi tugas dan kegiatanmu dalam satu papan strategi.</p>
        </div>
      </div>

      <section className="stats-grid">
        <StatCard icon={<ListTodo />} label="Tugas Remaining" value={analytics.remaining.filter((i) => i.type === 'task').length} hint="Klik untuk lihat" onClick={() => navigate('/app/tasks?status=remaining')} />
        <StatCard icon={<Activity />} label="Kegiatan Remaining" value={analytics.remaining.filter((i) => i.type === 'activity').length} hint="Klik untuk lihat" onClick={() => navigate('/app/activities?status=remaining')} />
        <StatCard icon={<CheckCircle2 />} label="History Tugas" value={analytics.history.filter((i) => i.type === 'task').length} hint="Selesai + terlambat" onClick={() => navigate('/app/tasks?status=history')} />
        <StatCard icon={<BadgeCheck />} label="History Kegiatan" value={analytics.history.filter((i) => i.type === 'activity').length} hint="Selesai + terlambat" onClick={() => navigate('/app/activities?status=history')} />
      </section>

      <section className="mini-analytics-grid">
        <div className="glass-card metric-card"><TrendingUp /><span>Rata-rata Value</span><strong>{analytics.average.toFixed(1)}</strong></div>
        <div className="glass-card metric-card"><span>♛</span><span>Value Tertinggi</span><strong>{analytics.max}</strong></div>
        <div className="glass-card metric-card"><span>♙</span><span>Value Terendah</span><strong>{analytics.min}</strong></div>
        <div className="glass-card metric-card"><CalendarClock /><span>Terlewat</span><strong>{analytics.overdue}</strong></div>
        <div className="glass-card metric-card"><CheckCircle2 /><span>Completion Rate</span><strong>{analytics.completionRate.toFixed(0)}%</strong></div>
      </section>

      <section className="charts-grid">
        <motion.div className="chart-card glass-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h3>Distribusi Prioritas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.priorityMap} dataKey="value" nameKey="name" outerRadius={92} innerRadius={54} paddingAngle={4}>
                {analytics.priorityMap.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-card glass-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
          <h3>Tugas vs Kegiatan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.typeData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="remaining" name="Belum selesai" fill="#69923e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="history" name="History" fill="#4f8ddf" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart-card glass-card wide" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
          <h3>Tren Bulanan dan Rata-rata Value</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tugas" stroke="#69923e" strokeWidth={3} dot />
              <Line type="monotone" dataKey="kegiatan" stroke="#4f8ddf" strokeWidth={3} dot />
              <Line type="monotone" dataKey="rataRata" stroke="#f2c94c" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </section>

      <section className="top-list-section">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Top 5</span>
          <h2>Prioritas tertinggi yang perlu kamu cek.</h2>
        </div>
        {analytics.topFive.length ? (
          <div className="item-list">
            {analytics.topFive.map((item) => <ItemCard key={item.id} item={item} onOpen={() => item.type === 'task' ? navigate('/app/tasks') : navigate('/app/activities')} onToggle={toggleComplete} />)}
          </div>
        ) : (
          <EmptyState title="Belum ada prioritas aktif" subtitle="Tambahkan tugas atau kegiatan baru dari halaman Add Data." />
        )}
      </section>
    </PageTransition>
  )
}
