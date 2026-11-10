import { Menu } from 'lucide-react'
export default function Topbar({ title, subtitle, onMenu }) {
  return <header className="topbar">
    <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21}/></button>
    <div className="page-heading"><h1>{title}</h1><p>{subtitle}</p></div>
    <div className="topbar-actions"><span className="environment-pill"><span className="pulse-dot"/> API workspace</span><div className="avatar" title="Operator workspace">OP</div></div>
  </header>
}
