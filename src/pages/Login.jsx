import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, BookOpen } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function onChange(e) { setForm(f=>({...f,[e.target.name]:e.target.value})); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Email aur password zaroori hain'); return }
    setLoading(true)
    try {
      const { user } = await signIn(form.email, form.password)
      setTimeout(async () => {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const map = { super_admin: '/superadmin', admin: '/admin', franchise: '/franchise' }
        navigate(map[data?.role] || '/franchise')
      }, 800)
    } catch {
      setError('Email ya password galat hai.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vedic Maths CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Apne account mein login karein</p>
        </div>
        <div className="card p-6 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="input" placeholder="aapka@email.com" autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} name="password" value={form.password} onChange={onChange} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={()=>setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2"><p className="text-xs text-red-600">{error}</p></div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Login ho raha hai…</span>
                : 'Login'
              }
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Super Admin · Admin · Franchise — sabka ek hi login</p>
      </div>
    </div>
  )
}
