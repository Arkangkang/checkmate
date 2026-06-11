import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarPlus, ListTodo, NotebookPen, Sparkles } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import PriorityBadge from '../components/PriorityBadge'
import { useData } from '../context/DataContext'

const initialTask = {
  type: 'task',
  title: '',
  deadline_date: '',
  task_type: 'Individu',
  impact: 'Sedang',
  late_consequence: 'Sedang',
  difficulty: 'Sedang',
  note: '',
}

const initialActivity = {
  type: 'activity',
  title: '',
  deadline_date: '',
  note: '',
}

export default function AddData() {
  const navigate = useNavigate()
  const { addItem } = useData()
  const [kind, setKind] = useState('task')
  const [task, setTask] = useState(initialTask)
  const [activity, setActivity] = useState(initialActivity)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const form = kind === 'task' ? task : activity
  const previewReady = form.title && form.deadline_date
  const previewItem = useMemo(() => ({ ...form, status: 'remaining' }), [form])

  function updateField(field, value) {
    if (kind === 'task') setTask((prev) => ({ ...prev, [field]: value }))
    else setActivity((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setFeedback('')
    const payload = {
      ...form,
      title: form.title.trim(),
      note: form.note?.trim() || null,
      task_type: kind === 'task' ? form.task_type : null,
      impact: kind === 'task' ? form.impact : null,
      late_consequence: kind === 'task' ? form.late_consequence : null,
      difficulty: kind === 'task' ? form.difficulty : null,
    }
    const { error } = await addItem(payload)
    setLoading(false)
    if (error) {
      setFeedback(error.message)
      return
    }
    if (kind === 'task') setTask(initialTask)
    else setActivity(initialActivity)
    navigate(kind === 'task' ? '/app/tasks?status=remaining' : '/app/activities?status=remaining')
  }

  return (
    <PageTransition>
      <div className="page-header">
        <div>
          <span className="eyebrow">♞ Add Data</span>
          <h1>Tambahkan langkah baru</h1>
          <p>Pilih tugas atau kegiatan, lalu CheckMate menghitung value prioritasnya.</p>
        </div>
      </div>

      <section className="add-shell">
        <div className="glass-card add-card">
          <div className="segmented-control">
            <button className={kind === 'task' ? 'active' : ''} onClick={() => setKind('task')}><ListTodo size={18} /> Tugas</button>
            <button className={kind === 'activity' ? 'active' : ''} onClick={() => setKind('activity')}><CalendarPlus size={18} /> Kegiatan</button>
          </div>

          {feedback && <div className="alert error">{feedback}</div>}

          <AnimatePresence mode="wait">
            <motion.form key={kind} className="form-grid" onSubmit={handleSubmit} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3 }}>
              <label className="full-field">
                {kind === 'task' ? 'Nama Tugas' : 'Nama Kegiatan'}
                <input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder={kind === 'task' ? 'Contoh: UAS Flutter' : 'Contoh: Rapat Kelompok'} required />
              </label>

              <label>
                Tanggal Deadline
                <input type="date" value={form.deadline_date} onChange={(e) => updateField('deadline_date', e.target.value)} required />
              </label>

              {kind === 'task' && (
                <>
                  <label>Jenis Tugas
                    <select value={form.task_type} onChange={(e) => updateField('task_type', e.target.value)}>
                      <option>Individu</option><option>Kelompok</option><option>Ujian</option>
                    </select>
                  </label>
                  <label>Dampak Nilai
                    <select value={form.impact} onChange={(e) => updateField('impact', e.target.value)}>
                      <option>Besar</option><option>Sedang</option><option>Kecil</option>
                    </select>
                  </label>
                  <label>Konsekuensi Telat
                    <select value={form.late_consequence} onChange={(e) => updateField('late_consequence', e.target.value)}>
                      <option>Tinggi</option><option>Sedang</option><option>Rendah</option>
                    </select>
                  </label>
                  <label>Tingkat Kesulitan
                    <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}>
                      <option>Sulit</option><option>Sedang</option><option>Mudah</option>
                    </select>
                  </label>
                </>
              )}

              <label className="full-field">
                Note / Catatan
                <textarea value={form.note} onChange={(e) => updateField('note', e.target.value)} placeholder="Tambahkan catatan opsional..." />
              </label>

              <button className="primary-button full" disabled={loading || !form.title.trim() || !form.deadline_date}>{loading ? 'Menyimpan...' : `Submit ${kind === 'task' ? 'Tugas' : 'Kegiatan'}`}</button>
            </motion.form>
          </AnimatePresence>
        </div>

        <aside className="glass-card preview-card">
          <div className="preview-icon"><NotebookPen /></div>
          <span className="eyebrow">Live Preview</span>
          <h2>{form.title || 'Nama data akan muncul di sini'}</h2>
          <p>{form.note || 'Catatan tambahan akan tampil di detail data.'}</p>
          {previewReady ? <PriorityBadge item={previewItem} /> : <div className="preview-placeholder"><Sparkles /> Isi nama dan deadline untuk melihat badge prioritas.</div>}
        </aside>
      </section>
    </PageTransition>
  )
}
