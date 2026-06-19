import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Building2, UserPlus, GraduationCap, DollarSign, Bell, CreditCard } from 'lucide-react'

const MOBILE_NAV = {
  super_admin: [
    { to: '/superadmin',            icon: LayoutDashboard, label: 'Home'       },
    { to: '/superadmin/franchises', icon: Building2,       label: 'Franchises' },
    { to: '/superadmin/payments',   icon: CreditCard,      label: 'Payments'   },
  ],
  admin: [
    { to: '/admin',                  icon: LayoutDashboard, label: 'Home'       },
    { to: '/admin/franchises',       icon: Building2,       label: 'Franchises' },
    { to: '/admin/payments',         icon: CreditCard,      label: 'Payments'   },
    { to: '/admin/notifications',    icon: Bell,            label: 'Alerts'     },
  ],
  franchise: [
    { to: '/franchise',              icon: LayoutDashboard, label: 'Home'       },
    { to: '/franchise/inquiries',    icon: UserPlus,        label: 'Inquiries'  },
    { to: '/franchise/admissions',   icon: GraduationCap,   label: 'Admissions' },
    { to: '/franchise/fees',         icon: DollarSign,      label: 'Fees'       },
  ],
}

export default function MobileNav() {
  const { profile } = useAuth()
  const items = MOBILE_NAV[profile?.role] || []
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 lg:hidden">
      <div className="flex">
        {items.map(item => (
          <NavLink key={item.to} to={item.to} end={['/superadmin','/admin','/franchise'].includes(item.to)}
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
