import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../utils/helpers'
import { Plus, Edit2 } from 'lucide-react'

export default function AdminUsers() {
  const [admins,  setAdmins]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState({ open:false, data:null })
  const [form,    setForm]    = useState({ name:'',email:'',mobile:'',city:'',status:'active' })
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState('')

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  useEffect(()=>{ fetchAdmins() },[])
  async function fetchAdmins(){
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role','admin').order('created_at',{ascending:false})
    setAdmins(data||[]); setLoading(false)
  }

  function openModal(admin=null){
    setForm(admin?{name:admin.name,email:admin.email,mobile:admin.mobile||'',city:admin.city||'',status:admin.status}:{name:'',email:'',mobile:'',city:'',status:'active'})
    setModal({open:true,data:admin})
  }

  async function handleSave(e){
    e.preventDefault(); setSaving(true)
    try {
      if(modal.data) await supabase.from('profiles').update({...form}).eq('id',modal.data.id)
      else {
        const { data:au, error } = await supabase.auth.admin.inviteUserByEmail(form.email)
        if(error) throw error
        await supabase.from('profiles').insert({id:au.user.id,...form,role:'admin'})
      }
      await fetchAdmins(); setModal({open:false,data:null}); showToast('Saved!')
    } catch(e){ alert(e.message) } finally{ setSaving(false) }
  }

  const columns=[
    {key:'name',label:'Name',render:(v,row)=><div><p className="font-medium text-sm">{v}</p><p className="text-xs text-gray-400">{row.email}</p></div>},
    {key:'mobile',label:'Mobile'},{key:'city',label:'City'},
    {key:'status',label:'Status',render:v=><Badge label={v} variant={v==='active'?'active':'suspended'} dot/>},
    {key:'created_at',label:'Added',render:v=><span className="text-xs text-gray-400">{formatDate(v)}</span>},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Admin users</h1><p className="text-xs text-gray-400">{admins.length} admins</p></div>
        <button onClick={()=>openModal()} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add admin</button>
      </div>
      <DataTable columns={columns} data={admins} loading={loading} searchKeys={['name','email','city']}
        actions={row=><button onClick={()=>openModal(row)} className="p-1.5 rounded text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5"/></button>}
      />
      <Modal open={modal.open} onClose={()=>setModal({open:false,data:null})} title={modal.data?'Edit Admin':'Add Admin'}>
        <form onSubmit={handleSave} className="space-y-3">
          {[['Name *','name'],['Email *','email','email'],['Mobile','mobile','tel'],['City','city']].map(([lbl,name,type='text'])=>(
            <div key={name}><label className="label">{lbl}</label><input type={type} required={lbl.includes('*')} className="input" value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))}/></div>
          ))}
          <div><label className="label">Status</label><select className="input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="active">Active</option><option value="suspended">Suspended</option></select></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal({open:false,data:null})} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':modal.data?'Update':'Add'}</button>
          </div>
        </form>
      </Modal>
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
