import { Search } from 'lucide-react'

export default function DataTable({ columns, rows = [], empty = 'No records found.', search = '' }) {
  const filtered = search ? rows.filter(row => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())) : rows
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
    <tbody>{filtered.length ? filtered.map((row,i) => <tr key={`${row.id ?? row.buildingId ?? row.equipmentId ?? row.readingId ?? row.occupancyId ?? row.configId ?? row.eventId ?? row.scheduleId ?? 'row'}-${i}`}>
      {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>)}</tr>) :
      <tr><td colSpan={columns.length} className="empty-cell"><Search size={18}/><span>{search ? 'No matching records.' : empty}</span></td></tr>}</tbody></table></div>
}
