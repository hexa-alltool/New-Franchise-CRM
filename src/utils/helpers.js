export function formatINR(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function roleLabel(role) {
  return { super_admin: 'Super Admin', admin: 'Admin', franchise: 'Franchise' }[role] || role
}

export function tenureStatus(expiryDate) {
  const days = daysUntil(expiryDate)
  if (days === null) return 'unknown'
  if (days < 0)   return 'expired'
  if (days <= 7)  return 'critical'
  if (days <= 30) return 'warning'
  return 'active'
}

export function truncate(str, n = 30) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}
