import React from 'react'

const variants = {
  active:'bg-green-100 text-green-700', expired:'bg-red-100 text-red-700',
  warning:'bg-amber-100 text-amber-700', pending:'bg-blue-100 text-blue-700',
  suspended:'bg-gray-100 text-gray-600', paid:'bg-green-100 text-green-700',
  overdue:'bg-red-100 text-red-700', info:'bg-blue-100 text-blue-700',
  gray:'bg-gray-100 text-gray-600', danger:'bg-red-100 text-red-700',
}

export default function Badge({ label, variant = 'gray', dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]||variants.gray}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant==='active'||variant==='paid'?'bg-green-500':variant==='expired'||variant==='overdue'||variant==='danger'?'bg-red-500':variant==='warning'?'bg-amber-500':'bg-gray-400'}`} />}
      {label}
    </span>
  )
}
