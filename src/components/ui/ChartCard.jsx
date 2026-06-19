import React from 'react'
export default function ChartCard({ title, subtitle, children, className='' }) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
