import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import ItemCard from '../components/ItemCard'
import ItemModal from '../components/ItemModal'
import EmptyState from '../components/EmptyState'
import { useData } from '../context/DataContext'
import { getDaysLeft } from '../lib/date'
import { sortByPriority } from '../lib/priority'

export default function TaskList() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'remaining'
  const { items, updateItem, deleteItem, toggleComplete } = useData()
  const [selected, setSelected] = useState(null)

  const tasks = useMemo(() => {
    const taskItems = items.filter((item) => item.type === 'task')

    if (status === 'history') {
      return [...taskItems]
        .filter((item) => item.status === 'completed' || (item.status === 'remaining' && getDaysLeft(item.deadline_date) < 0))
        .sort((a, b) => {
          const dateA = new Date(a.completed_at || a.updated_at || a.deadline_date).getTime()
          const dateB = new Date(b.completed_at || b.updated_at || b.deadline_date).getTime()
          return dateB - dateA
        })
    }

    return sortByPriority(taskItems.filter((item) => item.status === 'remaining' && getDaysLeft(item.deadline_date) >= 0))
  }, [items, status])

  const isHistory = status === 'history'

  return (
    <PageTransition>
      <div className="page-header row-header">
        <div>
          <span className="eyebrow">♜ List Tugas</span>
          <h1>{isHistory ? 'History Tugas' : 'Tugas Belum Selesai'}</h1>
          <p>{isHistory ? 'Berisi tugas yang sudah selesai dan tugas yang terlambat.' : 'Klik salah satu tugas untuk melihat detail, edit, atau hapus data.'}</p>
        </div>
        <Link className="primary-button" to="/app/add"><Plus size={18} /> Tambah Tugas</Link>
      </div>

      <div className="tab-bar glass-card">
  <button
    className={!isHistory ? 'active' : ''}
    onClick={() => setParams({}, { replace: true })}
  >
    Belum Selesai
  </button>

  <button
    className={isHistory ? 'active' : ''}
    onClick={() => setParams({ status: 'history' }, { replace: true })}
  >
    History
  </button>
</div>

      {tasks.length ? (
        <div className="item-list">
          {tasks.map((item) => <ItemCard key={item.id} item={item} mode={isHistory ? 'history' : 'list'} onOpen={setSelected} onToggle={toggleComplete} />)}
        </div>
      ) : (
        <EmptyState title={isHistory ? 'History tugas masih kosong' : 'Belum ada tugas aktif'} subtitle={isHistory ? 'Tugas yang selesai atau terlambat akan masuk ke sini.' : 'Tambahkan tugas baru dari halaman Add Data.'} />
      )}

      <ItemModal item={selected} onClose={() => setSelected(null)} onUpdate={updateItem} onDelete={deleteItem} />
    </PageTransition>
  )
}
