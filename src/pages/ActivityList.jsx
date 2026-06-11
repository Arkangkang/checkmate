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

export default function ActivityList() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'remaining'
  const { items, updateItem, deleteItem, toggleComplete } = useData()
  const [selected, setSelected] = useState(null)

  const activities = useMemo(() => {
    const activityItems = items.filter((item) => item.type === 'activity')

    if (status === 'history') {
      return [...activityItems]
        .filter((item) => item.status === 'completed' || (item.status === 'remaining' && getDaysLeft(item.deadline_date) < 0))
        .sort((a, b) => {
          const dateA = new Date(a.completed_at || a.updated_at || a.deadline_date).getTime()
          const dateB = new Date(b.completed_at || b.updated_at || b.deadline_date).getTime()
          return dateB - dateA
        })
    }

    return sortByPriority(activityItems.filter((item) => item.status === 'remaining' && getDaysLeft(item.deadline_date) >= 0))
  }, [items, status])

  const isHistory = status === 'history'

  return (
    <PageTransition>
      <div className="page-header row-header">
        <div>
          <span className="eyebrow">♞ List Kegiatan</span>
          <h1>{isHistory ? 'History Kegiatan' : 'Kegiatan Belum Selesai'}</h1>
          <p>{isHistory ? 'Berisi kegiatan yang sudah selesai dan kegiatan yang terlambat.' : 'Klik salah satu kegiatan untuk melihat detail, edit, atau hapus data.'}</p>
        </div>
        <Link className="primary-button" to="/app/add"><Plus size={18} /> Tambah Kegiatan</Link>
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

      {activities.length ? (
        <div className="item-list">
          {activities.map((item) => <ItemCard key={item.id} item={item} mode={isHistory ? 'history' : 'list'} onOpen={setSelected} onToggle={toggleComplete} />)}
        </div>
      ) : (
        <EmptyState title={isHistory ? 'History kegiatan masih kosong' : 'Belum ada kegiatan aktif'} subtitle={isHistory ? 'Kegiatan yang selesai atau terlambat akan masuk ke sini.' : 'Tambahkan kegiatan baru dari halaman Add Data.'} />
      )}

      <ItemModal item={selected} onClose={() => setSelected(null)} onUpdate={updateItem} onDelete={deleteItem} />
    </PageTransition>
  )
}
