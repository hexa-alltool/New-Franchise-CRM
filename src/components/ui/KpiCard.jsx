import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KpiCard({ label, value, sub, trend, icon: Icon, color = 'blue' }) {
  const colors = {
    blue:   { icon: 'bg-blue-100 text-blue-600'   },
    green:  { icon: 'bg-green-100 text-green-600' },
    amber:  { icon: 'bg-amber-100 text-amber-600' },
    red:    { icon: 'bg-red-100 text-red-600'     },
    purple: { icon: 'bg-purple-100 text-purple-600'},
  }
  const c = colors[color] || colors.blue
  return (
    <div className="card p-4 flex items-start gap-3">
      {Icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}><Icon className="w-5 h-5" /></div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {sub && (
          <div className="flex items-center gap-1 mt-0.5">
            {trend === 'up'   && <TrendingUp   className="w-3 h-3 text-green-500" />}
            {trend === 'down' && <TrendingDown  className="w-3 h-3 text-red-500"   />}
            {trend === 'neutral' && <Minus      className="w-3 h-3 text-gray-400"  />}
            <p className={`text-xs ${trend==='up'?'text-green-600':trend==='down'?'text-red-500':'text-gray-400'}`}>{sub}</p>
          </div>
        )}
      </div>
    </div>
  )
}
