import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Building2, Users, CreditCard, BookOpen, ShoppingBag, BarChart3, ClipboardList, Bell, UserCircle, UserPlus, GraduationCap, DollarSign, BookMarked, LogOut } from 'lucide-react'

const NAV = {
  super_admin: [
    { to: '/superadmin',            icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/superadmin/franchises', icon: Building2,       label: 'Franchises'   },
    { to: '/superadmin/admins',     icon: Users,           label: 'Admins'       },
    { to: '/superadmin/payments',   icon: CreditCard,      label: 'Payments'     },
    { to: '/superadmin/resources',  icon: BookOpen,        label: 'Resources'    },
    { to: '/superadmin/orders',     icon: ShoppingBag,     label: 'Book Orders'  },
    { to: '/superadmin/rankings',   icon: BarChart3,       label: 'Rankings'     },
    { to: '/superadmin/audit',      icon: ClipboardList,   label: 'Audit Logs'   },
  ],
  admin: [
    { to: '/admin',                  icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/admin/franchises',       icon: Building2,       label: 'Franchises'   },
    { to: '/admin/payments',         icon: CreditCard,      label: 'Payments'     },
    { to: '/admin/orders',           icon: ShoppingBag,     label: 'Book Orders'  },
    { to: '/admin/notifications',    icon: Bell,            label: 'Notifications'},
    { to: '/admin/profile',          icon: UserCircle,      label: 'Profile'      },
  ],
  franchise: [
    { to: '/franchise',              icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/franchise/inquiries',    icon: UserPlus,        label: 'Inquiries'    },
    { to: '/franchise/admissions',   icon: GraduationCap,   label: 'Admissions'   },
    { to: '/franchise/fees',         icon: DollarSign,      label: 'Fees'         },
    { to: '/franchise/resources',    icon: BookMarked,      label: 'Resources'    },
    { to: '/franchise/orders',       icon: ShoppingBag,     label: 'Book Orders'  },
    { to: '/franchise/profile',      icon: UserCircle,      label: 'Profile'      },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const navItems = NAV[profile?.role] || []

  async function handleLogout() { await signOut(); navigate('/login') }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Vedic CRM</p>
            <p className="text-[10px] text-gray-400 capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={['/superadmin','/admin','/franchise'].includes(item.to)} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
              {(profile?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{profile?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
