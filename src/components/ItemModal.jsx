import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit3, Save, Trash2, X } from 'lucide-react'
import PriorityBadge from './PriorityBadge'
import { formatDate, getDayLabel, getDaysLeft } from '../lib/date'

const taskTypes = ['Individu', 'Kelompok', 'Ujian']
const impacts = ['Besar', 'Sedang', 'Kecil']
const lateOptions = ['Tinggi', 'Sedang', 'Rendah']
const difficulties = ['Sulit', 'Sedang', 'Mudah']

export default function ItemModal({ item, onClose, onUpdate, onDelete }) {
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    setForm(item)
    setEdit(false)
  }, [item])

  const daysLeft = useMemo(() => item ? getDaysLeft(item.deadline_date) : 0, [item])

  if (!item || !form) return null

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      title: form.title.trim(),
      note: form.note || null,
      deadline_date: form.deadline_date,
      task_type: form.type === 'task' ? form.task_type : null,
      impact: form.type === 'task' ? form.impact : null,
      late_consequence: form.type === 'task' ? form.late_consequence : null,
      difficulty: form.type === 'task' ? form.difficulty : null,
    }
    const { error } = await onUpdate(item.id, payload)
    setSaving(false)
    if (!error) setEdit(false)
  }

  async function handleDelete() {
    const ok = window.confirm(`Hapus ${item.title}?`)
    if (!ok) return
    const { error } = await onDelete(item)
    if (!error) onClose()
  }

  const modal = (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.section
          className="detail-modal glass-card"
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 35, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="icon-button modal-close-button" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>

          <div className="modal-header">
            <div>
              <span className="eyebrow">Detail {item.type === 'task' ? 'Tugas' : 'Kegiatan'}</span>
              <h2>{item.title}</h2>
            </div>
          </div>

          <div className="modal-priority-row">
            <PriorityBadge item={form} />
            <div className="deadline-pill">
              <strong>{getDayLabel(daysLeft)}</strong>
              <span>{formatDate(item.deadline_date)}</span>
            </div>
          </div>

          <div className="form-grid modal-form">
            <label>
              Nama
              <input value={form.title} disabled={!edit} onChange={(e) => updateField('title', e.target.value)} />
            </label>
            <label>
              Deadline
              <input type="date" value={form.deadline_date} disabled={!edit} onChange={(e) => updateField('deadline_date', e.target.value)} />
            </label>

            {form.type === 'task' && (
              <>
                <label>
                  Jenis Tugas
                  <select value={form.task_type || ''} disabled={!edit} onChange={(e) => updateField('task_type', e.target.value)}>
                    {taskTypes.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Dampak Nilai
                  <select value={form.impact || ''} disabled={!edit} onChange={(e) => updateField('impact', e.target.value)}>
                    {impacts.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Konsekuensi Telat
                  <select value={form.late_consequence || ''} disabled={!edit} onChange={(e) => updateField('late_consequence', e.target.value)}>
                    {lateOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Tingkat Kesulitan
                  <select value={form.difficulty || ''} disabled={!edit} onChange={(e) => updateField('difficulty', e.target.value)}>
                    {difficulties.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </>
            )}

            <label className="full-field">
              Note
              <textarea value={form.note || ''} disabled={!edit} onChange={(e) => updateField('note', e.target.value)} placeholder="Catatan tambahan..." />
            </label>
          </div>

          <div className="modal-actions">
            <button className="danger-button" onClick={handleDelete}><Trash2 size={17} /> Hapus</button>
            {edit ? (
              <button className="primary-button" onClick={handleSave} disabled={saving || !form.title.trim()}><Save size={17} /> {saving ? 'Menyimpan...' : 'Simpan'}</button>
            ) : (
              <button className="primary-button" onClick={() => setEdit(true)}><Edit3 size={17} /> Edit</button>
            )}
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}
