import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../utils/helpers'
import { Package, Check, X } from 'lucide-react'

const statusVariant={ pending:'pending',approved:'active',rejected:'expired',dispatched:'info',delivered:'active' }

export default function AdminBookOrders() {
  const { profile } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [detail,  setDetail]  = useState(null)
  const [toast,   setToast]   = useState('')
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  useEffect(()=>{ if(profile?.id) fetchOrders() },[profile?.id])
  async function fetchOrders(){ setLoading(true); const { data } = await supabase.from('book_orders').select('*,franchise:franchises(name,city)').order('created_at',{ascending:false}); setOrders(data||[]); setLoading(false) }

  async function updateStatus(id,status){ await supabase.from('book_orders').update({status,approved_by:profile.id,updated_at:new Date().toISOString()}).eq('id',id); await fetchOrders(); setDetail(null); showToast(`Order ${status}!`) }

  const columns=[
    {key:'franchise',label:'Franchise',render:v=><div><p className="font-medium text-sm">{v?.name}</p><p className="text-xs text-gray-400">{v?.city}</p></div>},
    {key:'order_type',label:'Type',render:v=><Badge label={v?.replace('_',' ')} variant="info"/>},
    {key:'quantity',label:'Qty',render:v=><span className="font-medium text-sm">{v}</span>},
    {key:'required_by',label:'Required by',render:v=>formatDate(v)},
    {key:'status',label:'Status',render:v=><Badge label={v} variant={statusVariant[v]} dot/>},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2"><Package className="w-5 h-5 text-primary-500"/><h1 className="page-title">Book orders</h1></div>
      {orders.filter(o=>o.status==='pending').length>0&&<div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"/><p className="text-sm text-amber-800 font-medium">{orders.filter(o=>o.status==='pending').length} orders pending</p></div>}
      <DataTable columns={columns} data={orders} loading={loading} searchKeys={[]} emptyText="Koi order nahi"
        actions={row=>row.status==='pending'?(
          <><button onClick={()=>updateStatus(row.id,'approved')} className="p-1.5 rounded text-gray-400 hover:bg-green-50 hover:text-green-600"><Check className="w-3.5 h-3.5"/></button><button onClick={()=>updateStatus(row.id,'rejected')} className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"><X className="w-3.5 h-3.5"/></button></>
        ):<button onClick={()=>setDetail(row)} className="text-xs text-primary-600 hover:underline">Update</button>}
      />
      <Modal open={!!detail} onClose={()=>setDetail(null)} title="Update status" size="sm">
        {detail&&<div className="space-y-3">
          <p className="text-sm text-gray-600"><span className="font-medium">{detail.franchise?.name}</span> — {detail.order_type?.replace('_',' ')} × {detail.quantity}</p>
          <div className="grid grid-cols-2 gap-2">{['approved','dispatched','delivered','rejected'].map(s=><button key={s} onClick={()=>updateStatus(detail.id,s)} className={`py-2.5 rounded-xl text-xs font-medium border transition-colors ${detail.status===s?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}</div>
        </div>}
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
