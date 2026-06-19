import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useFranchises } from '../../hooks/useFranchise'
import { supabase } from '../../lib/supabase'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import FranchiseForm from '../superadmin/FranchiseForm'
import { formatDate, formatINR, daysUntil } from '../../utils/helpers'
import { Plus, Edit2, RotateCcw, Bell, CreditCard, ChevronDown, ChevronUp, X } from 'lucide-react'

export default function AdminFranchise() {
  const { profile } = useAuth()
  const { franchises, loading, upsertFranchise } = useFranchises(profile?.id)
  const [addModal,   setAddModal]   = useState(false)
  const [editData,   setEditData]   = useState(null)
  const [renewModal, setRenewModal] = useState(null)
  const [payModal,   setPayModal]   = useState(null)
  const [renewForm,  setRenewForm]  = useState({ tenure_end:'',franchise_fee:'' })
  const [payForm,    setPayForm]    = useState({ amount:'',payment_date:'',payment_mode:'bank_transfer',transaction_ref:'' })
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState('')
  const [expanded,   setExpanded]   = useState(null)
  const [payments,   setPayments]   = useState({})

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  async function loadPayments(fid){
    if(payments[fid]){setExpanded(fid);return}
    const { data } = await supabase.from('payments').select('*').eq('franchise_id',fid).order('payment_date',{ascending:false}).limit(10)
    setPayments(p=>({...p,[fid]:data||[]})); setExpanded(fid)
  }

  async function handleSave(payload){ setSaving(true); try { await upsertFranchise({...payload,admin_id:profile.id},editData?.id); setAddModal(false);setEditData(null);showToast('Saved!') } catch(e){alert(e.message)} finally{setSaving(false)} }

  async function handleRenew(e){
    e.preventDefault(); setSaving(true)
    try {
      await supabase.from('franchises').update({tenure_end:renewForm.tenure_end,franchise_status:'active',updated_at:new Date().toISOString()}).eq('id',renewModal.id)
      await supabase.from('profiles').update({franchise_status:'active'}).eq('franchise_id',renewModal.id)
      if(renewForm.franchise_fee) await supabase.from('payments').insert({franchise_id:renewModal.id,amount:parseFloat(renewForm.franchise_fee),payment_date:new Date().toISOString().split('T')[0],payment_mode:'bank_transfer',notes:'Renewal',created_by:profile.id})
      setRenewModal(null);showToast('Renewed!')
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  async function handleAddPayment(e){
    e.preventDefault(); setSaving(true)
    try {
      await supabase.from('payments').insert({franchise_id:payModal.id,amount:parseFloat(payForm.amount),payment_date:payForm.payment_date,payment_mode:payForm.payment_mode,transaction_ref:payForm.transaction_ref,created_by:profile.id})
      setPayments(p=>({...p,[payModal.id]:null})); setPayModal(null); showToast('Payment recorded!')
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  async function sendReminder(franchise){
    if(franchise.owner_id) await supabase.from('notifications').insert({user_id:franchise.owner_id,title:'Payment reminder',message:`Dear ${franchise.name}, your franchise payment is due.`,type:'payment'})
    showToast('Reminder sent!')
  }

  const statusVariant=s=>({active:'active',expired:'expired',suspended:'suspended',pending:'pending'}[s]||'gray')
  const columns=[
    {key:'name',label:'Franchise',render:(v,row)=><div><p className="font-medium text-sm">{v}</p><p className="text-xs text-gray-400">{row.city}</p></div>},
    {key:'tenure_end',label:'Expires',render:v=>{const d=daysUntil(v);return <div><p className="text-sm">{formatDate(v)}</p>{d!==null&&<p className={`text-xs ${d<0?'text-red-500':d<=30?'text-amber-500':'text-gray-400'}`}>{d<0?`Expired ${Math.abs(d)}d ago`:`${d}d left`}</p>}</div>}},
    {key:'franchise_fee',label:'Fee',render:v=><span className="text-sm font-medium">{formatINR(v)}</span>},
    {key:'franchise_status',label:'Status',render:v=><Badge label={v?.charAt(0).toUpperCase()+v?.slice(1)} variant={statusVariant(v)} dot/>},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Franchises</h1><p className="text-xs text-gray-400">{franchises.length} in your zone</p></div>
        <button onClick={()=>setAddModal(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add</button>
      </div>
      <DataTable columns={columns} data={franchises} loading={loading} searchKeys={['name','city']} emptyText="Koi franchise nahi"
        actions={row=>(
          <>
            <button onClick={()=>{setEditData(row);setAddModal(true)}} className="p-1.5 rounded text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5"/></button>
            <button onClick={()=>{setRenewModal(row);setRenewForm({tenure_end:'',franchise_fee:String(row.franchise_fee||'')})}} className="p-1.5 rounded text-gray-400 hover:bg-green-50 hover:text-green-600"><RotateCcw className="w-3.5 h-3.5"/></button>
            <button onClick={()=>{setPayModal(row);setPayForm({amount:'',payment_date:new Date().toISOString().split('T')[0],payment_mode:'bank_transfer',transaction_ref:''})}} className="p-1.5 rounded text-gray-400 hover:bg-purple-50 hover:text-purple-600"><CreditCard className="w-3.5 h-3.5"/></button>
            <button onClick={()=>sendReminder(row)} className="p-1.5 rounded text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Bell className="w-3.5 h-3.5"/></button>
            <button onClick={()=>expanded===row.id?setExpanded(null):loadPayments(row.id)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100">{expanded===row.id?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}</button>
          </>
        )}
      />
      {expanded&&payments[expanded]&&(
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold">Payment history</p><button onClick={()=>setExpanded(null)}><X className="w-4 h-4 text-gray-400"/></button></div>
          {payments[expanded].length===0?<p className="text-xs text-gray-400 text-center py-4">No payments</p>:payments[expanded].map(p=>(
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div><p className="text-sm font-medium">{formatINR(p.amount)}</p><p className="text-xs text-gray-400 capitalize">{p.payment_mode?.replace('_',' ')} · {formatDate(p.payment_date)}</p></div>
              {p.transaction_ref&&<span className="text-xs text-gray-400 font-mono">{p.transaction_ref}</span>}
            </div>
          ))}
        </div>
      )}
      <Modal open={addModal} onClose={()=>{setAddModal(false);setEditData(null)}} title={editData?'Edit Franchise':'Add Franchise'} size="lg">
        <FranchiseForm initial={editData} onSave={handleSave} onCancel={()=>{setAddModal(false);setEditData(null)}} saving={saving}/>
      </Modal>
      <Modal open={!!renewModal} onClose={()=>setRenewModal(null)} title="Renew franchise" size="sm">
        {renewModal&&<form onSubmit={handleRenew} className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-sm font-medium">{renewModal.name}</p><p className="text-xs text-gray-500">Current: {formatDate(renewModal.tenure_end)}</p></div>
          <div><label className="label">New expiry date *</label><input required type="date" className="input" value={renewForm.tenure_end} onChange={e=>setRenewForm(f=>({...f,tenure_end:e.target.value}))}/></div>
          <div><label className="label">Renewal fee (₹)</label><input type="number" className="input" value={renewForm.franchise_fee} onChange={e=>setRenewForm(f=>({...f,franchise_fee:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100"><button type="button" onClick={()=>setRenewModal(null)} className="btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving?'Renewing…':'Renew'}</button></div>
        </form>}
      </Modal>
      <Modal open={!!payModal} onClose={()=>setPayModal(null)} title="Add payment" size="sm">
        {payModal&&<form onSubmit={handleAddPayment} className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-sm font-medium">{payModal.name}</p></div>
          <div><label className="label">Amount (₹) *</label><input required type="number" className="input" value={payForm.amount} onChange={e=>setPayForm(f=>({...f,amount:e.target.value}))}/></div>
          <div><label className="label">Date *</label><input required type="date" className="input" value={payForm.payment_date} onChange={e=>setPayForm(f=>({...f,payment_date:e.target.value}))}/></div>
          <div><label className="label">Mode</label><select className="input" value={payForm.payment_mode} onChange={e=>setPayForm(f=>({...f,payment_mode:e.target.value}))}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="cheque">Cheque</option></select></div>
          <div><label className="label">Ref</label><input type="text" className="input" value={payForm.transaction_ref} onChange={e=>setPayForm(f=>({...f,transaction_ref:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100"><button type="button" onClick={()=>setPayModal(null)} className="btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':'Add'}</button></div>
        </form>}
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
