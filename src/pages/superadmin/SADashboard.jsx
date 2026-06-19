import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import KpiCard   from '../../components/ui/KpiCard'
import ChartCard from '../../components/ui/ChartCard'
import { formatINR, daysUntil } from '../../utils/helpers'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Building2, CreditCard, TrendingUp, RefreshCw, Plus, UserPlus, Upload, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun']

export default function SADashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  const growthData    = MONTHS.map((m,i) => ({ month:m, franchises:210+i*15 }))
  const revenueData   = MONTHS.map((m,i) => ({ month:m, revenue:380000+i*42000 }))
  const paymentStatus = [{name:'Paid',value:184,color:'#22c55e'},{name:'Overdue',value:38,color:'#ef4444'},{name:'Upcoming',value:62,color:'#f59e0b'}]

  useEffect(() => {
    async function load() {
      const [fRes,pRes] = await Promise.all([supabase.from('franchises').select('id,franchise_status,tenure_end'),supabase.from('payments').select('amount')])
      const franchises = fRes.data||[]
      setStats({ active:franchises.filter(f=>f.franchise_status==='active').length, revenue:(pRes.data||[]).reduce((s,p)=>s+(p.amount||0),0), expiring:franchises.filter(f=>{const d=daysUntil(f.tenure_end);return d!==null&&d>=0&&d<=30}).length })
    }
    load()
  },[])

  const kpis = [
    {label:'Active franchises',value:stats?.active??'—',      sub:'+12 this month',   trend:'up',   icon:Building2, color:'blue'  },
    {label:'Total revenue',    value:formatINR(stats?.revenue),sub:'↑ 18% vs last yr', trend:'up',   icon:TrendingUp,color:'green' },
    {label:'Fees due',         value:'₹4.2L',                  sub:'38 overdue',        trend:'down', icon:CreditCard,color:'red'   },
    {label:'Renewals due',     value:stats?.expiring??'—',     sub:'7 within 7 days',  trend:'down', icon:RefreshCw, color:'amber' },
  ]
  const quickActions = [{label:'Add franchise',icon:Plus,path:'/superadmin/franchises'},{label:'Add admin',icon:UserPlus,path:'/superadmin/admins'},{label:'Upload resource',icon:Upload,path:'/superadmin/resources'},{label:'Notification',icon:Bell,path:'/superadmin/notifications'}]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div><h1 className="page-title">Dashboard</h1><p className="text-xs text-gray-400 mt-0.5">Saare franchises ka overview</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{kpis.map(k=><KpiCard key={k.label} {...k}/>)}</div>
      <div>
        <p className="section-title mb-2">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(a=><button key={a.label} onClick={()=>navigate(a.path)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"><a.icon className="w-3.5 h-3.5 text-primary-500"/>{a.label}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Franchise growth" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={180}><BarChart data={growthData} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontSize:12,borderRadius:8,border:'1px solid #e5e7eb'}}/><Bar dataKey="franchises" fill="#6366f1" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue collection" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={180}><LineChart data={revenueData} margin={{top:0,right:0,bottom:0,left:-10}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/><Tooltip contentStyle={{fontSize:12,borderRadius:8}} formatter={v=>[formatINR(v),'Revenue']}/><Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment status" subtitle="Current distribution">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}><PieChart><Pie data={paymentStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">{paymentStatus.map((_,i)=><Cell key={i} fill={paymentStatus[i].color}/>)}</Pie><Tooltip contentStyle={{fontSize:12,borderRadius:8}}/></PieChart></ResponsiveContainer>
            <div className="space-y-2">{paymentStatus.map(s=><div key={s.name} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{background:s.color}}/><span className="text-xs text-gray-600">{s.name}</span><span className="text-xs font-semibold ml-auto pl-3">{s.value}</span></div>)}</div>
          </div>
        </ChartCard>
        <ChartCard title="Renewal overview"><ResponsiveContainer width="100%" height={180}><BarChart data={MONTHS.map((m,i)=>({month:m,renewals:[8,5,12,3,7,9][i]}))} margin={{top:0,right:0,bottom:0,left:-20}}><XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="renewals" fill="#f59e0b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
      </div>
    </div>
  )
}
