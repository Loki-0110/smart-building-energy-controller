export const pick = (obj, ...keys) => {
  for (const key of keys) if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key]
  return undefined
}

export const number = (value, digits = 1) => {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(digits) : '—'
}

export const dateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString()
}

export const statusClass = (status = '') => {
  const s = String(status).toLowerCase()
  if (['open', 'detected', 'pending'].includes(s)) return 'status status-warning'
  if (['resolved', 'approved', 'valid'].includes(s)) return 'status status-success'
  if (['rejected', 'excluded', 'legacy_review', 'failed'].includes(s)) return 'status status-danger'
  if (['overridden'].includes(s)) return 'status status-info'
  return 'status'
}

export const rowsFrom = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.data)) return data.data
  return []
}
