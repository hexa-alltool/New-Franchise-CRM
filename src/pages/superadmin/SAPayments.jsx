import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import KpiCard from '../../components/ui/KpiCard'
import { formatINR, formatDate } from '../../utils/helpers'
import { Plus, CreditCard, TrendingDown, AlertTriangle } from 'lucide-react'

export default function SAPayments() {
  const [payments,   setPayments]   = useState([])
  const [franchises, setFranchises] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState({ franchise_id:'',amount:'',payment_date:'',payment_mode:'bank_transfer',transaction_ref:'',notes:'' })
  const [saving,     setSaving]     = useState(false)

  useEffect(()=>{
    Promise.all([
      supabase.from('payments').select('*,franchise:franchises(name)').order('payment_date',{ascending:false}),
      supabase.from('franchises').select('id,name'),
    ]).then(([p,f])=>{ setPayments(p.data||[]); setFranchises(f.data||[]); setLoading(false) })
  },[])

  async function handleAdd(e){
    e.preventDefault(); setSaving(true)
    try {
      await supabase.from('payments').insert({...form,amount:parseFloat(form.amount)})
      const { data } = await supabase.from('payments').select('*,franchise:franchises(name)').order('payment_date',{ascending:false})
      setPayments(data||[]); setModal(false)
    } catch(e){ alert(e.message) } finally{ setSaving(false) }
  }

  const total = payments.reduce((s,p)=>s+(p.amount||0),0)
  const columns=[
    {key:'franchise',label:'Franchise',render:v=><span className="font-medium text-sm">{v?.name||'—'}</span>},
    {key:'amount',label:'Amount',render:v=><span className="font-semibold text-green-700">{formatINR(v)}</span>},
    {key:'payment_date',label:'Date',render:v=>formatDate(v)},
    {key:'payment_mode',label:'Mode',render:v=><Badge label={v?.replace('_',' ')} variant="info"/>},
    {key:'transaction_ref',label:'Ref',render:v=><span className="text-xs text-gray-400">{v||'—'}</span>},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Payments</h1>
        <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard label="Total revenue" value={formatINR(total)} icon={CreditCard} color="green"/>
        <KpiCard label="Transactions" value={payments.length} icon={AlertTriangle} color="blue"/>
      </div>
      <DataTable columns={columns} data={payments} loading={loading} searchKeys={['transaction_ref']} emptyText="Koi payment nahi"/>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Payment">
        <form onSubmit={handleAdd} className="space-y-3">
          <div><label className="label">Franchise *</label><select required className="input" value={form.franchise_id} onChange={e=>setForm(f=>({...f,franchise_id:e.target.value}))}><option value="">— Select —</option>{franchises.map(fr=><option key={fr.id} value={fr.id}>{fr.name}</option>)}</select></div>
          {[['Amount (₹) *','amount','number'],['Date *','payment_date','date'],['Ref','transaction_ref']].map(([lbl,name,type='text'])=>(
            <div key={name}><label className="label">{lbl}</label><input type={type} required={lbl.includes('*')} className="input" value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))}/></div>
          ))}
          <div><label className="label">Mode</label><select className="input" value={form.payment_mode} onChange={e=>setForm(f=>({...f,payment_mode:e.target.value}))}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="cheque">Cheque</option></select></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':'Add'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
