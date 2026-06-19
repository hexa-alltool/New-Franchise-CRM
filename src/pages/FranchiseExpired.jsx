import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, PhoneCall, LogOut } from 'lucide-react'

export default function FranchiseExpired() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  async function handleLogout() { await signOut(); navigate('/login') }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="card p-8 shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Franchise Expired</h1>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-700">{profile?.name}</span> ka franchise tenure khatam ho gaya hai. Admin se contact karke renew karwao.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-medium text-amber-700 mb-1">Renewal ke liye:</p>
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <PhoneCall className="w-4 h-4 flex-shrink-0" />
              <span>Apne zone admin ya head office se baat karein</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
