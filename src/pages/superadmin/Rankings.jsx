import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatINR } from '../../utils/helpers'
import { Trophy } from 'lucide-react'

export default function Rankings() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('revenue')

  useEffect(()=>{
    async function load(){
      setLoading(true)
      const [fRes,pRes,iRes,aRes] = await Promise.all([
        supabase.from('franchises').select('id,name,city'),
        supabase.from('payments').select('franchise_id,amount'),
        supabase.from('inquiries').select('franchise_id'),
        supabase.from('admissions').select('franchise_id'),
      ])
      const franchises = fRes.data||[]
      const ranked = franchises.map(f=>({
        ...f,
        revenue:(pRes.data||[]).filter(p=>p.franchise_id===f.id).reduce((s,p)=>s+(p.amount||0),0),
        inquiries:(iRes.data||[]).filter(i=>i.franchise_id===f.id).length,
        admissions:(aRes.data||[]).filter(a=>a.franchise_id===f.id).length,
      })).sort((a,b)=>b[tab]-a[tab]).slice(0,10)
      setData(ranked); setLoading(false)
    }
    load()
  },[tab])

  const medals=['🥇','🥈','🥉']
  const max = data[0]?.[tab]||1

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500"/><h1 className="page-title">Top 10 franchises</h1></div>
      <div className="flex gap-2">
        {[['revenue','Revenue'],['inquiries','Inquiries'],['admissions','Admissions']].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab===k?'bg-primary-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{lbl}</button>
        ))}
      </div>
      <div className="card divide-y divide-gray-50">
        {loading ? [...Array(5)].map((_,i)=><div key={i} className="p-4 flex gap-3"><div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"/><div className="flex-1 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"/><div className="h-2 bg-gray-100 rounded w-1/2 animate-pulse"/></div></div>)
          : data.map((f,i)=>(
          <div key={f.id} className="p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i===0?'bg-amber-100 text-amber-700':i===1?'bg-gray-100 text-gray-600':i===2?'bg-orange-100 text-orange-600':'bg-gray-50 text-gray-400'}`}>{i<3?medals[i]:i+1}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{f.name}</p><p className="text-xs text-gray-400">{f.city}</p></div>
            <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
              <p className="text-sm font-bold text-gray-900">{tab==='revenue'?formatINR(f[tab]):f[tab]}</p>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{width:`${Math.round((f[tab]/max)*100)}%`}}/></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
