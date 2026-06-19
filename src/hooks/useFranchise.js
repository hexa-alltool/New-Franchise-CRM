import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFranchises(adminId = null) {
  const [franchises, setFranchises] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase.from('franchises').select(`*, owner:profiles!franchises_owner_id_fkey(id,name,email,mobile), admin:profiles!franchises_admin_id_fkey(id,name)`).order('created_at', { ascending: false })
      if (adminId) q = q.eq('admin_id', adminId)
      const { data, error } = await q
      if (error) throw error
      setFranchises(data || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [adminId])

  useEffect(() => { fetch() }, [fetch])

  async function upsertFranchise(payload, id = null) {
    const { data, error } = id
      ? await supabase.from('franchises').update(payload).eq('id', id).select().single()
      : await supabase.from('franchises').insert(payload).select().single()
    if (error) throw error
    await fetch(); return data
  }

  async function deleteFranchise(id) {
    const { error } = await supabase.from('franchises').delete().eq('id', id)
    if (error) throw error
    await fetch()
  }

  async function updateStatus(id, franchise_status) {
    const { error } = await supabase.from('franchises').update({ franchise_status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    await fetch()
  }

  return { franchises, loading, error, refetch: fetch, upsertFranchise, deleteFranchise, updateStatus }
}
