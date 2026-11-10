import { Menu, Bell, CircleHelp } from 'lucide-react'
export default function Topbar({ title, subtitle, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu}><Menu size={21}/></button>
      <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="topbar-actions">
        <span className="environment-pill"><span className="pulse-dot"/> Simulation</span>
        <button className="icon-button" title="Help"><CircleHelp size={19}/></button>
        <div className="avatar">OP</div>
      </div>
    </header>
  )
}
