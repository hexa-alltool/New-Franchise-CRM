import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import { formatINR, formatDate } from '../../utils/helpers'
import { useLocation } from 'react-router-dom'
import { DollarSign, Plus, ChevronDown, ChevronUp } from 'lucide-react'

export default function FeeManagement() {
  const { profile } = useAuth()
  const location    = useLocation()
  const [students,  setStudents]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState(null)
  const [history,   setHistory]   = useState({})
  const [payModal,  setPayModal]  = useState(null)
  const [payForm,   setPayForm]   = useState({ amount:'',payment_date:new Date().toISOString().split('T')[0],payment_mode:'cash',receipt_no:'' })
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState('')
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  const fetchStudents = useCallback(async()=>{
    if(!profile?.franchise_id) return; setLoading(true)
    const { data } = await supabase.from('admissions').select('id,student_id,child_name,parent_name,parent_mobile,course_type,total_fees,paid_fees,admission_date').eq('franchise_id',profile.franchise_id).order('admission_date',{ascending:false})
    setStudents(data||[]); setLoading(false)
  },[profile?.franchise_id])

  useEffect(()=>{ fetchStudents() },[fetchStudents])
  useEffect(()=>{ if(location.state?.studentId){ setExpanded(location.state.studentId); loadHistory(location.state.studentId); window.history.replaceState({},'')} },[location.state])

  async function loadHistory(admissionId){
    if(history[admissionId]){setExpanded(admissionId);return}
    const { data } = await supabase.from('fee_payments').select('*').eq('admission_id',admissionId).order('payment_date',{ascending:false})
    setHistory(h=>({...h,[admissionId]:data||[]})); setExpanded(admissionId)
  }

  async function handlePayment(e){
    e.preventDefault(); if(!payModal) return; setSaving(true)
    try {
      const amount=parseFloat(payForm.amount); const due=(payModal.total_fees||0)-(payModal.paid_fees||0)
      if(!amount||amount<=0) throw new Error('Valid amount daalein')
      if(amount>due) throw new Error(`Max ${formatINR(due)}`)
      await supabase.from('fee_payments').insert({admission_id:payModal.id,franchise_id:profile.franchise_id,amount,payment_date:payForm.payment_date,payment_mode:payForm.payment_mode,receipt_no:payForm.receipt_no||null})
      await supabase.from('admissions').update({paid_fees:(payModal.paid_fees||0)+amount}).eq('id',payModal.id)
      setHistory(h=>({...h,[payModal.id]:null})); await fetchStudents(); setPayModal(null); setPayForm({amount:'',payment_date:new Date().toISOString().split('T')[0],payment_mode:'cash',receipt_no:''}); showToast(`Payment recorded!`)
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  const totalFees=students.reduce((s,a)=>s+(a.total_fees||0),0), paidFees=students.reduce((s,a)=>s+(a.paid_fees||0),0), dueFees=totalFees-paidFees, collRate=totalFees>0?Math.round((paidFees/totalFees)*100):0

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary-500"/><h1 className="page-title">Fee management</h1></div>
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center"><p className="text-xs text-gray-400 mb-1">Total fees</p><p className="text-lg font-bold text-gray-900">{formatINR(totalFees)}</p></div>
        <div className="card p-4 text-center"><p className="text-xs text-gray-400 mb-1">Collected</p><p className="text-lg font-bold text-green-600">{formatINR(paidFees)}</p></div>
        <div className="card p-4 text-center"><p className="text-xs text-gray-400 mb-1">Outstanding</p><p className="text-lg font-bold text-red-500">{formatINR(dueFees)}</p></div>
      </div>
      <div className="card p-4"><div className="flex justify-between text-xs text-gray-500 mb-2"><span>Collection rate</span><span className="font-semibold text-gray-900">{collRate}%</span></div><div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${collRate>=90?'bg-green-500':collRate>=60?'bg-amber-400':'bg-red-400'}`} style={{width:`${collRate}%`}}/></div></div>
      {loading ? <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="card p-4 animate-pulse"><div className="h-3 bg-gray-100 rounded w-1/3 mb-2"/><div className="h-2 bg-gray-100 rounded w-1/2"/></div>)}</div>
      : students.length===0 ? <div className="card p-10 text-center"><p className="text-sm text-gray-400">Koi student nahi — pehle admission karo</p></div>
      : <div className="space-y-2">{students.map(student=>{
          const due=(student.total_fees||0)-(student.paid_fees||0), pct=student.total_fees>0?Math.round((student.paid_fees/student.total_fees)*100):0, isExp=expanded===student.id
          return (
            <div key={student.id} className="card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">{(student.child_name||'U').charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div><p className="font-semibold text-sm text-gray-900">{student.child_name}</p><p className="text-xs font-mono text-gray-400">{student.student_id}</p></div>
                      <div className="text-right"><p className={`text-sm font-bold ${due>0?'text-red-500':'text-green-600'}`}>{due>0?`Due: ${formatINR(due)}`:'✓ Clear'}</p><p className="text-xs text-gray-400">{formatINR(student.paid_fees)} / {formatINR(student.total_fees)}</p></div>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct===100?'bg-green-500':pct>50?'bg-amber-400':'bg-red-400'}`} style={{width:`${pct}%`}}/></div>
                    <div className="flex items-center gap-2 mt-2.5">
                      {due>0&&<button onClick={()=>setPayModal(student)} className="flex items-center gap-1 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 font-medium"><Plus className="w-3 h-3"/> Add payment</button>}
                      <button onClick={()=>isExp?setExpanded(null):loadHistory(student.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200">History{isExp?<ChevronUp className="w-3 h-3"/>:<ChevronDown className="w-3 h-3"/>}</button>
                    </div>
                  </div>
                </div>
              </div>
              {isExp&&history[student.id]!==undefined&&(
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment history</p>
                  {history[student.id]===null?<p className="text-xs text-gray-400">Loading…</p>:history[student.id].length===0?<p className="text-xs text-gray-400">No payments yet</p>:history[student.id].map(p=>(
                    <div key={p.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100 mb-2 last:mb-0">
                      <div><p className="text-sm font-semibold text-green-700">{formatINR(p.amount)}</p><p className="text-xs text-gray-400 capitalize">{p.payment_mode} · {formatDate(p.payment_date)}</p></div>
                      {p.receipt_no&&<span className="text-xs font-mono text-gray-400">#{p.receipt_no}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}</div>}
      <Modal open={!!payModal} onClose={()=>setPayModal(null)} title="Record payment" size="sm">
        {payModal&&<form onSubmit={handlePayment} className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-3"><p className="text-sm font-semibold">{payModal.child_name}</p><p className="text-xs text-gray-500">Outstanding: <span className="font-bold text-red-600">{formatINR((payModal.total_fees||0)-(payModal.paid_fees||0))}</span></p></div>
          <div><label className="label">Amount (₹) *</label><input required type="number" className="input" placeholder="2000" min="1" max={(payModal.total_fees||0)-(payModal.paid_fees||0)} value={payForm.amount} onChange={e=>setPayForm(f=>({...f,amount:e.target.value}))}/></div>
          <div><label className="label">Date</label><input type="date" className="input" value={payForm.payment_date} onChange={e=>setPayForm(f=>({...f,payment_date:e.target.value}))}/></div>
          <div><label className="label">Mode</label><select className="input" value={payForm.payment_mode} onChange={e=>setPayForm(f=>({...f,payment_mode:e.target.value}))}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option><option value="cheque">Cheque</option></select></div>
          <div><label className="label">Receipt no.</label><input type="text" className="input" placeholder="Optional" value={payForm.receipt_no} onChange={e=>setPayForm(f=>({...f,receipt_no:e.target.value}))}/></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100"><button type="button" onClick={()=>setPayModal(null)} className="btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving?'Recording…':'Record Payment'}</button></div>
        </form>}
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
