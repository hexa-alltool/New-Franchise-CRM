import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread]               = useState(0)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    setNotifications(data || [])
    setUnread((data || []).filter(n => !n.is_read).length)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function markRead(id) { await supabase.from('notifications').update({ is_read: true }).eq('id', id); await fetch() }
  async function markAllRead() { if (!user) return; await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id); await fetch() }

  return { notifications, unread, markRead, markAllRead, refetch: fetch }
}
