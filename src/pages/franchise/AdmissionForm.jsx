import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { child_name:'',child_dob:'',child_class:'',school_name:'',parent_name:'',parent_mobile:'',parent_email:'',address:'',city:'',emergency_contact:'',course_type:'full',total_fees:'',initial_payment:'',admission_date:new Date().toISOString().split('T')[0],remarks:'' }

export default function AdmissionForm({ initial, fromInquiry, onSave, onCancel, saving }) {
  const [form,      setForm]      = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [photoUrl,  setPhotoUrl]  = useState('')

  useEffect(()=>{
    if(initial) setForm({child_name:initial.child_name||'',child_dob:initial.child_dob||'',child_class:initial.class_grade||'',school_name:initial.school_name||'',parent_name:initial.parent_name||'',parent_mobile:initial.parent_mobile||'',parent_email:initial.parent_email||'',address:initial.address||'',city:initial.city||'',emergency_contact:initial.emergency_contact||'',course_type:initial.course_type||'full',total_fees:initial.total_fees||'',initial_payment:initial.paid_fees||'',admission_date:initial.admission_date||new Date().toISOString().split('T')[0],remarks:initial.remarks||''})
    else if(fromInquiry) setForm(f=>({...f,child_name:fromInquiry.child_name||'',child_class:fromInquiry.child_class||'',school_name:fromInquiry.school_name||'',parent_name:fromInquiry.parent_name||'',parent_mobile:fromInquiry.parent_mobile||'',parent_email:fromInquiry.parent_email||'',city:fromInquiry.city||'',address:fromInquiry.address||'',course_type:fromInquiry.course_type||'full'}))
    else { setForm(EMPTY); setPhotoUrl('') }
    if(initial?.child_photo_url) setPhotoUrl(initial.child_photo_url)
  },[initial,fromInquiry])

  async function handlePhotoUpload(e){
    const file=e.target.files[0]; if(!file) return; setUploading(true)
    const path=`student-photos/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('crm-resources').upload(path,file)
    if(error){ alert(error.message); setUploading(false); return }
    const { data } = supabase.storage.from('crm-resources').getPublicUrl(path)
    setPhotoUrl(data.publicUrl); setUploading(false)
  }

  function handleSubmit(e){
    e.preventDefault()
    onSave({ child_name:form.child_name, child_dob:form.child_dob||null, class_grade:form.child_class, school_name:form.school_name, parent_name:form.parent_name, parent_mobile:form.parent_mobile, parent_email:form.parent_email||null, address:form.address, city:form.city, emergency_contact:form.emergency_contact||null, course_type:form.course_type, total_fees:parseFloat(form.total_fees)||0, initial_payment:parseFloat(form.initial_payment)||0, paid_fees:parseFloat(form.initial_payment)||0, admission_date:form.admission_date, remarks:form.remarks||null, child_photo_url:photoUrl||null, inquiry_id:fromInquiry?.id||null })
  }

  const field=(label,name,type='text',opts={})=><div><label className="label">{label}</label><input type={type} name={name} value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))} className="input" {...opts}/></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fromInquiry&&<div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-xs font-medium text-green-700">Converting: <span className="font-bold">{fromInquiry.child_name}</span> — details pre-filled</p></div>}
      {!initial&&<div className="bg-blue-50 border border-blue-100 rounded-lg p-3"><p className="text-xs text-blue-700">Student ID auto-generate hoga: <span className="font-mono font-semibold">VM-2025-XXXX</span></p></div>}
      <div><label className="label">Student photo</label><div className="flex items-center gap-3">{photoUrl?<img src={photoUrl} alt="Student" className="w-14 h-14 rounded-xl object-cover border border-gray-200"/>:<div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">{(form.child_name||'?').charAt(0).toUpperCase()}</div>}<div><input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-xs file:bg-white"/>{uploading&&<p className="text-xs text-gray-400 mt-0.5">Uploading…</p>}</div></div></div>
      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Child details</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{field('Child name *','child_name','text',{required:true})}{field('Date of birth','child_dob','date')}{field('Class','child_class','text',{placeholder:'4th'})}{field('School','school_name','text')}</div></div>
      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Parent details</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{field('Parent name *','parent_name','text',{required:true})}{field('Mobile *','parent_mobile','tel',{required:true})}{field('Email','parent_email','email')}{field('Emergency contact','emergency_contact','tel')}{field('City','city','text')}<div className="sm:col-span-2"><label className="label">Address</label><textarea name="address" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className="input resize-none" rows={2}/></div></div></div>
      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Course &amp; fees</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="label">Course type</label><select name="course_type" value={form.course_type} onChange={e=>setForm(f=>({...f,course_type:e.target.value}))} className="input"><option value="full">Full course</option><option value="short">Short course</option></select></div>{field('Admission date','admission_date','date')}{field('Total fees (₹) *','total_fees','number',{required:true,placeholder:'6000',min:0})}{field('Amount paid now (₹)','initial_payment','number',{placeholder:'3000',min:0})}<div className="sm:col-span-2"><label className="label">Remarks</label><textarea name="remarks" value={form.remarks} onChange={e=>setForm(f=>({...f,remarks:e.target.value}))} className="input resize-none" rows={2}/></div></div></div>
      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button type="submit" disabled={saving||uploading} className="btn-primary">{saving?'Saving…':initial?'Update':'Admit Student'}</button></div>
    </form>
  )
}
