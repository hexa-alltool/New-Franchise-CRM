import React from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDate } from '../../utils/helpers'
import { Bell, CheckCheck, CreditCard, RefreshCw, BookOpen, Package, Info } from 'lucide-react'

const typeConfig = {
  payment: { icon:CreditCard, bg:'bg-green-100',  color:'text-green-600'  },
  renewal: { icon:RefreshCw,  bg:'bg-amber-100',  color:'text-amber-600'  },
  resource:{ icon:BookOpen,   bg:'bg-blue-100',   color:'text-blue-600'   },
  order:   { icon:Package,    bg:'bg-purple-100', color:'text-purple-600' },
  system:  { icon:Info,       bg:'bg-gray-100',   color:'text-gray-600'   },
}

export default function Notifications() {
  const { notifications, unread, markRead, markAllRead } = useNotifications()
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500"/>
          <h1 className="page-title">Notifications</h1>
          {unread>0&&<span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-bold">{unread}</span>}
        </div>
        {unread>0&&<button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary-600 font-medium"><CheckCheck className="w-3.5 h-3.5"/> Mark all read</button>}
      </div>
      {notifications.length===0 ? (
        <div className="card p-10 text-center"><Bell className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400">Koi notification nahi</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n=>{
            const cfg=typeConfig[n.type]||typeConfig.system
            const Icon=cfg.icon
            return (
              <div key={n.id} onClick={()=>!n.is_read&&markRead(n.id)} className={`card p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 ${!n.is_read?'border-l-4 border-l-primary-400':''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}><Icon className={`w-4 h-4 ${cfg.color}`}/></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.is_read?'font-semibold text-gray-900':'font-medium text-gray-700'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(n.created_at)}</span>
                  </div>
                  {n.message&&<p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                  {!n.is_read&&<span className="inline-block mt-1.5 w-2 h-2 bg-primary-500 rounded-full"/>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
