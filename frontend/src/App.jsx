import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Activity } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Buildings from './pages/Buildings'
import Equipment from './pages/Equipment'
import Readings from './pages/Readings'
import PeakEvents from './pages/PeakEvents'
import Schedules from './pages/Schedules'
import Configuration from './pages/Configuration'

const pageInfo = {
  '/': ['Overview', 'Monitor building energy demand and peak-shaving activity'],
  '/buildings': ['Buildings', 'Manage registered buildings'],
  '/equipment': ['Equipment', 'Review equipment status and eligibility'],
  '/readings': ['Meter readings', 'Inspect validated simulated energy readings'],
  '/events': ['Peak events', 'Track demand threshold events and their lifecycle'],
  '/schedules': ['Load approvals', 'Review and action recommended load schedules'],
  '/configuration': ['Configuration', 'Manage peak-demand thresholds']
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const [title, subtitle] = pageInfo[location.pathname] || pageInfo['/']
  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-area">
        <Topbar title={title} subtitle={subtitle} onMenu={() => setMenuOpen(true)} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/buildings" element={<Buildings/>}/>
            <Route path="/equipment" element={<Equipment/>}/>
            <Route path="/readings" element={<Readings/>}/>
            <Route path="/events" element={<PeakEvents/>}/>
            <Route path="/schedules" element={<Schedules/>}/>
            <Route path="/configuration" element={<Configuration/>}/>
          </Routes>
        </div>
        <footer className="footer"><span><Activity size={14}/> Smart Building Energy Controller</span><span>Simulation only · No physical equipment control</span></footer>
      </main>
    </div>
  )
}
