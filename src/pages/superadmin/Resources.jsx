import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { Plus, FileText, Video, BookOpen, Trash2, ToggleLeft } from 'lucide-react'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState({ title:'',description:'',type:'pdf',file_url:'',access_all:true })
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(()=>{ fetchResources() },[])
  async function fetchResources(){ setLoading(true); const { data } = await supabase.from('resources').select('*').order('created_at',{ascending:false}); setResources(data||[]); setLoading(false) }

  async function handleUpload(e){
    const file=e.target.files[0]; if(!file) return; setUploading(true)
    const path=`resources/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('crm-resources').upload(path,file)
    if(error){ alert(error.message); setUploading(false); return }
    const { data } = supabase.storage.from('crm-resources').getPublicUrl(path)
    setForm(f=>({...f,file_url:data.publicUrl})); setUploading(false)
  }

  async function handleSave(e){
    e.preventDefault(); setSaving(true)
    try { await supabase.from('resources').insert(form); await fetchResources(); setModal(false); setForm({title:'',description:'',type:'pdf',file_url:'',access_all:true}) }
    catch(e){ alert(e.message) } finally{ setSaving(false) }
  }

  async function toggleActive(id,current){ await supabase.from('resources').update({is_active:!current}).eq('id',id); await fetchResources() }
  async function handleDelete(id){ if(!confirm('Delete?')) return; await supabase.from('resources').delete().eq('id',id); await fetchResources() }

  const typeIcon = { video:Video, pdf:FileText, ppt:BookOpen }
  const typeBg   = { video:'bg-red-100 text-red-600', pdf:'bg-blue-100 text-blue-600', ppt:'bg-orange-100 text-orange-600' }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Learning resources</h1>
        <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Upload</button>
      </div>
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(6)].map((_,i)=><div key={i} className="card p-4 h-24 animate-pulse bg-gray-100"/>)}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.map(r=>{
            const Icon=typeIcon[r.type]||FileText
            return (
              <div key={r.id} className={`card p-4 ${!r.is_active?'opacity-50':''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeBg[r.type]||typeBg.pdf}`}><Icon className="w-4 h-4"/></div>
                    <Badge label={r.type.toUpperCase()} variant={r.type==='video'?'danger':r.type==='ppt'?'warning':'info'}/>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>toggleActive(r.id,r.is_active)} className="p-1 text-gray-400 hover:text-amber-500 rounded"><ToggleLeft className="w-3.5 h-3.5"/></button>
                    <button onClick={()=>handleDelete(r.id)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                {r.description&&<p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={r.access_all?'All franchises':'Selected'} variant={r.access_all?'active':'warning'}/>
                  {r.file_url&&<a href={r.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline ml-auto">View →</a>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Upload resource">
        <form onSubmit={handleSave} className="space-y-3">
          <div><label className="label">Title *</label><input required className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><label className="label">Type</label><select className="input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}><option value="pdf">PDF</option><option value="video">Video</option><option value="ppt">PPT</option></select></div>
          <div><label className="label">Upload file</label><input type="file" className="input py-1.5 text-xs" onChange={handleUpload} accept=".pdf,.ppt,.pptx,.mp4,.mov"/>{uploading&&<p className="text-xs text-gray-400 mt-1">Uploading…</p>}{form.file_url&&<p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}</div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="ac" checked={form.access_all} onChange={e=>setForm(f=>({...f,access_all:e.target.checked}))}/><label htmlFor="ac" className="text-sm text-gray-700">All franchises ko access</label></div>
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving||uploading} className="btn-primary">{saving?'Saving…':'Upload'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
