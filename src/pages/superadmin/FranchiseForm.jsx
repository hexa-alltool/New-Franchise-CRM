import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { name:'',city:'',state:'',address:'',pincode:'',mobile:'',email:'',tenure_start:'',tenure_end:'',franchise_fee:'',franchise_status:'active',admin_id:'' }

export default function FranchiseForm({ initial, onSave, onCancel, saving }) {
  const [form,   setForm]   = useState(EMPTY)
  const [admins, setAdmins] = useState([])

  useEffect(() => {
    if (initial) setForm({ name:initial.name||'',city:initial.city||'',state:initial.state||'',address:initial.address||'',pincode:initial.pincode||'',mobile:initial.mobile||'',email:initial.email||'',tenure_start:initial.tenure_start||'',tenure_end:initial.tenure_end||'',franchise_fee:initial.franchise_fee||'',franchise_status:initial.franchise_status||'active',admin_id:initial.admin_id||'' })
    else setForm(EMPTY)
  }, [initial])

  useEffect(() => { supabase.from('profiles').select('id,name').eq('role','admin').then(({data})=>setAdmins(data||[])) }, [])

  function onChange(e) { setForm(f=>({...f,[e.target.name]:e.target.value})) }
  function handleSubmit(e) { e.preventDefault(); const p={...form,franchise_fee:parseFloat(form.franchise_fee)||0}; if(!p.admin_id) delete p.admin_id; onSave(p) }
  const field=(label,name,type='text',opts={})=><div><label className="label">{label}</label><input type={type} name={name} value={form[name]} onChange={onChange} className="input" {...opts}/></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('Franchise name *','name','text',{required:true,placeholder:'e.g. Mathify Surat'})}
        {field('City *','city','text',{required:true})}
        {field('State','state')} {field('Pincode','pincode')}
        {field('Mobile','mobile','tel')} {field('Email','email','email')}
        {field('Tenure start *','tenure_start','date',{required:true})}
        {field('Tenure end *','tenure_end','date',{required:true})}
        {field('Franchise fee (₹)','franchise_fee','number',{placeholder:'12000',min:0})}
        <div><label className="label">Status</label><select name="franchise_status" value={form.franchise_status} onChange={onChange} className="input"><option value="active">Active</option><option value="suspended">Suspended</option><option value="expired">Expired</option><option value="pending">Pending</option></select></div>
        <div className="sm:col-span-2"><label className="label">Assign admin</label><select name="admin_id" value={form.admin_id} onChange={onChange} className="input"><option value="">— Select admin —</option>{admins.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label">Address</label><textarea name="address" value={form.address} onChange={onChange} className="input resize-none" rows={2}/></div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':initial?'Update':'Add Franchise'}</button>
      </div>
    </form>
  )
}
