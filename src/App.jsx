import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar    from './components/layout/Sidebar'
import Topbar     from './components/layout/Topbar'
import MobileNav  from './components/layout/MobileNav'

import Login            from './pages/Login'
import FranchiseExpired from './pages/FranchiseExpired'

import SADashboard   from './pages/superadmin/SADashboard'
import FranchiseList from './pages/superadmin/FranchiseList'
import AdminUsers    from './pages/superadmin/AdminUsers'
import SAPayments    from './pages/superadmin/SAPayments'
import Resources     from './pages/superadmin/Resources'
import BookOrders    from './pages/superadmin/BookOrders'
import Rankings      from './pages/superadmin/Rankings'
import AuditLogs     from './pages/superadmin/AuditLogs'

import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminFranchise  from './pages/admin/AdminFranchise'
import AdminPayments   from './pages/admin/AdminPayments'
import AdminBookOrders from './pages/admin/AdminBookOrders'
import Notifications   from './pages/admin/Notifications'
import Profile         from './pages/admin/Profile'

import FrDashboard   from './pages/franchise/FrDashboard'
import InquiryList   from './pages/franchise/InquiryList'
import AdmissionList from './pages/franchise/AdmissionList'
import FeeManagement from './pages/franchise/FeeManagement'
import FrResources   from './pages/franchise/FrResources'
import FrBookOrders  from './pages/franchise/FrBookOrders'

function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={menuOpen} onClose={()=>setMenuOpen(false)}/>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuToggle={()=>setMenuOpen(o=>!o)} menuOpen={menuOpen}/>
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">{children}</main>
        <MobileNav/>
      </div>
    </div>
  )
}

function RoleRedirect() {
  const { profile, loading } = useAuth()
  if(loading) return null
  if(!profile) return <Navigate to="/login" replace/>
  const map = { super_admin:'/superadmin', admin:'/admin', franchise:'/franchise' }
  return <Navigate to={map[profile.role]||'/login'} replace/>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"   element={<Login/>}/>
          <Route path="/expired" element={<FranchiseExpired/>}/>
          <Route path="/"        element={<RoleRedirect/>}/>

          <Route path="/superadmin/*" element={<ProtectedRoute allowedRoles={['super_admin']}><AppShell><Routes>
            <Route index              element={<SADashboard/>}/>
            <Route path="franchises"  element={<FranchiseList/>}/>
            <Route path="admins"      element={<AdminUsers/>}/>
            <Route path="payments"    element={<SAPayments/>}/>
            <Route path="resources"   element={<Resources/>}/>
            <Route path="orders"      element={<BookOrders/>}/>
            <Route path="rankings"    element={<Rankings/>}/>
            <Route path="audit"       element={<AuditLogs/>}/>
            <Route path="profile"     element={<Profile/>}/>
            <Route path="notifications" element={<Notifications/>}/>
          </Routes></AppShell></ProtectedRoute>}/>

          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AppShell><Routes>
            <Route index                element={<AdminDashboard/>}/>
            <Route path="franchises"    element={<AdminFranchise/>}/>
            <Route path="payments"      element={<AdminPayments/>}/>
            <Route path="orders"        element={<AdminBookOrders/>}/>
            <Route path="notifications" element={<Notifications/>}/>
            <Route path="profile"       element={<Profile/>}/>
          </Routes></AppShell></ProtectedRoute>}/>

          <Route path="/franchise/*" element={<ProtectedRoute allowedRoles={['franchise']}><AppShell><Routes>
            <Route index                 element={<FrDashboard/>}/>
            <Route path="inquiries"      element={<InquiryList/>}/>
            <Route path="inquiries/new"  element={<InquiryList/>}/>
            <Route path="admissions"     element={<AdmissionList/>}/>
            <Route path="admissions/new" element={<AdmissionList/>}/>
            <Route path="fees"           element={<FeeManagement/>}/>
            <Route path="resources"      element={<FrResources/>}/>
            <Route path="orders"         element={<FrBookOrders/>}/>
            <Route path="profile"        element={<Profile/>}/>
            <Route path="notifications"  element={<Notifications/>}/>
          </Routes></AppShell></ProtectedRoute>}/>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
