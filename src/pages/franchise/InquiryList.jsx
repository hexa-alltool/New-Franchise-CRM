import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import InquiryForm from './InquiryForm'
import { formatDate } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, UserCheck, Phone, Calendar, X } from 'lucide-react'

const STATUS_OPTIONS=['all','follow_up','highly_interested','not_interested','converted']
const STATUS_VARIANT={ follow_up:'warning',highly_interested:'active',not_interested:'expired',converted:'info' }
const STATUS_LABEL={ follow_up:'Follow up',highly_interested:'Hot lead',not_interested:'Not interested',converted:'Converted' }

export default function InquiryList() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [inquiries, setInquiries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState({ open:false, data:null })
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [toast,     setToast]     = useState('')
  const [saving,    setSaving]    = useState(false)
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  const fetchInquiries = useCallback(async()=>{
    if(!profile?.franchise_id) return
    setLoading(true)
    let q=supabase.from('inquiries').select('*').eq('franchise_id',profile.franchise_id).order('created_at',{ascending:false})
    if(filter!=='all') q=q.eq('lead_status',filter)
    const { data } = await q; setInquiries(data||[]); setLoading(false)
  },[profile?.franchise_id,filter])

  useEffect(()=>{ fetchInquiries() },[fetchInquiries])

  const displayed = inquiries.filter(i=>!search||i.child_name?.toLowerCase().includes(search.toLowerCase())||i.parent_name?.toLowerCase().includes(search.toLowerCase())||i.parent_mobile?.includes(search))

  async function handleSave(payload){
    setSaving(true)
    try {
      if(modal.data) await supabase.from('inquiries').update({...payload,updated_at:new Date().toISOString()}).eq('id',modal.data.id)
      else await supabase.from('inquiries').insert({...payload,franchise_id:profile.franchise_id})
      setModal({open:false,data:null}); await fetchInquiries(); showToast(modal.data?'Updated!':'Added!')
    } catch(e){alert(e.message)} finally{setSaving(false)}
  }

  async function updateStatus(id,lead_status){ await supabase.from('inquiries').update({lead_status,updated_at:new Date().toISOString()}).eq('id',id); await fetchInquiries() }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Inquiries</h1><p className="text-xs text-gray-400">{displayed.length} results</p></div>
        <button onClick={()=>setModal({open:true,data:null})} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or mobile…" className="input pl-8 text-sm"/>
          {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-3.5 h-3.5"/></button>}
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map(s=><button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter===s?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{s==='all'?'All':STATUS_LABEL[s]}</button>)}
        </div>
      </div>
      {loading ? <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="card p-4 animate-pulse"><div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-gray-100"/><div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/3"/><div className="h-2 bg-gray-100 rounded w-1/2"/></div></div></div>)}</div>
      : displayed.length===0 ? <div className="card p-10 text-center"><UserCheck className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">Koi inquiry nahi</p><button onClick={()=>setModal({open:true,data:null})} className="mt-3 text-xs text-primary-600 hover:underline">Pehli inquiry add karo</button></div>
      : <div className="space-y-2">{displayed.map(inq=>(
        <div key={inq.id} className="card p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">{(inq.child_name||'U').charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div><p className="font-semibold text-gray-900 text-sm">{inq.child_name}</p><p className="text-xs text-gray-500">{inq.parent_name} · Class {inq.child_class||'—'}</p></div>
                <Badge label={STATUS_LABEL[inq.lead_status]||inq.lead_status} variant={STATUS_VARIANT[inq.lead_status]||'gray'} dot/>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3"/>{inq.parent_mobile}</div>
                {inq.follow_up_date&&<div className="flex items-center gap-1 text-xs text-amber-600"><Calendar className="w-3 h-3"/>Follow up: {formatDate(inq.follow_up_date)}</div>}
                <div className="text-xs text-gray-400 capitalize">{inq.course_type} · {inq.lead_source?.replace('_',' ')}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <select value={inq.lead_status} onChange={e=>updateStatus(inq.id,e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
                  <option value="follow_up">Follow up</option><option value="highly_interested">Hot lead</option><option value="not_interested">Not interested</option><option value="converted">Converted</option>
                </select>
                <button onClick={()=>setModal({open:true,data:inq})} className="text-xs text-gray-500 hover:text-primary-600 px-2 py-1 rounded-lg hover:bg-gray-50 border border-gray-200">Edit</button>
                {inq.lead_status!=='converted'&&<button onClick={()=>navigate('/franchise/admissions',{state:{fromInquiry:inq}})} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg border border-green-200 font-medium"><UserCheck className="w-3 h-3"/>Convert to admission</button>}
                <span className="ml-auto text-xs text-gray-400">{formatDate(inq.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}</div>}
      <Modal open={modal.open} onClose={()=>setModal({open:false,data:null})} title={modal.data?'Edit Inquiry':'New Inquiry'} size="lg">
        <InquiryForm initial={modal.data} onSave={handleSave} onCancel={()=>setModal({open:false,data:null})} saving={saving}/>
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
