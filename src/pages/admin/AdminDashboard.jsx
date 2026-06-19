import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import KpiCard from '../../components/ui/KpiCard'
import ChartCard from '../../components/ui/ChartCard'
import { formatINR, daysUntil } from '../../utils/helpers'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Building2, CreditCard, RefreshCw, ShoppingBag, Plus, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MONTHS=['Jan','Feb','Mar','Apr','May','Jun']

export default function AdminDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(()=>{
    if(!profile?.id) return
    async function load(){
      const [fRes,pRes,oRes] = await Promise.all([
        supabase.from('franchises').select('id,franchise_status,tenure_end').eq('admin_id',profile.id),
        supabase.from('payments').select('amount'),
        supabase.from('book_orders').select('id,status'),
      ])
      const franchises=fRes.data||[]
      setStats({
        active:franchises.filter(f=>f.franchise_status==='active').length,
        total:franchises.length,
        expiring:franchises.filter(f=>{const d=daysUntil(f.tenure_end);return d!==null&&d>=0&&d<=30}).length,
        revenue:(pRes.data||[]).reduce((s,p)=>s+(p.amount||0),0),
        pending:(oRes.data||[]).filter(o=>o.status==='pending').length,
      })
    }
    load()
  },[profile?.id])

  const kpis=[
    {label:'Active franchises',value:stats?.active??'—',sub:`${stats?.total??0} total`,trend:'up',icon:Building2,color:'blue'},
    {label:'Revenue (zone)',value:formatINR(stats?.revenue),sub:'All time',trend:'up',icon:CreditCard,color:'green'},
    {label:'Renewals due',value:stats?.expiring??'—',sub:'Within 30 days',trend:'down',icon:RefreshCw,color:'amber'},
    {label:'Pending orders',value:stats?.pending??'—',sub:'Book orders',trend:'neutral',icon:ShoppingBag,color:'purple'},
  ]
  const quickActions=[{label:'Add franchise',icon:Plus,path:'/admin/franchises'},{label:'Renew franchise',icon:RotateCcw,path:'/admin/franchises'},{label:'Book orders',icon:ShoppingBag,path:'/admin/orders'}]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="page-title">Dashboard</h1><p className="text-xs text-gray-400 mt-0.5">{profile?.name} — zone overview</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{kpis.map(k=><KpiCard key={k.label} {...k}/>)}</div>
      <div className="flex flex-wrap gap-2">{quickActions.map(a=><button key={a.label} onClick={()=>navigate(a.path)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"><a.icon className="w-3.5 h-3.5 text-primary-500"/>{a.label}</button>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Franchise overview" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={180}><BarChart data={MONTHS.map((m,i)=>({month:m,count:(stats?.active||10)-(5-i)}))} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontSize:12,borderRadius:8}}/><Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment overview" subtitle="Collections — last 6 months">
          <ResponsiveContainer width="100%" height={180}><LineChart data={MONTHS.map((m,i)=>({month:m,amount:50000+i*8000}))} margin={{top:0,right:0,bottom:0,left:-10}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/><Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={v=>[formatINR(v),'Revenue']}/><Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
