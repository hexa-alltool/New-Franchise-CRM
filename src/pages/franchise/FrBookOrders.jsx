import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { formatDate } from '../../utils/helpers'
import { ShoppingBag, Plus, Package } from 'lucide-react'

const STATUS_VARIANT={ pending:'pending',approved:'active',rejected:'expired',dispatched:'info',delivered:'active' }
const ORDER_LABEL={ full_set:'Full book set',short_course:'Short course books',practice:'Practice books' }

export default function FrBookOrders() {
  const { profile } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState({ order_type:'full_set',quantity:'1',delivery_address:'',required_by:'',notes:'' })
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState('')
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  const fetchOrders = useCallback(async()=>{
    if(!profile?.franchise_id) return; setLoading(true)
    const { data } = await supabase.from('book_orders').select('*').eq('franchise_id',profile.franchise_id).order('created_at',{ascending:false})
    setOrders(data||[]); setLoading(false)
  },[profile?.franchise_id])

  useEffect(()=>{ fetchOrders() },[fetchOrders])

  async function handleSubmit(e){
    e.preventDefault(); setSaving(true)
    try { await supabase.from('book_orders').insert({franchise_id:profile.franchise_id,order_type:form.order_type,quantity:parseInt(form.quantity),delivery_address:form.delivery_address,required_by:form.required_by||null,notes:form.notes||null,status:'pending'}); await fetchOrders(); setModal(false); setForm({order_type:'full_set',quantity:'1',delivery_address:'',required_by:'',notes:''}); showToast('Order placed!') }
    catch(e){alert(e.message)} finally{setSaving(false)}
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary-500"/><h1 className="page-title">Book orders</h1></div><button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> New order</button></div>
      {loading ? <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="card p-4 animate-pulse"><div className="h-3 bg-gray-100 rounded w-1/3 mb-2"/><div className="h-2 bg-gray-100 rounded w-1/2"/></div>)}</div>
      : orders.length===0 ? <div className="card p-10 text-center"><Package className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">Koi order nahi</p><button onClick={()=>setModal(true)} className="mt-3 text-xs text-primary-600 hover:underline">Pehla order karo</button></div>
      : <div className="space-y-2">{orders.map(order=>(
          <div key={order.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-purple-600"/></div><div><p className="font-semibold text-sm text-gray-900">{ORDER_LABEL[order.order_type]||order.order_type}</p><p className="text-xs text-gray-500 mt-0.5">Qty: <span className="font-medium">{order.quantity}</span>{order.required_by&&` · Due: ${formatDate(order.required_by)}`}</p>{order.delivery_address&&<p className="text-xs text-gray-400 mt-0.5 line-clamp-1">📍 {order.delivery_address}</p>}<p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p></div></div>
              <Badge label={order.status.charAt(0).toUpperCase()+order.status.slice(1)} variant={STATUS_VARIANT[order.status]} dot/>
            </div>
            <div className="mt-3 flex items-center gap-1">{['pending','approved','dispatched','delivered'].map((s,i,arr)=><React.Fragment key={s}><div className={`flex items-center gap-1 text-xs ${['pending','approved','dispatched','delivered'].indexOf(order.status)>=i?'text-primary-600 font-medium':'text-gray-300'}`}><span className={`w-2 h-2 rounded-full ${['pending','approved','dispatched','delivered'].indexOf(order.status)>=i?'bg-primary-500':'bg-gray-200'}`}/><span className="hidden sm:inline capitalize">{s}</span></div>{i<arr.length-1&&<div className={`flex-1 h-px mx-1 ${['pending','approved','dispatched','delivered'].indexOf(order.status)>i?'bg-primary-400':'bg-gray-200'}`}/>}</React.Fragment>)}</div>
          </div>
        ))}</div>}
      <Modal open={modal} onClose={()=>setModal(false)} title="Place book order" size="sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="label">Order type *</label><select required className="input" value={form.order_type} onChange={e=>setForm(f=>({...f,order_type:e.target.value}))}><option value="full_set">Full book set</option><option value="short_course">Short course books</option><option value="practice">Practice books</option></select></div>
          <div><label className="label">Quantity *</label><input required type="number" min="1" className="input" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/></div>
          <div><label className="label">Delivery address</label><textarea rows={2} className="input resize-none" value={form.delivery_address} onChange={e=>setForm(f=>({...f,delivery_address:e.target.value}))}/></div>
          <div><label className="label">Required by</label><input type="date" className="input" value={form.required_by} onChange={e=>setForm(f=>({...f,required_by:e.target.value}))}/></div>
          <div><label className="label">Notes</label><input type="text" className="input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100"><button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving?'Placing…':'Place Order'}</button></div>
        </form>
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
