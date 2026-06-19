import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import DataTable from '../../components/ui/DataTable'
import KpiCard from '../../components/ui/KpiCard'
import Badge from '../../components/ui/Badge'
import { formatINR, formatDate } from '../../utils/helpers'
import { CreditCard, TrendingUp, AlertTriangle } from 'lucide-react'

export default function AdminPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(()=>{
    if(!profile?.id) return
    supabase.from('payments').select('*,franchise:franchises(name,city)').order('payment_date',{ascending:false})
      .then(({data})=>{ setPayments(data||[]); setLoading(false) })
  },[profile?.id])

  const total = payments.reduce((s,p)=>s+(p.amount||0),0)
  const thisMonth = payments.filter(p=>{ const d=new Date(p.payment_date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear() }).reduce((s,p)=>s+(p.amount||0),0)

  const columns=[
    {key:'franchise',label:'Franchise',render:v=><div><p className="font-medium text-sm">{v?.name}</p><p className="text-xs text-gray-400">{v?.city}</p></div>},
    {key:'amount',label:'Amount',render:v=><span className="font-semibold text-green-700">{formatINR(v)}</span>},
    {key:'payment_date',label:'Date',render:v=>formatDate(v)},
    {key:'payment_mode',label:'Mode',render:v=><Badge label={v?.replace('_',' ')} variant="info"/>},
    {key:'transaction_ref',label:'Ref',render:v=><span className="text-xs text-gray-400 font-mono">{v||'—'}</span>},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="page-title">Payments</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard label="Total collected" value={formatINR(total)} icon={CreditCard} color="green"/>
        <KpiCard label="This month" value={formatINR(thisMonth)} icon={TrendingUp} color="blue"/>
        <KpiCard label="Transactions" value={payments.length} icon={AlertTriangle} color="purple"/>
      </div>
      <DataTable columns={columns} data={payments} loading={loading} searchKeys={['transaction_ref']} emptyText="Koi payment nahi"/>
    </div>
  )
}
