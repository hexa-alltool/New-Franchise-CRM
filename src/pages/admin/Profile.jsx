import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { getInitials, roleLabel } from '../../utils/helpers'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { profile, fetchProfile, user } = useAuth()
  const [tab,    setTab]    = useState('profile')
  const [form,   setForm]   = useState({ name:profile?.name||'', mobile:profile?.mobile||'', city:profile?.city||'' })
  const [pwForm, setPwForm] = useState({ newPw:'', confirm:'' })
  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState('')
  const [error,  setError]  = useState('')
  const [showPw, setShowPw] = useState({ newPw:false, confirm:false })

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  async function handleProfileSave(e){
    e.preventDefault(); setSaving(true)
    try { await supabase.from('profiles').update({name:form.name,mobile:form.mobile,city:form.city}).eq('id',profile.id); await fetchProfile(user.id); showToast('Profile updated!') }
    catch(e){setError(e.message)} finally{setSaving(false)}
  }

  async function handlePasswordChange(e){
    e.preventDefault(); setError('')
    if(pwForm.newPw!==pwForm.confirm){setError('Passwords match nahi');return}
    if(pwForm.newPw.length<6){setError('Min 6 characters');return}
    setSaving(true)
    try { await supabase.auth.updateUser({password:pwForm.newPw}); setPwForm({newPw:'',confirm:''}); showToast('Password changed!') }
    catch(e){setError(e.message)} finally{setSaving(false)}
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg space-y-4">
      <h1 className="page-title">Profile</h1>
      <div className="card p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">{getInitials(profile?.name||'U')}</div>
        <div><p className="font-semibold text-gray-900">{profile?.name}</p><p className="text-xs text-gray-400">{profile?.email}</p><span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">{roleLabel(profile?.role)}</span></div>
      </div>
      <div className="flex gap-2">
        {[['profile','Profile',User],['password','Password',Lock]].map(([k,lbl,Icon])=>(
          <button key={k} onClick={()=>{setTab(k);setError('')}} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${tab===k?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}><Icon className="w-3.5 h-3.5"/>{lbl}</button>
        ))}
      </div>
      {tab==='profile'&&<div className="card p-5">
        <form onSubmit={handleProfileSave} className="space-y-3">
          {[['Full name *','name','text'],['Mobile','mobile','tel'],['City','city','text']].map(([lbl,name,type])=>(
            <div key={name}><label className="label">{lbl}</label><input type={type} required={lbl.includes('*')} className="input" value={form[name]} onChange={e=>setForm(f=>({...f,[name]:e.target.value}))}/></div>
          ))}
          <div><label className="label">Email</label><input type="email" className="input bg-gray-50 cursor-not-allowed" value={profile?.email||''} disabled/><p className="text-xs text-gray-400 mt-0.5">Email change nahi ho sakta</p></div>
          {error&&<p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5"><Save className="w-3.5 h-3.5"/>{saving?'Saving…':'Save changes'}</button>
        </form>
      </div>}
      {tab==='password'&&<div className="card p-5">
        <form onSubmit={handlePasswordChange} className="space-y-3">
          {[['New password *','newPw'],['Confirm password *','confirm']].map(([lbl,key])=>(
            <div key={key}><label className="label">{lbl}</label><div className="relative"><input type={showPw[key]?'text':'password'} className="input pr-10" value={pwForm[key]} onChange={e=>setPwForm(f=>({...f,[key]:e.target.value}))}/><button type="button" onClick={()=>setShowPw(s=>({...s,[key]:!s[key]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw[key]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
          ))}
          {error&&<p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5"><Lock className="w-3.5 h-3.5"/>{saving?'Changing…':'Change password'}</button>
        </form>
      </div>}
      {toast&&<div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}
    </div>
  )
}
