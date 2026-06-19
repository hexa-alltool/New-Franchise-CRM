import React, { useState, useEffect } from 'react'

const EMPTY = { child_name:'',child_age:'',child_class:'',school_name:'',parent_name:'',parent_mobile:'',parent_email:'',city:'',address:'',course_type:'full',lead_source:'walk_in',lead_status:'follow_up',follow_up_date:'',notes:'' }

export default function InquiryForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY)
  useEffect(()=>{ if(initial) setForm({child_name:initial.child_name||'',child_age:initial.child_age||'',child_class:initial.child_class||'',school_name:initial.school_name||'',parent_name:initial.parent_name||'',parent_mobile:initial.parent_mobile||'',parent_email:initial.parent_email||'',city:initial.city||'',address:initial.address||'',course_type:initial.course_type||'full',lead_source:initial.lead_source||'walk_in',lead_status:initial.lead_status||'follow_up',follow_up_date:initial.follow_up_date||'',notes:initial.notes||''}); else setForm(EMPTY) },[initial])
  function onChange(e){setForm(f=>({...f,[e.target.name]:e.target.value}))}
  function handleSubmit(e){e.preventDefault();onSave({...form,child_age:form.child_age?parseInt(form.child_age):null})}
  const field=(label,name,type='text',opts={})=><div><label className="label">{label}</label><input type={type} name={name} value={form[name]} onChange={onChange} className="input" {...opts}/></div>
  const select=(label,name,options)=><div><label className="label">{label}</label><select name={name} value={form[name]} onChange={onChange} className="input">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Child details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field('Child name *','child_name','text',{required:true,placeholder:'e.g. Aarav Patel'})}
          {field('Age','child_age','number',{placeholder:'9',min:3,max:18})}
          {field('Class','child_class','text',{placeholder:'4th'})}
          {field('School','school_name','text')}
        </div>
      </div>
      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Parent / contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field('Parent name *','parent_name','text',{required:true})}
          {field('Mobile *','parent_mobile','tel',{required:true,placeholder:'+91 9876543210'})}
          {field('Email','parent_email','email')}
          {field('City','city','text')}
          <div className="sm:col-span-2"><label className="label">Address</label><textarea name="address" value={form.address} onChange={onChange} className="input resize-none" rows={2}/></div>
        </div>
      </div>
      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">CRM details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {select('Course type','course_type',[['full','Full course'],['short','Short course']])}
          {select('Lead source','lead_source',[['walk_in','Walk-in'],['whatsapp','WhatsApp'],['referral','Referral'],['instagram','Instagram'],['google','Google'],['other','Other']])}
          {select('Lead status','lead_status',[['follow_up','Follow up'],['highly_interested','Highly interested'],['not_interested','Not interested'],['converted','Converted']])}
          {field('Follow-up date','follow_up_date','date')}
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea name="notes" value={form.notes} onChange={onChange} className="input resize-none" rows={2}/></div>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving?'Saving…':initial?'Update':'Add Inquiry'}</button>
      </div>
    </form>
  )
}
