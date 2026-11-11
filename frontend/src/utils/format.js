
export const pick = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key]
    }
  }
  return undefined
}

export const number = (value, digits = 1) => {
  const n = Number(value)

  return value === null ||
    value === undefined ||
    value === '' ||
    !Number.isFinite(n)
    ? '—'
    : n.toFixed(digits)
}

// Format timezone-less API timestamps as IST.
export const dateTime = value => {
  if (!value) return '—'

  const timestamp = String(value).trim()

  // Detect timestamps that already contain a timezone.
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp)

  const normalized = timestamp.includes('T')
    ? timestamp
    : timestamp.replace(' ', 'T')

  // Spring Boot LocalDateTime values represent IST in this application.
  const date = new Date(
    hasTimezone
      ? normalized
      : `${normalized}+05:30`
  )

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export const dateInput = value =>
  value ? String(value).slice(0, 16) : ''

export const statusClass = (status = '') => {
  const s = String(status).toLowerCase()

  if (
    ['open', 'detected', 'pending', 'on', 'active', 'occupied'].includes(s)
  ) {
    return 'status status-warning'
  }

  if (
    ['resolved', 'approved', 'valid', 'true', 'available'].includes(s)
  ) {
    return 'status status-success'
  }

  if (
    ['rejected', 'excluded', 'legacy_review', 'failed', 'off', 'false'].includes(s)
  ) {
    return 'status status-danger'
  }

  if (['overridden', 'reduce'].includes(s)) {
    return 'status status-info'
  }

  return 'status'
}

export const rowsFrom = data =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
        ? data.data
        : []

export const localDateTimeNow = () => {
  const date = new Date()

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())

  return date.toISOString().slice(0, 16)
}
