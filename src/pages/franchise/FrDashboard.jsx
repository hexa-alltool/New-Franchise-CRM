import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import KpiCard from '../../components/ui/KpiCard'
import ChartCard from '../../components/ui/ChartCard'
import { formatINR, daysUntil } from '../../utils/helpers'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { UserPlus, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MONTHS=['Jan','Feb','Mar','Apr','May','Jun']
const LEAD_COLORS=['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6']

export default function FrDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(()=>{
    if(!profile?.franchise_id) return
    async function load(){
      const fid=profile.franchise_id
      const [iRes,aRes,fpRes] = await Promise.all([
        supabase.from('inquiries').select('id,lead_source,created_at,lead_status').eq('franchise_id',fid),
        supabase.from('admissions').select('id,total_fees,paid_fees,created_at').eq('franchise_id',fid),
        supabase.from('fee_payments').select('amount,payment_date').eq('franchise_id',fid),
      ])
      const inquiries=iRes.data||[], admissions=aRes.data||[], feePayments=fpRes.data||[]
      const sourceMap={}; inquiries.forEach(i=>{ const s=i.lead_source||'other'; sourceMap[s]=(sourceMap[s]||0)+1 })
      setStats({
        totalInquiries:inquiries.length, totalAdmissions:admissions.length,
        duesFees:admissions.reduce((s,a)=>s+(a.total_fees||0),0)-admissions.reduce((s,a)=>s+(a.paid_fees||0),0),
        revenue:feePayments.reduce((s,p)=>s+(p.amount||0),0),
        leadSources:Object.entries(sourceMap).map(([name,value])=>({name,value})),
        monthlyData:MONTHS.map((month,idx)=>({ month, inquiries:inquiries.filter(i=>new Date(i.created_at).getMonth()===idx).length, admissions:admissions.filter(a=>new Date(a.created_at).getMonth()===idx).length })),
        revenueData:MONTHS.map((month,idx)=>({ month, revenue:feePayments.filter(p=>new Date(p.payment_date).getMonth()===idx).reduce((s,p)=>s+(p.amount||0),0) })),
        converted:inquiries.filter(i=>i.lead_status==='converted').length,
      })
    }
    load()
  },[profile?.franchise_id])

  const kpis=[
    {label:'Total inquiries', value:stats?.totalInquiries??'—',sub:`${stats?.converted??0} converted`,trend:'up',icon:UserPlus,color:'blue'},
    {label:'Admissions',      value:stats?.totalAdmissions??'—',sub:'Total students',              trend:'up',icon:GraduationCap,color:'green'},
    {label:'Fees due',        value:formatINR(stats?.duesFees),   sub:'Pending',                  trend:'down',icon:AlertTriangle,color:'red'},
    {label:'Revenue',         value:formatINR(stats?.revenue),    sub:'Collected',                trend:'up',icon:TrendingUp,color:'purple'},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="page-title">Dashboard</h1><p className="text-xs text-gray-400">Aapki franchise ka overview</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{kpis.map(k=><KpiCard key={k.label} {...k}/>)}</div>
      <div className="flex flex-wrap gap-2">
        {[['Add inquiry','/franchise/inquiries','bg-primary-600 text-white'],['Add admission','/franchise/admissions','bg-green-600 text-white'],['Book order','/franchise/orders','bg-white border border-gray-200 text-gray-700']].map(([lbl,path,cls])=>(
          <button key={lbl} onClick={()=>navigate(path)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${cls}`}>{lbl}</button>
        ))}
      </div>
      {stats&&<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Inquiry vs admission" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={180}><BarChart data={stats.monthlyData} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontSize:12,borderRadius:8}}/><Bar dataKey="inquiries" fill="#6366f1" radius={[4,4,0,0]} name="Inquiries"/><Bar dataKey="admissions" fill="#22c55e" radius={[4,4,0,0]} name="Admissions"/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue" subtitle="Monthly collections">
          <ResponsiveContainer width="100%" height={180}><LineChart data={stats.revenueData} margin={{top:0,right:0,bottom:0,left:-10}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/><Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={v=>[formatINR(v),'Revenue']}/><Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer>
        </ChartCard>
        {stats.leadSources.length>0&&<ChartCard title="Lead sources"><div className="flex items-center gap-4"><ResponsiveContainer width="50%" height={160}><PieChart><Pie data={stats.leadSources} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">{stats.leadSources.map((_,i)=><Cell key={i} fill={LEAD_COLORS[i%LEAD_COLORS.length]}/>)}</Pie><Tooltip contentStyle={{fontSize:12,borderRadius:8}}/></PieChart></ResponsiveContainer><div className="space-y-1.5">{stats.leadSources.map((s,i)=><div key={s.name} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{background:LEAD_COLORS[i%LEAD_COLORS.length]}}/><span className="text-xs text-gray-600 capitalize">{s.name.replace('_',' ')}</span><span className="text-xs font-semibold ml-auto pl-2">{s.value}</span></div>)}</div></div></ChartCard>}
      </div>}
    </div>
  )
}
