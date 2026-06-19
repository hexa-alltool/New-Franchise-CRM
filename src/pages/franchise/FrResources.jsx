import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { FileText, Video, BookOpen, ExternalLink, Lock } from 'lucide-react'
import Badge from '../../components/ui/Badge'

export default function FrResources() {
  const { profile } = useAuth()
  const [resources, setResources] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all')

  useEffect(()=>{
    if(!profile?.franchise_id) return
    supabase.from('resources').select('*').eq('is_active',true).order('created_at',{ascending:false})
      .then(({data})=>{ setResources(data||[]); setLoading(false) })
  },[profile?.franchise_id])

  const typeConfig={ video:{icon:Video,bg:'bg-red-100',text:'text-red-600',label:'Video'}, pdf:{icon:FileText,bg:'bg-blue-100',text:'text-blue-600',label:'PDF'}, ppt:{icon:BookOpen,bg:'bg-orange-100',text:'text-orange-600',label:'PPT'} }
  const filtered = filter==='all' ? resources : resources.filter(r=>r.type===filter)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="page-title">Learning resources</h1><p className="text-xs text-gray-400">{filtered.length} resources</p></div></div>
      <div className="flex gap-2">{[['all','All'],['video','Videos'],['pdf','PDFs'],['ppt','PPTs']].map(([k,lbl])=><button key={k} onClick={()=>setFilter(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter===k?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{lbl}</button>)}</div>
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(6)].map((_,i)=><div key={i} className="card p-4 h-28 animate-pulse bg-gray-100"/>)}</div>
      : filtered.length===0 ? <div className="card p-10 text-center"><Lock className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">Koi resource nahi</p><p className="text-xs text-gray-400 mt-1">Admin se request karo</p></div>
      : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{filtered.map(r=>{
          const cfg=typeConfig[r.type]||typeConfig.pdf, Icon=cfg.icon
          return (
            <div key={r.id} className="card p-4 hover:border-primary-200 transition-colors">
              <div className="flex items-start gap-3 mb-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}><Icon className={`w-5 h-5 ${cfg.text}`}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 line-clamp-2">{r.title}</p><Badge label={cfg.label} variant={r.type==='video'?'danger':r.type==='ppt'?'warning':'info'}/></div></div>
              {r.description&&<p className="text-xs text-gray-500 line-clamp-2 mb-3">{r.description}</p>}
              {r.file_url?<a href={r.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"><ExternalLink className="w-3.5 h-3.5"/>{r.type==='video'?'Watch':'Open'} {cfg.label}</a>:<p className="text-xs text-gray-400">Coming soon</p>}
            </div>
          )
        })}</div>}
    </div>
  )
}
