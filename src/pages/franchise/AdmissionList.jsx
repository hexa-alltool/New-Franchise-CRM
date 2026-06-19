import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import AdmissionForm from './AdmissionForm'
import { formatDate, formatINR } from '../../utils/helpers'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Search, GraduationCap, Phone, X } from 'lucide-react'

export default function AdmissionList() {
  const { profile }  = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const [admissions, setAdmissions] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editData,   setEditData]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState('')
  const [fromInquiry,setFromInquiry]= useState(null)
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  useEffect(()=>{ if(location.state?.fromInquiry){ setFromInquiry(location.state.fromInquiry); setModal(true); window.history.replaceState({},'')} },[location.state])

  const fetchAdmissions = useCallback(async()=>{
    if(!profile?.franchise_id) return; setLoading(true)
    const { data } = await supabase.from('admissions').select('*').eq('franchise_id',profile.franchise_id).order('created_at',{ascending:false})
    setAdmissions(data||[]); setLoading(false)
  },[profile?.franchise_id])

  useEffect(()=>{ fetchAdmissions() },[fetchAdmissions])

  const displayed = admissions.filter(a=>!search||a.child_name?.toLowerCase().includes(search.toLowerCase())||a.student_id?.toLowerCase().includes(search.toLowerCase())||a.parent_mobile?.includes(search))

  async function handleSave(payload){
    setSaving(true)
    try {
      if(editData){ await supabase.from('admissions').update(payload).eq('id',editData.id); showToast('Updated!') }
      else {
        const { count } = await supabase.from('admissions').select('*',{count:'exact',head:true}).eq('franchise_id',profile.franchise_id)
        const student_id=`VM-${new Date().getFullYear()}-${String((count||0)+1).padStart(4,'0')}`
        await supabase.from('admissions').insert({...payload,franchise_id:profile.franchise_id,student_id,paid_fees:payload.initial_payment||0})
        if(fromInquiry?.id) await supabase.from('inquiries').update({lead_status:'converted',updated_at:new Date().toISOString()}).eq('id',fromInquiry.id)
        showToast(`Admission done! ID: ${student_id}`)
      }
      setModal(false); setEditData(null); setFromInquiry(null); await fetchAdmissions()
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Admissions</h1><p className="text-xs text-gray-400">{admissions.length} students</p></div>
        <button onClick={()=>{setEditData(null);setFromInquiry(null);setModal(true)}} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add</button>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, ID or mobile…" className="input pl-8 text-sm"/>{search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-3.5 h-3.5"/></button>}</div>
      {loading ? <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="card p-4 animate-pulse"><div className="flex gap-3"><div className="w-12 h-12 rounded-xl bg-gray-100"/><div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/3"/><div className="h-2 bg-gray-100 rounded w-1/2"/></div></div></div>)}</div>
      : displayed.length===0 ? <div className="card p-10 text-center"><GraduationCap className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">Koi admission nahi</p></div>
      : <div className="space-y-2">{displayed.map(adm=>{
          const due=(adm.total_fees||0)-(adm.paid_fees||0)
          const pct=adm.total_fees>0?Math.round((adm.paid_fees/adm.total_fees)*100):0
          return (
            <div key={adm.id} className="card p-4">
              <div className="flex items-start gap-3">
                {adm.child_photo_url?<img src={adm.child_photo_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"/>:<div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-bold flex-shrink-0">{(adm.child_name||'U').charAt(0).toUpperCase()}</div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div><p className="font-semibold text-sm text-gray-900">{adm.child_name}</p><p className="text-xs text-gray-400 font-mono">{adm.student_id}</p></div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${due>0?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>{due>0?`Due: ${formatINR(due)}`:'Fees clear'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    <p className="text-xs text-gray-500">{adm.parent_name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3"/>{adm.parent_mobile}</div>
                    <p className="text-xs text-gray-400 capitalize">{adm.course_type} · Class {adm.class_grade||'—'}</p>
                  </div>
                  <div className="mt-2"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Fees paid</span><span>{formatINR(adm.paid_fees)} / {formatINR(adm.total_fees)} ({pct}%)</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct===100?'bg-green-500':pct>50?'bg-amber-400':'bg-red-400'}`} style={{width:`${pct}%`}}/></div></div>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    <button onClick={()=>{setEditData(adm);setModal(true)}} className="text-xs text-gray-500 hover:text-primary-600 px-2 py-1 rounded-lg hover:bg-gray-50 border border-gray-200">Edit</button>
                    <button onClick={()=>navigate('/franchise/fees',{state:{studentId:adm.id}})} className="text-xs text-primary-600 px-2 py-1 rounded-lg bg-primary-50 border border-primary-200">Manage fees</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}</div>}
      <Modal open={modal} onClose={()=>{setModal(false);setEditData(null);setFromInquiry(null)}} title={editData?'Edit Admission':'New Admission'} size="lg">
        <AdmissionForm initial={editData} fromInquiry={fromInquiry} onSave={handleSave} onCancel={()=>{setModal(false);setEditData(null);setFromInquiry(null)}} saving={saving}/>
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
