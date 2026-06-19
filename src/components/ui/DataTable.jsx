import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export default function DataTable({ columns, data, searchKeys=[], loading=false, actions, emptyText='Koi data nahi mila' }) {
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const perPage = 10

  const filtered = data.filter(row => !search || searchKeys.some(k => String(row[k]||'').toLowerCase().includes(search.toLowerCase())))
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated  = filtered.slice((page-1)*perPage, page*perPage)

  return (
    <div className="card overflow-hidden">
      {searchKeys.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search…" className="input pl-8 py-1.5 text-xs" />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map(col => <th key={col.key} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{col.label}</th>)}
              {actions && <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_,i)=>(
              <tr key={i}>{columns.map(col=><td key={col.key} className="px-4 py-3"><div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"/></td>)}{actions&&<td/>}</tr>
            )) : paginated.length===0 ? (
              <tr><td colSpan={columns.length+(actions?1:0)} className="px-4 py-10 text-center text-sm text-gray-400">{emptyText}</td></tr>
            ) : paginated.map((row,i)=>(
              <tr key={row.id||i} className="hover:bg-gray-50 transition-colors">
                {columns.map(col=><td key={col.key} className="px-4 py-3 text-sm text-gray-700">{col.render?col.render(row[col.key],row):(row[col.key]??'—')}</td>)}
                {actions && <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1">{actions(row)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages>1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">{(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded text-gray-400 hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
            <span className="text-xs text-gray-600 px-2">{page}/{totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1 rounded text-gray-400 hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      )}
    </div>
  )
}
