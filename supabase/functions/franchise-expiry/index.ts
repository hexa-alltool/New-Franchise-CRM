import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const today = new Date().toISOString().split('T')[0]
  const { data: expired } = await supabase.from('franchises').select('id,name,owner_id').lt('tenure_end', today).eq('franchise_status', 'active')
  if (!expired?.length) return new Response(JSON.stringify({ success: true, expired: 0 }))
  await supabase.from('franchises').update({ franchise_status: 'expired', updated_at: new Date().toISOString() }).in('id', expired.map((f: any) => f.id))
  for (const f of expired) {
    if (f.owner_id) {
      await supabase.from('profiles').update({ franchise_status: 'expired' }).eq('franchise_id', f.id)
      await supabase.from('notifications').insert({ user_id: f.owner_id, title: 'Franchise expired', message: `"${f.name}" expire ho gayi. Admin se renew karwao.`, type: 'renewal' })
    }
  }
  return new Response(JSON.stringify({ success: true, expired: expired.length }), { headers: { 'Content-Type': 'application/json' } })
})
