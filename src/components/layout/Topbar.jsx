import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { Bell, LogOut, User, Menu, X } from 'lucide-react'
import { getInitials, roleLabel } from '../../utils/helpers'

export default function Topbar({ onMenuToggle, menuOpen }) {
  const { profile, signOut } = useAuth()
  const { unread }           = useNotifications()
  const navigate             = useNavigate()
  const [drop, setDrop]      = useState(false)

  async function handleLogout() { await signOut(); navigate('/login') }

  const notifPath = profile?.role === 'super_admin' ? '/superadmin/notifications'
    : profile?.role === 'admin' ? '/admin/notifications' : '/franchise/notifications'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="text-sm font-semibold text-primary-700 hidden sm:block">Vedic Maths CRM</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(notifPath)} className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <div className="relative">
          <button onClick={() => setDrop(d => !d)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(profile?.name || 'U')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-gray-800 leading-none">{profile?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{roleLabel(profile?.role)}</p>
            </div>
          </button>
          {drop && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-800">{profile?.name}</p>
                <p className="text-[10px] text-gray-400">{profile?.email}</p>
              </div>
              <button onClick={() => { setDrop(false); navigate(`/${(profile?.role||'franchise').replace('super_admin','superadmin').replace('_','')}/profile`) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50">
                <User className="w-3.5 h-3.5" /> Profile
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
