import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (profile?.franchise_status === 'expired') return <Navigate to="/expired" replace />
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    const map = { super_admin: '/superadmin', admin: '/admin', franchise: '/franchise' }
    return <Navigate to={map[profile?.role] || '/login'} replace />
  }
  return children
}
