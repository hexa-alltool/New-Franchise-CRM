import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const today = new Date(); let sent = 0
  for (const days of [90, 60, 30, 7]) {
    const target = new Date(today); target.setDate(today.getDate() + days)
    const dateStr = target.toISOString().split('T')[0]
    const { data: franchises } = await supabase.from('franchises').select('id,name,owner_id,admin_id').eq('tenure_end', dateStr).eq('franchise_status', 'active')
    for (const f of (franchises || [])) {
      if (f.owner_id) await supabase.from('notifications').insert({ user_id: f.owner_id, title: `Renewal — ${days} days left`, message: `"${f.name}" ${days} din mein expire hogi.`, type: 'renewal' })
      if (f.admin_id) await supabase.from('notifications').insert({ user_id: f.admin_id, title: `Renewal due — ${f.name}`, message: `"${f.name}" ${days} din mein expire hogi.`, type: 'renewal' })
      sent++
    }
  }
  return new Response(JSON.stringify({ success: true, sent }), { headers: { 'Content-Type': 'application/json' } })
})
