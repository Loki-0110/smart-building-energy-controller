import { NavLink } from 'react-router-dom'
import { Activity, Building2, Cpu, Gauge, LayoutDashboard, Settings, Waves, ClipboardCheck, Zap, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/buildings', label: 'Buildings', icon: Building2 },
  { to: '/equipment', label: 'Equipment', icon: Cpu },
  { to: '/readings', label: 'Meter readings', icon: Gauge },
  { to: '/events', label: 'Peak events', icon: Zap },
  { to: '/schedules', label: 'Load approvals', icon: ClipboardCheck },
  { to: '/configuration', label: 'Configuration', icon: Settings }
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`mobile-shade ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Waves size={22} /></div>
          <div><strong>Gridwise</strong><span>Energy controller</span></div>
          <button className="icon-button mobile-close" onClick={onClose}><X size={19}/></button>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={18}/><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-indicator"><span className="pulse-dot"/> Simulation environment</div>
          <small>Smart Building Energy<br/>Peak-Shaving Controller</small>
        </div>
      </aside>
    </>
  )
}
