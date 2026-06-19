import React, { useState } from 'react'
import { useFranchises } from '../../hooks/useFranchise'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate, formatINR, daysUntil } from '../../utils/helpers'
import { Plus, Edit2, Trash2, ToggleLeft } from 'lucide-react'
import FranchiseForm from './FranchiseForm'

export default function FranchiseList() {
  const { franchises, loading, upsertFranchise, deleteFranchise, updateStatus } = useFranchises()
  const [modal,   setModal]   = useState({ open:false, mode:'add', data:null })
  const [confirm, setConfirm] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState('')

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(''),3000) }
  function statusVariant(s) { return {active:'active',expired:'expired',suspended:'suspended',pending:'pending'}[s]||'gray' }

  async function handleSave(payload) {
    setSaving(true)
    try { await upsertFranchise(payload, modal.data?.id); setModal({open:false,mode:'add',data:null}); showToast(modal.mode==='edit'?'Updated!':'Added!') }
    catch(e) { alert(e.message) } finally { setSaving(false) }
  }
  async function handleDelete(id) {
    try { await deleteFranchise(id); setConfirm(null); showToast('Deleted.') }
    catch(e) { alert(e.message) }
  }
  async function handleToggle(row) {
    const s = row.franchise_status==='active'?'suspended':'active'
    try { await updateStatus(row.id,s); showToast(`Franchise ${s}.`) }
    catch(e) { alert(e.message) }
  }

  const columns = [
    {key:'name',label:'Franchise',render:(v,row)=><div><p className="font-medium text-sm">{v}</p><p className="text-xs text-gray-400">{row.city}</p></div>},
    {key:'owner',label:'Owner',render:v=><div><p className="text-sm">{v?.name||'—'}</p><p className="text-xs text-gray-400">{v?.mobile||''}</p></div>},
    {key:'tenure_end',label:'Expires',render:v=>{const d=daysUntil(v);return <div><p className="text-sm">{formatDate(v)}</p>{d!==null&&<p className={`text-xs ${d<0?'text-red-500':d<=30?'text-amber-500':'text-gray-400'}`}>{d<0?`${Math.abs(d)}d ago`:`${d}d left`}</p>}</div>}},
    {key:'franchise_fee',label:'Fee',render:v=><span className="text-sm font-medium">{formatINR(v)}</span>},
    {key:'franchise_status',label:'Status',render:v=><Badge label={v?.charAt(0).toUpperCase()+v?.slice(1)} variant={statusVariant(v)} dot/>},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Franchises</h1><p className="text-xs text-gray-400 mt-0.5">{franchises.length} total</p></div>
        <button onClick={()=>setModal({open:true,mode:'add',data:null})} className="btn-primary flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> Add</button>
      </div>
      <DataTable columns={columns} data={franchises} loading={loading} searchKeys={['name','city']} emptyText="Koi franchise nahi"
        actions={row=>(
          <>
            <button onClick={()=>setModal({open:true,mode:'edit',data:row})} className="p-1.5 rounded text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5"/></button>
            <button onClick={()=>handleToggle(row)} className="p-1.5 rounded text-gray-400 hover:bg-amber-50 hover:text-amber-600"><ToggleLeft className="w-3.5 h-3.5"/></button>
            <button onClick={()=>setConfirm(row)} className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
          </>
        )}
      />
      <Modal open={modal.open} onClose={()=>setModal({open:false,mode:'add',data:null})} title={modal.mode==='edit'?'Edit Franchise':'Add Franchise'} size="lg">
        <FranchiseForm initial={modal.data} onSave={handleSave} onCancel={()=>setModal({open:false,mode:'add',data:null})} saving={saving}/>
      </Modal>
      {confirm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setConfirm(null)}/>
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete franchise?</h3>
            <p className="text-sm text-gray-500 mb-4">"{confirm.name}" permanently delete hoga.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={()=>handleDelete(confirm.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
