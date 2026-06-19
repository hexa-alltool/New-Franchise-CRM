import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/helpers'
import Badge from '../../components/ui/Badge'
import { ClipboardList } from 'lucide-react'

export default function AuditLogs() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    supabase.from('audit_logs').select('*,user:profiles(name,role)').order('created_at',{ascending:false}).limit(100)
      .then(({data})=>{ setLogs(data||[]); setLoading(false) })
  },[])

  const actionVariant={insert:'active',update:'warning',delete:'expired'}

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary-500"/><h1 className="page-title">Audit logs</h1></div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead><tr className="bg-gray-50 border-b border-gray-100">{['User','Action','Table','Record','Time'].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(8)].map((_,i)=><tr key={i}>{[...Array(5)].map((__,j)=><td key={j} className="px-4 py-3"><div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"/></td>)}</tr>)
              : logs.length===0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No logs yet</td></tr>
              : logs.map(log=>(
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="text-sm font-medium">{log.user?.name||'—'}</p><p className="text-xs text-gray-400 capitalize">{log.user?.role?.replace('_',' ')}</p></td>
                  <td className="px-4 py-3"><Badge label={log.action} variant={actionVariant[log.action]||'gray'}/></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.table_name}</td>
                  <td className="px-4 py-3"><span className="text-xs font-mono text-gray-400">{log.record_id?.slice(0,8)}…</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
