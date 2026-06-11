import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { calculatePriority, getPriorityMeta } from '../lib/priority'
import { getDaysLeft, getDayLabel } from '../lib/date'
import { useClock } from '../lib/useClock'

const DataContext = createContext(null)

function actionMessage(action, item) {
  const typeLabel = item.type === 'task' ? 'Tugas' : 'Kegiatan'
  const verb = {
    added: 'berhasil ditambahkan',
    edited: 'berhasil diedit',
    deleted: 'berhasil dihapus',
    completed: 'berhasil diselesaikan',
    reopened: 'dibuka kembali',
  }[action]
  return `${typeLabel} "${item.title}" ${verb}.`
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const now = useClock(60000)

  const fetchAll = useCallback(async () => {
    if (!user) {
      setItems([])
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    const [itemsResult, notificationsResult] = await Promise.all([
      supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    if (itemsResult.error) console.error(itemsResult.error.message)
    if (notificationsResult.error) console.error(notificationsResult.error.message)

    setItems(itemsResult.data || [])
    setNotifications(notificationsResult.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const createNotification = useCallback(async ({ itemId = null, title, message, level = 'info', tag = null }) => {
    if (!user) return null
    const payload = { user_id: user.id, item_id: itemId, title, message, level, tag }
    const query = tag
      ? supabase.from('notifications').upsert(payload, { onConflict: 'user_id,tag', ignoreDuplicates: true })
      : supabase.from('notifications').insert(payload)

    const { data, error } = await query.select().maybeSingle()

    if (error) {
      console.error('Gagal membuat notifikasi:', error.message)
      return null
    }

    if (data) setNotifications((prev) => [data, ...prev.filter((n) => n.id !== data.id)])
    return data
  }, [user])

  const addItem = useCallback(async (form) => {
    if (!user) return { error: new Error('User belum login') }
    const payload = { ...form, user_id: user.id, status: 'remaining', completed_at: null }
    const { data, error } = await supabase.from('items').insert(payload).select().single()
    if (!error) {
      setItems((prev) => [data, ...prev])
      await createNotification({
        itemId: data.id,
        title: 'Data baru ditambahkan',
        message: actionMessage('added', data),
        level: 'success',
      })
    }
    return { data, error }
  }, [user, createNotification])

  const updateItem = useCallback(async (id, updates) => {
    const { data, error } = await supabase.from('items').update(updates).eq('id', id).select().single()
    if (!error) {
      setItems((prev) => prev.map((item) => item.id === id ? data : item))
      await createNotification({
        itemId: data.id,
        title: 'Data berhasil diedit',
        message: actionMessage('edited', data),
        level: 'success',
      })
    }
    return { data, error }
  }, [createNotification])

  const deleteItem = useCallback(async (item) => {
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (!error) {
      setItems((prev) => prev.filter((current) => current.id !== item.id))
      await createNotification({
        title: 'Data berhasil dihapus',
        message: actionMessage('deleted', item),
        level: 'danger',
      })
    }
    return { error }
  }, [createNotification])

  const toggleComplete = useCallback(async (item) => {
    const nextStatus = item.status === 'completed' ? 'remaining' : 'completed'
    const updates = nextStatus === 'completed'
      ? { status: nextStatus, completed_at: new Date().toISOString() }
      : { status: nextStatus, completed_at: null }

    const { data, error } = await supabase.from('items').update(updates).eq('id', item.id).select().single()
    if (!error) {
      setItems((prev) => prev.map((current) => current.id === item.id ? data : current))
      await createNotification({
        itemId: data.id,
        title: nextStatus === 'completed' ? 'Checkmate! Selesai' : 'Data dibuka kembali',
        message: actionMessage(nextStatus === 'completed' ? 'completed' : 'reopened', data),
        level: nextStatus === 'completed' ? 'success' : 'info',
      })
    }
    return { data, error }
  }, [createNotification])

  const markNotificationRead = useCallback(async (id) => {
    const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single()
    if (!error) setNotifications((prev) => prev.map((item) => item.id === id ? data : item))
    return { data, error }
  }, [])

  const markAllRead = useCallback(async () => {
    if (!user) return
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    if (!error) setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
  }, [user])

  const deleteNotification = useCallback(async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (!error) setNotifications((prev) => prev.filter((item) => item.id !== id))
    return { error }
  }, [])

  useEffect(() => {
    if (!user || !items.length) return

    const remaining = items.filter((item) => item.status === 'remaining')
    remaining.forEach((item) => {
      const daysLeft = getDaysLeft(item.deadline_date)
      const value = calculatePriority(item)
      const meta = getPriorityMeta(value)
      const typeLabel = item.type === 'task' ? 'Tugas' : 'Kegiatan'

      if (daysLeft < 0) {
        createNotification({
          itemId: item.id,
          title: `${typeLabel} terlewat`,
          message: `${item.title} sudah melewati deadline. ${getDayLabel(daysLeft)}.`,
          level: 'danger',
          tag: `overdue_${item.id}`,
        })
        return
      }

      if (meta.label === 'Sangat Tinggi') {
        createNotification({
          itemId: item.id,
          title: 'Peringatan terakhir prioritas',
          message: `${item.title} masuk prioritas Sangat Tinggi dengan value ${value}. ${getDayLabel(daysLeft)}.`,
          level: 'danger',
          tag: `critical_${item.id}`,
        })
        return
      }

      if (meta.label === 'Tinggi') {
        createNotification({
          itemId: item.id,
          title: 'Peringatan prioritas tinggi',
          message: `${item.title} masuk prioritas Tinggi dengan value ${value}. ${getDayLabel(daysLeft)}.`,
          level: 'warning',
          tag: `high_${item.id}`,
        })
      }
    })
  }, [items, user, createNotification, now])

  const value = useMemo(() => ({
    items,
    notifications,
    loading,
    fetchAll,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    createNotification,
    markNotificationRead,
    markAllRead,
    deleteNotification,
  }), [items, notifications, loading, fetchAll, addItem, updateItem, deleteItem, toggleComplete, createNotification, markNotificationRead, markAllRead, deleteNotification])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData harus dipakai di dalam DataProvider')
  return context
}
